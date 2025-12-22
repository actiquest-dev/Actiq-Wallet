"use server";
import fs from "fs"
import axios from "axios";
import moment from "moment";
import _ from 'underscore'

const uuid = require('short-uuid')

import {TelegramWebApps} from 'telegram-webapps-types';
import {Users, Payouts, Tasks, Config, Transactions, Shares} from '@/db/schema'
import {ICard, IPayout, IUser, IApp, ITransaction, IShare, IShareH, TelegramUser} from '@/db/schema'

import {db} from './db';
import {sql, sum, eq, ne, lt, lte, and, asc, desc} from 'drizzle-orm';
import { QueryBuilder } from 'drizzle-orm/pg-core';

const {createCanvas, Image, loadImage, registerFont} = require('canvas')

async function getAvatar(config, user_id) {
    try {
        const avatarList = await axios.get(`https://api.telegram.org/bot${config.bot_token}/getUserProfilePhotos?user_id=${user_id}`, {responseType: 'json'})
        //console.log(avatarList)
        if (avatarList.status == 200) {
            if (avatarList.data.ok) {
                if (avatarList.data.result) {
                    //console.log(avatarList.data)
                    //console.log(`https://api.telegram.org/bot${config.bot_token}/getFile?file_id=${avatarList.data.result.photos[0][2].file_id}`)
                    let avatarFileObj = await axios.get(`https://api.telegram.org/bot${config.bot_token}/getFile?file_id=${avatarList.data.result.photos[0][2].file_id}`, {responseType: 'json'})
                    //console.log(avatarFileObj)
                    if (avatarFileObj.status == 200) {
                        if (avatarFileObj.data.result.file_path) {
                            let avatarFileRaw = await axios.get(`https://api.telegram.org/file/bot${config.bot_token}/${avatarFileObj.data.result.file_path}`, {responseType: 'stream'})
                            //console.log(avatarFileRaw)
                            if (avatarFileRaw) {
                                const writer = fs.createWriteStream(`public/avatars/${user_id}.jpg`);
                                writer.on('finish', () => {
                                    console.log('Finished writing a large file!');
                                });
                                await avatarFileRaw.data.pipe(writer)
                                //fs.writeFileSync(`${user_id}.jpg`, avatarFileRaw.data)
                                return `/avatars/${user_id}.jpg`
                            }
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.error('Error getting avatar')
    }
    return ''
}

export async function initApp(initData) {
    const teleUser = initData.user as IUser
    try {
        const config = await getConfig();
        const payoutData = await getPayouts();
        let tasksData = await getTasks(payoutData.payoutsObj);

        let inShare = null
        if (initData.start_param) {
            inShare = await getShare(initData.start_param)
            if (inShare?.status) inShare = null
        }

        let user = await db.query.Users.findFirst({where: eq(Users.id, teleUser.id)}) as IUser;
        // console.log(user, config);
        if (!user) {
            user = {
                id: teleUser.id,
                first_name: teleUser.first_name ? teleUser.first_name : "",
                last_name: teleUser.last_name ? teleUser.last_name : "",
                username: teleUser.username ? teleUser.username : "",
                avatar: (await getAvatar(config, teleUser.id))
            } as IUser

            user = (await db.insert(Users).values(user).returning())[0];
            await sendMessage(config['register_message_template'],{ config, user })
            user = (await makePayout(user, payoutData.payoutsObj['register'], { config, user } ))['user']

            if (inShare) {
                // The same user
                if (inShare.from === user.id) inShare = null
                else {
                    // Consume share
                    console.log('Consume share')
                    let res = await consumeShare(inShare, user)
                    if (res) user = res
                }
            }
            console.log(user)
        } else {
            // Donates only for new users
            inShare = null
            const res = await checkExpiredShares(user)
            if(res.user) user = res.user
            console.log(res)
        }
        tasksData = await updateTasksState(tasksData, user.state)
        // console.log(tasksData)

        return {
            inited: true,
            config,
            user,
            payoutsArray: payoutData.payouts,
            payouts: payoutData.payoutsObj,
            tasksArray: tasksData.tasks,
            tasks: tasksData.tasksObj
        } as IApp

    } catch (err) {
        console.error('Ошибка записи', err);
    }
}

export async function getConfig() {
    try {
        const configArray = await db.query.Config.findMany();
        let config = {}
        for (const key in configArray) {
            config[configArray[key].key] = configArray[key].value
        }
        return config
    } catch (err) {
        console.error('Ошибка', err);
    }
}

export async function getPayouts() {
    try {
        const payouts = await db.query.Payouts.findMany();
        let payoutsObj = {}
        for (const key in payouts) {
            payoutsObj[payouts[key].name] = payouts[key]
        }

        return {payouts, payoutsObj}
    } catch (err) {
        console.error('Ошибка', err);
    }
}

export async function getScores(limit) {
    limit = limit ? limit : 100
    try {
        const users = await db.query.Users.findMany({
            where: ne(Users.id, 0),
            orderBy: [desc(Users.balance)],
            limit: limit
        });

        return users
    } catch (err) {
        console.error('Ошибка', err);
    }
}

export async function getTasks(payouts) {
    try {
        const tasks = await db.query.Tasks.findMany({orderBy: [asc(Tasks.state), asc(Tasks.ord)],});

        let tasksObj = {}
        for (const key in tasks) {
            if (tasks[key].payout) tasks[key].payoutObj = payouts[tasks[key].payout]
            tasksObj[tasks[key].name] = tasks[key]
        }
        //console.log(tasksObj)
        return {tasks, tasksObj}

    } catch (err) {
        console.error('Ошибка', err);
    }
}

export async function updateTasksState(tasksData, userState) {
    try {
        if (!userState.tasks) return tasksData

        let tasksObj = tasksData.tasksObj
        let tasksArray = tasksData.tasks

        for (const key in tasksArray) {
            const tName = tasksArray[key].name
            //console.log(tName, userState)
            if (userState.tasks[tName]) {
                tasksArray[key].state = userState.tasks[tName]
                tasksObj[tName].state = userState.tasks[tName]
            }
        }

        tasksArray.sort((a, b) => {
            const r1 = a.state - b.state
            const r2 = a.ord - b.ord
            return r1 || r2
        })

        /*
        sortArrayByNumberKeyAsc: (arr, key) => {
            return arr.sort((a, b) => {
                return parseFloat(a[key]) - parseFloat(b[key])
            })
        },
         boats4sale = boats4sale.sort((a, b) => {
      const r1 = parseFloat(b.length) - parseFloat(a.length)
      const aa = a.is_model
      const bb = b.is_model
      let r2 = 0
      if (!aa && bb) r2 = 1
      if (aa && !bb) r2 = -1
      return r1 || r2
    })
        */
        return {tasks: tasksArray, tasksObj}

    } catch (err) {
        console.error('Ошибка', err);
    }
    return tasksData
}

export async function updateUserState(user: IUser, state: JSON) {
    try {
        //console.log(state)
        await db.update(Users).set({state: state}).where(eq(Users.id, user.id));
        return true;
    } catch (err) {
        console.error('Ошибка записи');
    }
    return null;
}

export async function addTransaction(data: ITransaction) {
    try {
        const tId = await db.insert(Transactions).values({
            from: data.from,
            to: data.to,
            value: data.value,
            source: data.source,
        }).returning({insertedId: Transactions.id});
        return tId;
    } catch (err) {
        console.error('Ошибка записи', err);
    }
    return null;
}

export async function deleteTransaction(tId) {
    try {
        await db.delete(Transactions).where(eq(Transactions.id, tId))
        return true;
    } catch (err) {
        console.error('Ошибка записи', err);
    }
    return false;
}

export async function getRawShare(hash: string) {
    try {
        let share = await db.query.Shares.findFirst({where: eq(Shares.hash, hash)});
        share['fromObj'] = await db.query.Users.findFirst({where: eq(Users.id, share.from)});
        return share
    } catch (err) {
        console.error('Ошибка записи', err);
    }
    return null;
}

export async function getShare(hash: string) {
    try {
        let share = await db.query.Shares.findFirst({where: eq(Shares.hash, hash)});
        if (share.validTill < Date.now()) {
            if (!share.status) await updateShareStatus(share, 'expired')
            return null
        }
        share['fromObj'] = await db.query.Users.findFirst({where: eq(Users.id, share.from)});
        return share
    } catch (err) {
        console.error('Ошибка записи', err);
    }
    return null;
}

export async function checkExpiredShares(user:IUser) {
    try {
        return await db.transaction(async (tx) => {
            const returnBalance = (await tx.select({ returnBalance: sum(Shares.value) }).from(Shares)
                                        .where(and(eq(Shares.from, user.id),eq(Shares.status, ''),lt(Shares.validTill, new Date()))))[0]["returnBalance"]
            if(returnBalance>0) {
                let nUser = (await tx.update(Users)
                    .set({ balance: sql`${Users.balance} + ${returnBalance}`, balance_on_hold: sql`${Users.balance_on_hold} - ${returnBalance}` })
                    .where(eq(Users.id, user.id))
                    .returning())[0]
                console.log(returnBalance)
                await tx.update(Shares).set({status: 'expired'}).where(and(eq(Shares.from, user.id), eq(Shares.status, ''), lt(Shares.validTill, new Date())));
                return {user:nUser}
            }
            return {user}
        })
    } catch (err) {
        console.error('Ошибка записи checkExpiredShares', err);
    }
    return user;
}

export async function deleteShare(sId) {
    try {
        await db.delete(Shares).where(eq(Shares.id, sId))
        return true;
    } catch (err) {
        console.error('Ошибка записи', err);
    }
    return false;
}

export async function addShare(data: IShare) {
    try {
        const sId = await db.insert(Shares).values({
            from: data.from,
            payout: data.payout,
            value: data.value,
            hash: data.hash,
        }).returning({insertedId: Shares.id});
        return sId;
    } catch (err) {
        console.error('Ошибка записи', err);
    }
    return null;
}

export async function updateShareStatus(share: IShare, status: string) {
    try {
        await db.update(Shares).set({status: status}).where(eq(Shares.id, share.id));
        return true;
        //let share = (await db.update(Shares).set({status: status}).where(eq(Shares.id, share.id)).returning())[0];
        //return share
    } catch (err) {
        console.error('Ошибка записи');
    }
    return null;
}

export async function consumeShare(share: IShare, user) {
    try {
        const transaction = {
            from: 0,
            to: share.from,
            value: share.payout,
            source: 'sendACTI',
        }
        return await db.transaction(async (tx) => {
            await tx.update(Shares).set({status: 'consumed'}).where(eq(Shares.id, share.id));
            await tx.insert(Transactions).values(transaction)
            await tx.update(Users).set({ balance: sql`${Users.balance} + ${share.payout}`, balance_on_hold: sql`${Users.balance_on_hold} - ${share.value}` }).where(eq(Users.id, share.from))
            let nUser = (await tx.update(Users).set({ balance: sql`${Users.balance} + ${share.value}` }).where(eq(Users.id, user.id)).returning())[0]
            return nUser
        })
    } catch (err) {
        console.error('Ошибка записи', err);
    }
    return null;
}

export async function buildShare(user: IUser, payout: IPayout, appState) {
    try {

        console.log(moment().add(48, 'hours').format())

        const share = {
            from: user.id,
            payout: payout.value,
            value: parseFloat(payout.title),
            hash: uuid.generate(),
            createdAt: moment().toDate(),
            validTill: moment().add(appState.config.share_expiration_hours, 'hours').toDate()
        } as IShare

        console.log(share)
        await drawInviteBannerByHash(share, user)
        return await db.transaction(async (tx) => {
            const [account] = await tx.select({balance: Users.balance}).from(Users).where(eq(Users.id, user.id));
            if (account.balance < share.value) {
                await tx.rollback()
                return null
            }
            const [nUser] = await tx.update(Users).set({
                balance: sql`${Users.balance} - ${share.value}`, balance_on_hold: sql`${Users.balance_on_hold}+${share.value}`}).where(eq(Users.id, user.id)).returning()
            const [nShare] = await tx.insert(Shares).values(share).returning()

            const messageConfig = {
                parse_mode: 'HTML',
                reply_markup: {inline_keyboard: [[
                        {
                            text: "Start webapp",
                            url: process.env.TMA_URL,
                            link_preview_options:{ show_above_text: true }
                        }
                    ]]}
            }
            const shareMessageConfig = {
                parse_mode: 'HTML',
                reply_markup: {inline_keyboard: [[
                        {
                            text: "Get your gift",
                            url: process.env.TMA_URL+'?startapp='+share.hash,
                            link_preview_options:{ show_above_text: true }
                        }
                    ]]}
            }
            await sendMessageWithConfig(appState.config.build_share_message_template, messageConfig,{...appState, share: nShare, user: nUser, env:process.env })
            await sendMessageWithConfig(appState.config.copy_share_message_template, shareMessageConfig,{...appState, share: nShare, user: nUser, env:process.env })

            let url = "https://t.me/share/url?"
            const urlData = {
                url: encodeURIComponent(`${process.env.HOST}/donate/${share.hash}`),
                text: encodeURIComponent(`Get your ACTI ${user.username ? 'from ' + user.username : ''}. This link will be valid for 72 hours.`)
            }
            for (const k in urlData) {
                url = url + k + '=' + urlData[k] + '&'
            }

            console.log({share: nShare, user: nUser})
            return {share: nShare, user: nUser, url }
        })
    } catch (err) {
        console.error('Ошибка записи', err);
    }
    return null;
}

export async function makePayout(user: IUser, payout: IPayout, appState) {
    try {
        const transaction = {
            from: 0,
            to: user.id,
            value: payout.value,
            source: payout.name,
        }
        return await db.transaction(async (tx) => {
            const newUser = await tx.update(Users).set({balance: sql`${Users.balance} + ${payout.value}`}).where(eq(Users.id, user.id)).returning()
            const newTransaction = await tx.insert(Transactions).values(transaction).returning()
            await sendMessage(appState.config.payout_message_template,{...appState, user:newUser[0], payout})
            return {
                transaction: newTransaction[0],
                user: newUser[0]
            }
        })

    } catch (err) {
        console.error('Ошибка записи', err);
    }
    return null;
}

export async function drawInviteBannerByHash(share: IShare, user: IUser) {
    registerFont('./fonts/SpaceGrotesk-Bold.ttf', {family: 'Space Grotesk'})
    const canvas = createCanvas(640, 360)
    const ctx = canvas.getContext('2d')

    var imgData = fs.readFileSync('./public/icons/acti.png')
    var img = new Image(); // Create a new Image
    img.src = imgData;

    ctx.fillStyle = "#ee77f9";
    ctx.fillRect(0, 0, 640, 360);

    ctx.drawImage(img, 270, 40, 100, 100)

    ctx.fillStyle = '#000';
    ctx.font = '28px "Space Grotesk"'
    ctx.textAlign = "center";
    ctx.fillText(user.username ? '@' + user.username : user.first_name + ' ' + user.last_name, 320, 180)
    ctx.fillText('sent you', 320, 210)

    ctx.font = '82px "Space Grotesk"'
    ctx.textAlign = "center";
    ctx.fillText(share.value + ' $ACTI', 320, 300)

    let buff = canvas.toBuffer('image/png')
    fs.writeFileSync(
        `./public/donates/${share.hash}.png`,
        buff,
    );
    return buff
}

export async function sendMessage(template, data) {
    try {
        let text = _.template(template)(data)
        const result = (await axios.post(
                `https://api.telegram.org/bot${data.config.bot_token}/sendMessage`,
                {
                    chat_id: data.user.id,
                    text: text
                },
                { responseType: 'json' })
        ).data
    } catch (err) {
        console.log(err)
    }
}

export async function sendMessageWithBtn(template, data) {
    try {
        const kbd = {inline_keyboard: [[{
                text: "Start webapp",
                url: process.env.TMA_URL
            }]]}

        console.log(kbd)

        let text = _.template(template)(data)
        const result = (await axios.post(
                `https://api.telegram.org/bot${data.config.bot_token}/sendMessage`,
                {
                    chat_id: data.user.id,
                    text: text,
                    reply_markup: kbd
                },
                { responseType: 'json' })
        ).data
    } catch (err) {
        console.log(err)
    }
}

export async function sendMessageWithConfig(template, messageConfig, data) {
    try {
        let text = _.template(template)(data)
        const result = (await axios.post(
                `https://api.telegram.org/bot${data.config.bot_token}/sendMessage`,
                {
                    ...messageConfig,
                    chat_id: data.user.id,
                    text: text,
                },
                { responseType: 'json' })
        ).data
    } catch (err) {
        console.log(err)
    }
}

export async function testBot() {
    // https://api.telegram.org/bot6728990812:AAGRqdMNBsyyMfZnG8ZHtL_RX1xTg2SyTag/getMe
    // 6728990812:AAGRqdMNBsyyMfZnG8ZHtL_RX1xTg2SyTag
    try {
        const res = await fetch('https://api.telegram.org/bot6728990812:AAGRqdMNBsyyMfZnG8ZHtL_RX1xTg2SyTag/getChatMember', {
            method: 'POST',
            body: JSON.stringify({
                user_id: 111125293,
                chat_id: 2134710554
            }),
            headers: {
                'content-type': 'application/json'
            }
        })
        console.log(res)
    } catch (err) {
        console.log(err)
    }

}
