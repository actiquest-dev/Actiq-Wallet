"use server"
import {useEffect} from "react";
//import { useRouter } from 'next/navigation'
import { Metadata, ResolvingMetadata } from 'next'
import Image from "next/image";
import Script from "next/script";


type Props = {
    params: { id: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
    { params, searchParams }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    return {
        title: "Donate id=" + params.id,
        openGraph: {
            images: [`${process.env.HOST}/donates/${params.id}.png`],
        },
    }
}


export default async function Page({ params }: { params: { id: string } }) {
    return (<>
        <Image src={`/donates/${params.id}.png`} width={600} height={360}/>
        <Script id="redirscript">
            {`setTimeout("window.location.assign('${process.env.TMA_URL}?startapp=${params.id}')", 1500);`}
        </Script>
    </>)
}