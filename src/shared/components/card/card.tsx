import {useState,useEffect} from "react";
import {useRouter} from 'next/navigation'
import {taskHandlers} from "@/task_handlers"

import Image from "next/image";
import {ArrowUpRight} from "@/shared/components/icons/arrow-up-right";


export const Card = ({index, card, selected, onClick, appState, setAppState, setLoading}) => {
    const router = useRouter()
    const cCard = card
    let [cardSide, setCardSide] = useState(false)

    let payoutText = card.payout_text ? card.payout_text : (card.payoutObj? '+' + card.payoutObj.value + ' $ACTI':'∞ $ACTI')

    const actionHandler = async (card) => {
        if (card.cardType == 'link') {
            if (card.data?.link) {
                const url = card.data.link
                setLoading(true)
                router.push(url)
            }
        }
        if (card.cardType == 'trigger') {
            if (card.data?.trigger) {
                if (taskHandlers[card.data.trigger]) {
                    setLoading(true)
                    const result = await taskHandlers[card.data.trigger](appState, setAppState, router)
                    setLoading(false)
                }

            }
        }
    }
/*
    useEffect(()=>{
        if(cardSide) setTimeout( ()=>onClick(index), 800)
    },[cardSide])
    const cardSwitcher = async () => {
        setCardSide(true)

    }
*/

    return (
        <>
            {!card.state &&
                <div className={`w-full p-4 border-2 border-black rounded-[16px] shadow-card relative ${selected?'cardFlip':''}`} style={{marginTop: '-24px', backgroundColor: card.cardColor}} onClick={()=>{ if(!selected) onClick(index)} }>
                    <div className="flex flex-row items-center justify-between mb-5">
                        <div className="flex gap-3 items-center">
                            <div
                                className="w-[40px] h-[40px] rounded-full bg-[#FBE704] border-2 border-black flex items-center justify-center">
                                <Image src={"/icons/" + card.icon} alt="Task icon" width={20} height={20}/>
                            </div>
                            <span className="text-2xl font-bold">{card.title}</span>
                        </div>
                        <div>
                            <ArrowUpRight width="12" height="12"/>
                        </div>
                    </div>
                    <div className={`sideOne`}>
                        <div className="text-sm leading-[24px] text-subtitle mb-4">{card.description}</div>
                        <div className="text-[20px] leading-[28px] font-bold mb-4">{payoutText}</div>
                    </div>
                    <div className={`sideTwo`}>
                        <div className="text-sm leading-[24px] text-subtitle mb-4">
                            {card.help}
                        </div>
                        <div className="flex flex-row items-center justify-around mb-5 mt-5">
                            <button className="w-full max-w-[100px] border-2 border-black bg-[#ccc] rounded-[20px] px-4 py-2 text-[14px] leading-[20px] font-medium tracking-[0.25px]" style={{textTransform:'uppercase'}} onClick={()=>onClick(-1)}>Cancel</button>
                            <button className="w-full max-w-[150px] border-2 border-black bg-[#EE77F9] rounded-[20px] py-2 px-2 text-[14px] leading-[20px] font-bold tracking-[0.25px]" style={{textTransform:'uppercase'}} onClick={() => { actionHandler(card) }}>Continue</button>
                        </div>
                    </div>
                </div>
            }

            {card.state == 5 &&
                <div className={`w-full p-4 border-2 border-black rounded-[16px] shadow-card relative`} style={{marginTop: '-24px', backgroundColor: "#eee"}}>
                    <div className="flex flex-row items-center justify-between mb-5">
                        <div className="flex gap-3 items-center">
                            <div
                                className="w-[40px] h-[40px] rounded-full bg-[#FBE704] border-2 border-black flex items-center justify-center">
                                <Image src={"/icons/" + card.icon} alt="Task icon" width={20} height={20}/>
                            </div>
                            <span className="text-2xl font-bold">{card.title}</span>
                        </div>
                        <div>
                            <Image src={"/icons/check.svg"} alt="Task icon" width={16} height={12}/>
                        </div>
                    </div>
                    <div className="text-sm leading-[24px] text-subtitle mb-4">
                        {card.description}
                    </div>
                </div>
            }
            {card.state == 10 &&
                <div className={`w-full p-4 border-2 rounded-[16px] shadow-card relative`} style={{marginTop: '-24px', backgroundColor: "#ccc", color: "#ddd", borderColor: '#000'}}>
                    <div className="flex flex-row items-center justify-between mb-5">
                        <div className="flex gap-3 items-center">
                            <div
                                className="w-[40px] h-[40px] rounded-full border-2 border-black flex items-center justify-center"
                                style={{opacity: 0.25}}>
                                <Image src={"/icons/" + card.icon} alt="Task icon" width={20} height={20}/>
                            </div>
                            <span className="text-xl font-bold">{card.title}</span>
                        </div>
                        <div>
                            <div className="h-[25px] w-[60px] rounded-full flex items-center justify-center" style={{marginTop: '-24px', backgroundColor: "#fff", color: "#ddd", borderColor: '#000'}}>soon</div>
                        </div>
                    </div>
                    <div className="text-sm leading-[24px] text-subtitle mb-4" style={{opacity: 0.25}}>
                        {card.description}
                    </div>
                    <div className="text-[20px] leading-[28px] font-bold mb-4">{payoutText}</div>
                </div>
            }

        </>

    );
}