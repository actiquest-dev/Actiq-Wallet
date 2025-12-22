"use client"
import {IApp} from "@/db/schema";
import axios from "axios";
import {makePayout, updateUserState} from "@/action";
// import {useRouter} from "next/router";
// import {Router} from "next/router";

export const taskHandlers = {
    checkfollowGroup: async function (appState: IApp, setAppState, router) {
        // https://api.telegram.org/bot7073587224:AAHjImh6AfeNd-O1goPkTE6IdXkx_zw4rlM/getChatMember?user_id=111125293&chat_id=-1002116179398
        try {
            const result = (await axios.get(`https://api.telegram.org/bot${appState.config.bot_token}/getChatMember?user_id=${appState.user.id}&chat_id=${appState.config.chat}`, {responseType: 'json'})).data
            // console.log(result)
            if (result.ok) {
                if (result.result.status) {
                    if (result.result.status !== 'left') {
                        let user = (await makePayout(appState.user, appState.payouts['followGroup'], appState))['user']
                        if (!user.state) user.state = {}
                        if (!user.state.tasks) user.state.tasks = {}
                        user.state.tasks['followGroup'] = 5
                        await updateUserState(user, user.state)

                        const appStateSetter = function (oldState) {
                            let tA = [...oldState.tasksArray]
                            for (const key in tA) {
                                if (tA[key]['name'] == 'followGroup') tA[key]['state'] = 5
                            }
                            tA.sort((a, b) => {
                                const r1 = a.state - b.state
                                const r2 = a.ord - b.ord
                                return r1 || r2
                            })
                            return {...oldState, user, tasksArray: tA, tasks: oldState.tasks}
                        }
                        setAppState(appStateSetter)

                        return true
                    }
                    else {
                        // const router = new Router()
                        router.replace(appState.config['chat_url'])
                        // window.location.replace(appState.config['chat_url'])
                    }
                }
            }
            console.log(result)

        } catch (err) {
            console.log(err)
        }
        return false
    },
    checkfollowChannel: async function (appState: IApp, setAppState, router) {
        // https://api.telegram.org/bot7073587224:AAHjImh6AfeNd-O1goPkTE6IdXkx_zw4rlM/getChatMember?user_id=111125293&chat_id=-1002116179398
        try {
            const result = (await axios.get(`https://api.telegram.org/bot${appState.config.bot_token}/getChatMember?user_id=${appState.user.id}&chat_id=${appState.config.channel_id}`, {responseType: 'json'})).data
            // console.log(result)
            if (result.ok) {
                if (result.result.status) {
                    if (result.result.status !== 'left') {
                        let user = (await makePayout(appState.user, appState.payouts['followChannel'], appState))['user']
                        if (!user.state) user.state = {}
                        if (!user.state.tasks) user.state.tasks = {}
                        user.state.tasks['followChannel'] = 5
                        await updateUserState(user, user.state)

                        const appStateSetter = function (oldState) {
                            let tA = [...oldState.tasksArray]
                            for (const key in tA) {
                                if (tA[key]['name'] == 'followChannel') tA[key]['state'] = 5
                            }
                            tA.sort((a, b) => {
                                const r1 = a.state - b.state
                                const r2 = a.ord - b.ord
                                return r1 || r2
                            })
                            return {...oldState, user, tasksArray: tA, tasks: oldState.tasks}
                        }
                        setAppState(appStateSetter)

                        return true
                    }
                    else {
                        // const router = new Router()
                        router.replace(appState.config['channel_url'])
                        // window.location.replace(appState.config['chat_url'])
                    }
                }
            }
            console.log(result)

        } catch (err) {
            console.log(err)
        }
        return false
    }

}