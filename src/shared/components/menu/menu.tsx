import Image from "next/image";
import Link from "next/link";
import { Trophy } from "../icons/trophy";
import { Users } from "../icons/users";
import { Wallet } from "../icons/wallet";

export const Menu = () => {
    return (
        <div className="fixed bottom-8 left-0 right-0 m-auto ">
            <div>
                <Link href="/score">
                    <Trophy width="22" height="22" />
                </Link>
            </div>
            <div>
                <Link href="/giftsender">
                    <Users width="25" height="21" />
                </Link>
            </div>
            <div className="bg-[#F2F2F2] border-2 border-black rounded-[50px] py-2 px-3">
                <Link href="/" className="flex items-center gap-2">
                    <Wallet width="20" height="18" />
                    <span className="text-[12px] leading-[16px] tracking-[0.4px] font-bold">Wallet</span>
                </Link>
            </div>
        </div>
    );
}