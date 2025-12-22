import Image from "next/image";

export const ScoreItem = ({user, color}) => {

    let balance = (Math.floor(user.balance*100)/100) + "";
    let [balanceOne, balanceTwo] = balance.split('.')
    if(!balanceTwo) balanceTwo = "00"
    balanceTwo = balanceTwo.padEnd(2, "0")
    console.log()

    return (

        <div className="text-black border-2 border-black rounded-[16px] p-4 w-full flex items-center justify-between" style={{backgroundColor:color}}>
            <div className="flex gap-[30px]">
                <div className="w-[40px] h-[40px] rounded-[60px] shadow-card">
                    {user.avatar &&
                        <Image src={user.avatar} width={40} height={40} className="w-[40px] h-[40px] rounded-[60px]" alt="Score"/>
                    }
                    {!user.avatar &&
                        <div className="flex items-center justify-center w-[40px] h-[40px] rounded-[60px] bg-[#FBE704] text-black font-bold">
                            <div>
                            {user.first_name.substring(0,1) + user.last_name.substring(0,1) }
                            </div>
                        </div>
                    }
                </div>
                <div className="flex flex-col">
                    <span className="text-[16px] leading-[24px] font-bold tracking-[0.15px]">{user.first_name + ' ' + user.last_name }</span>
                    {user.username &&
                        <span className="text-[14px] leading-[20px] font-medium tracking-[0.25px]">@{user.username}</span>
                    }
                </div>
            </div>
            <div className="flex flex-col gap-1 text-[16px] leading-[24px] font-bold"><span>$ACTI</span> <div className="flex flex-row"><span>{balanceOne}.</span><span className="font-light">{balanceTwo}</span></div></div>
        </div>

    );
}