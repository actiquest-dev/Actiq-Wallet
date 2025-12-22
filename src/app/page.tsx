"use client";
import {useEffect, useState, useContext, createContext} from "react";
import { useRouter } from 'next/navigation'
import appStore from "@/shared/store"
import {TelegramWebApps} from 'telegram-webapps-types';
import useTelegramInitData from "@/shared/hooks/useTelegramInitData";
//import useTelegramInitData from "@/shared/thunks/tele-data";

import {IApp, appStateDefault} from '@/db/schema'
import {initApp} from "@/action";
import {Card} from "@/shared/components/card"
import Image from "next/image";
import Link from "next/link";

import {Trophy} from "@/shared/components/icons/trophy";
import {Users} from "@/shared/components/icons/users";
import {Wallet} from "@/shared/components/icons/wallet";

interface TelegramUser extends TelegramWebApps.WebAppInitData {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
}

const AppContext = createContext({})

export default function Home() {
    const [isLoading, setIsLoading] = useState(true);
    const st = appStore.getStateSync();
    const [appState, setAppState] = useState(st);
    const [cardSelected, setCardSelected] = useState(-1);
    const telegramInitData = useTelegramInitData();
    const router = useRouter()

    useEffect(() => {
        console.log("Home main effect", telegramInitData)
        if (telegramInitData.user && Object.keys(telegramInitData.user).length !== 0) {
            if (telegramInitData.user.id) {
                if (appState.inited) {
                    console.log("appState already inited")
                    setIsLoading(false);
                    return
                }
                const initWrapper = async () => {
                    const st = await initApp(telegramInitData) as IApp
                    console.log(st)
                    await appStore.setState(st);
                    setAppState(st);
                    setIsLoading(false);
                }
                initWrapper();
            } else {
                console.log(telegramInitData.user);
                setIsLoading(false);
            }
        }
    }, [telegramInitData]);

    useEffect(() => {
        if (isLoading || Object.keys(telegramInitData).length === 0) {
            return;
        }

    }, [isLoading]);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-2 h-screen w-full bg-[#fff] text-black flex items-center justify-center">
                <Image src={"/icons/acti.svg"} alt={"Loading app"} width={40} height={40}/>
                <div>Loading App...</div>
            </div>
        )
    }

    const cardSelector = (index) => {
        console.log(index)
        setCardSelected(index)
    }
    return (
        <AppContext.Provider value={appStateDefault}>
            {appState.inited && <>
                <main className="flex flex-col text-[black] px-4 pt-6 pb-4" style={{backgroundColor: '#fff', minHeight: '100vh'}}>
                      <div className="flex flex-row justify-between items-top mb-[5px]">
                        <div className="flex flex-col">
                            <span>Total balance ($ACTI)</span>
                            <span className="text-[48px] font-bold leading-none mt-1 mb-4">{appState.user.balance} $ACTI</span>
                            <div className="flex flex-row items-center">
                                <div className="text-base pr-[19px]">~ ${Math.floor(appState.user.balance / appState.config.ratio_usd * 1000) / 1000}</div>
                                <div className="">
                                    <div className="inline-flex gap-1 rounded-[16px] bg-[#E4FCE9] px-2 py-1.5 right-4 items-center">
                                        <Image src={'/icons/arrow-growth-green.svg'} alt={"Score dynamics"} width={20} height={20}/>
                                        <span className="text-[12px] font-medium leading-4 tracking-[0.4px]" style={{color: '#16C03C'}}>+{Math.floor( (appState.config.ratio_usd_previous-appState.config.ratio_usd)*100 / appState.config.ratio_usd )}%</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className="flex items-top pt-5">
                            {appState.user.avatar &&
                                <Image src={appState.user.avatar} className="w-[60px] h-[60px] rounded-full bg-[#FBE704] border-2 border-black p-1" alt="Task icon" width={60} height={60}/>
                            }
                            {!appState.user.avatar &&
                                <div className="flex items-center justify-center w-[60px] h-[60px] rounded-[60px] bg-[#FBE704] text-black font-bold">
                                    <div>
                                        { (appState.user.first_name ? appState.user.first_name.substring(0,1) : "" ) + (appState.user.last_name ? appState.user.last_name.substring(0,1) : "" ) }
                                    </div>
                                </div>
                            }

                        </div>
                    </div>

                    <div className="flex items-center justify-between text-2xl font-bold py-4 mb-2">
                        <div>My tasks</div>
                        <div className="text-[#00000061]">{appState.tasksArray.length}</div>
                    </div>
                    <div className="flex flex-col">
                        {appState.tasksArray.map((task, index) => (
                            <Card key={index} index={index} selected={cardSelected==index} card={task} appState={appState} setAppState={setAppState} onClick={cardSelector} setLoading={setIsLoading}/>
                        ))}
                    </div>
                </main>
                <div
                    className="items-center flex justify-around rounded-[100px] border-2 border-black fixed bottom-8 left-0 right-0 m-auto bg-white w-full max-w-[271px] h-[80px]">
                    <div>
                        <Link href="/score" onClick={()=>setIsLoading(true)}>
                            <Trophy width="22" height="22"/>
                        </Link>
                    </div>
                    <div>
                        <Link href="/giftsender" onClick={()=>setIsLoading(true)}>
                            <Users width="25" height="21"/>
                        </Link>
                    </div>
                    <div className="bg-[#F2F2F2] border-2 border-black rounded-[50px] py-2 px-3">
                        <Link href="/" className="flex items-center gap-2">
                            <Image src={'/icons/wallet.svg'} alt={"Wallet"} width={20} height={18}/>
                            <span
                                className="text-[#000000] text-[12px] leading-[16px] tracking-[0.4px] font-bold">Wallet</span>
                        </Link>
                    </div>
                </div>
            </>}
        </AppContext.Provider>
    );
}
