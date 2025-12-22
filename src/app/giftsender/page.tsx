"use client";
import {useEffect, useState} from "react";
import {useRouter} from 'next/navigation'
import appStore from "@/shared/store"
import {buildShare} from "@/action";
import {IPayout, IUser} from '@/db/schema'

import {NavigationArrow} from "@/shared/components/icons/navigation-arrow";
import Image from "next/image";
import Link from "next/link";

export default function Giftsender() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [appState, setAppState] = useState(appStore.getStateSync());
    const [selectedPayout, setSelectedPayout] = useState({} as IPayout);
    const router = useRouter()

    let gifts = []
    for(const index in appState.payoutsArray) {
        if( appState.payoutsArray[index].type == 'send') {
            gifts.push(appState.payoutsArray[index])
        }
    }
    gifts.sort((a, b) => {
        return  parseFloat(a.title) - parseFloat(b.title)
    })

    const sendHandler = async () => {
        setIsSending(true)
        const result = await buildShare(appState.user as IUser, selectedPayout as IPayout, appState)
        if (!result) {
            alert('Gift creatiion failed.')
            return
        }
        setTimeout(()=>router.replace(result.url),500)
        console.log("I'm out")
        setIsSending(false)
    }

    useEffect(() => {
        if (!appState.inited) {
            router.push('/')
        } else {
            setSelectedPayout(gifts[0])
            setIsLoading(false);
        }
    }, []);

    if (isSending) {
        return (
            <div className="flex flex-col gap-2 h-screen w-full bg-[#fff] text-black flex items-center justify-center">
                <Image src={"/icons/acti.svg"} alt={"Building gift"} width={40} height={40}/>
                <div>Building gift...</div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="flex flex-col gap-2 h-screen w-full bg-[#fff] text-black flex items-center justify-center">
                <Image src={"/icons/acti.svg"} alt={"Loading app"} width={40} height={40}/>
                <div>Loading App...</div>
            </div>
        )
    }

    return (
        <main className="px-4 py-4 text-black" style={{backgroundColor: '#fff', minHeight: '100vh'}}>
            <div className="flex justify-between items-center w-full pt-3 mb-[39px]">
                <Link href="/" className="flex items-center" onClick={()=>setIsLoading(true)}>
                    <NavigationArrow alt={"to Wallet"} width="22" height="24" className="rotate-180"/>
                    <span className="text-[16px] leading-[24px] tracking-[0.15px] text-[#16C03C]">Wallet</span>
                </Link>
                <div className="text-[16px] leading-[24px] tracking-[0.15px] font-bold">Giftsender</div>
                <Link href="/score" className="flex items-center" onClick={()=>setIsLoading(true)}>
                    <span className="text-[16px] leading-[24px] tracking-[0.15px] text-[#16C03C]">Score</span>
                    <NavigationArrow alt={"to Score"} width="22" height="24"/>
                </Link>
            </div>
            {appState.user.balance>=parseFloat(gifts[0].title) && <>
            <div className="flex flex-col gap-4 justify-center items-center mb-[40px]">
                <Image src="/giftsender-icon.png" width={112} height={115} alt="giftsender"/>
                <div className="text-[60px] font-bold leading-[72px] tracking-[-0.5px]">{selectedPayout.title} $ACTI
                </div>
                <div className="text-[16px] leading-[24px] tracking-[0.15px]">~
                    ${Math.floor(selectedPayout.title / appState.config.ratio_usd * 1000) / 1000}</div>
            </div>

            <div className="flex w-full justify-around gap-[15px] mb-4">
                {gifts.map((payout, index) => {
                    if ((payout.type == 'send')) {
                        if (payout.title <= appState.user.balance) {
                            if (payout.id == selectedPayout.id) {
                                return (<button key={payout.id}
                                                className="w-full max-w-[78px] border-2 border-black bg-[#ccc] rounded-[20px] px-4 py-2 text-[14px] leading-[20px] font-medium tracking-[0.25px]"
                                                style={{textTransform: 'uppercase'}}>{payout.title}</button>)
                            } else {
                                return (<button key={payout.id}
                                                className="w-full max-w-[78px] border-2 border-black rounded-[20px] px-4 py-2 text-[14px] leading-[20px] font-medium tracking-[0.25px]"
                                                style={{textTransform: 'uppercase'}} onClick={() => {
                                    setSelectedPayout(payout)
                                }}>{payout.title}</button>)
                            }

                        } else {
                            return (<button key={payout.id}
                                            className="w-full max-w-[78px] border-2 border-[#ccc] text-[#ccc] rounded-[20px] px-4 py-2 text-[14px] leading-[20px] font-medium tracking-[0.25px]"
                                            style={{textTransform: 'uppercase'}}>{payout.title}</button>)
                        }

                    }
                })}
            </div>
            <div onClick={sendHandler}
                 className="text-center border-2 border-black shadow-card bg-[#EE77F9] rounded-[16px] py-4 px-4 mb-4 text-[16px] leading-[24px] font-bold tracking-[0.15px]">{'Donate ' + selectedPayout.title + ' ACTI to friend and get ' + selectedPayout.value + ' ACTI'}</div>

            <div className="px-2">You are going to send <b>{selectedPayout.title} ACTI</b> to friend by sharing this app
                with him. When he opens the app <i>using link shared by
                    you</i> - <b>{selectedPayout.title} ACTI</b> will fall on his balance and your reward
                of <b>{selectedPayout.value} ACTI</b> will go on yours.
            </div>
            </>}
            {appState.user.balance<parseFloat(gifts[0].title) && <>
                <div className="p-10 text-center text-[22px]">{appState.config.giftsender_no_balance}</div>
            </>}
        </main>
    )
}