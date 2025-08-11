// app/api/fatsecret/auth/start/route.ts
import { NextResponse } from "next/server";
import { getOAuth } from "@/lib/oauth";

const REQUEST_TOKEN_URL = "https://authentication.fatsecret.com/oauth/request_token";
const AUTHORIZE_URL = "https://authentication.fatsecret.com/oauth/authorize";

export const runtime = "nodejs";

export async function GET() {
    const callback = `${process.env.APP_URL}/api/fatsecret/auth/callback`;
    const oauth = getOAuth();

    // В OAuth1 важно: что подписываешь — то и отправляешь.
    const data = { oauth_callback: callback };
    const reqData = { url: REQUEST_TOKEN_URL, method: "POST", data };
    
    // Get OAuth authorization without token for request token step
    const authData = oauth.authorize(reqData);
    
    // FatSecret might expect OAuth params in the body instead of header
    const bodyData = {
        ...data,
        ...authData
    };
    
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
    };

    const body = new URLSearchParams(bodyData).toString();
    const res = await fetch(REQUEST_TOKEN_URL, { method: "POST", headers, body });
    const txt = await res.text();

    if (!res.ok) {
        // полезно увидеть, что именно вернул FS
        console.error('FatSecret error:', res.status, txt);
        return NextResponse.json({ error: txt, status: res.status }, { status: res.status });
    }

    const params = new URLSearchParams(txt);
    const token = params.get("oauth_token");
    const secret = params.get("oauth_token_secret");

    // сохрани secret временного токена как делала раньше
    const { setReqSecret } = await import("@/lib/store");
    if (token && secret) {
        setReqSecret(token, secret);
    }

    return NextResponse.redirect(`${AUTHORIZE_URL}?oauth_token=${token}`);
}
