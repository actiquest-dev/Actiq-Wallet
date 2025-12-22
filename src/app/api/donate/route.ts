import {type NextRequest} from "next/server";
import {drawInviteBannerByHash, getShare} from "@/action";

export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const hash = searchParams.get('id')
    console.log(hash)
    const share = await getShare(hash)
    if(share) {
        return new Response(drawInviteBannerByHash(share), {
            status: 200,
            headers: {
                'Content-Type': 'image/png',
            },
        })
    }
    else {
        return new Response( null, {
            status: 404,
            headers: {
                'Content-Type': 'image/png',
            },
        })
    }
}
