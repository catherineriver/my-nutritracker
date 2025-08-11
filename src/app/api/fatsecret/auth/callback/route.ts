import { NextRequest, NextResponse } from "next/server";
import { getOAuth } from "@/lib/oauth";
import { getReqSecret, delReqSecret } from "@/lib/store";

const ACCESS_TOKEN_URL = "https://authentication.fatsecret.com/oauth/access_token";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const oauth_token = url.searchParams.get("oauth_token");
    const oauth_verifier = url.searchParams.get("oauth_verifier");
    const baseUrl = `${url.protocol}//${url.host}`;
    if (!oauth_token || !oauth_verifier) return NextResponse.redirect(`${baseUrl}/?auth=denied`);

    const token_secret = getReqSecret(oauth_token);
    if (!token_secret) return NextResponse.redirect(`${baseUrl}/?auth=expired`);

    const reqData = {
        url: ACCESS_TOKEN_URL,
        method: "GET",
        data: { oauth_verifier, oauth_token },
    };
    const oauth = getOAuth();
    const authData = oauth.authorize(reqData, { key: oauth_token, secret: token_secret });
    
    // Include all OAuth params in URL for FatSecret
    const allParams = {
        oauth_verifier,
        oauth_token,
        ...Object.fromEntries(
            Object.entries(authData).map(([key, value]) => [key, String(value)])
        )
    };
    
    const accessUrl = ACCESS_TOKEN_URL + "?" + new URLSearchParams(allParams).toString();
    const headers = {};

    const res = await fetch(accessUrl, { headers });
    const txt = await res.text(); // oauth_token=...&oauth_token_secret=...
    
    if (!res.ok) return NextResponse.redirect(`${baseUrl}/?auth=error`);

    delReqSecret(oauth_token);
    const params = new URLSearchParams(txt);
    const at = params.get("oauth_token")!;
    const ats = params.get("oauth_token_secret")!;

    // тут положи постоянные токены в куки/БД; для простоты — HttpOnly куки
    const resp = NextResponse.redirect(`${baseUrl}/?auth=ok`);
    resp.cookies.set("fs_at", at, { httpOnly: true, secure: true, path: "/" });
    resp.cookies.set("fs_ats", ats, { httpOnly: true, secure: true, path: "/" });
    return resp;
}
