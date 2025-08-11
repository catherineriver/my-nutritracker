import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function GET() {
    return NextResponse.json({
        hasKey: !!process.env.FATSECRET_CONSUMER_KEY,
        hasSecret: !!process.env.FATSECRET_CONSUMER_SECRET,
        appUrl: process.env.APP_URL || null,
    });
}
