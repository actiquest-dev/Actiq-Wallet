"use client";
import {useEffect, useState} from "react";
import { useRouter } from 'next/navigation'
import appStore from "@/shared/store"
import {getScores} from "@/action";

import {ScoreItem} from "@/shared/components/card/scoreItem";
import { NavigationArrow } from "@/shared/components/icons/navigation-arrow";
import Image from "next/image";
import Link from "next/link";

export default function Score() {
    const [isLoading, setIsLoading] = useState(true);
    const [appState, setAppState] = useState(appStore.getStateSync());
    const [scoresList, setScoresList] = useState([]);
    const router = useRouter()

    const colors = [ "#7FF098", "#EE77F9", "#FDF382", "#7044DA", "#3F97EF", "#EB484D", "#CCFB82" ]
    function getRandomColor() {
        const idx = Math.floor(Math.random() * colors.length)
        return colors[idx];
    }

    useEffect(() => {
        if(!appState.inited) {
            router.push('/')
        }
        else {
            const initWrapper = async () => {
                const scores = await getScores(100)
                console.log(scores)
                setScoresList(scores)
                setIsLoading(false);
            }
            initWrapper();
        }
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-2 h-screen w-full bg-[#fff] text-black flex items-center justify-center">
                <Image src={"/icons/acti.svg"} alt={"Loading app"} width={40} height={40}/>
                <div>Loading App...</div>
            </div>
        )
    }

    return (
        <main className="px-4 py-4 text-black">
            <div className="flex justify-between items-center w-full pt-3 mb-[39px]">
                <Link href="/" className="flex items-center" onClick={()=>setIsLoading(true)}>
                    <NavigationArrow width="22" height="24" className="rotate-180" />
                    <span className="text-[16px] leading-[24px] tracking-[0.15px] text-[#16C03C]">Wallet</span>
                </Link>
                <div className="text-[16px] leading-[24px] tracking-[0.15px] font-bold">Score</div>
                <Link href="/giftsender" className="flex items-center" onClick={()=>setIsLoading(true)}>
                    <span className="text-[16px] leading-[24px] tracking-[0.15px] text-[#16C03C]">Giftsender</span>
                    <NavigationArrow width="22" height="24" />
                </Link>
            </div>
            <div className="flex flex-col gap-4">
                {scoresList.map((score, index) => (

                    <ScoreItem key={index} user={score} color={getRandomColor()}></ScoreItem>
                ))}
            </div>
        </main>
    )
}