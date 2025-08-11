import { NextRequest, NextResponse } from "next/server";
import { getOAuth } from "@/lib/oauth";

const API = "https://platform.fatsecret.com/rest/server.api"; // method-based

export async function GET(req: NextRequest) {
    const at = req.cookies.get("fs_at")?.value;
    const ats = req.cookies.get("fs_ats")?.value;
    if (!at || !ats) return NextResponse.json({ error: "Not authorized" }, { status: 401 });

    const dateParam = req.nextUrl.searchParams.get("date");
    // Default to yesterday if no date specified
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const defaultDate = yesterday.toISOString().slice(0, 10);
    
    const date = dateParam || defaultDate;
    
    // Ensure we don't request future dates
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today
    const requestedDate = new Date(date);
    const safeDate = requestedDate > today ? defaultDate : date;
    
    console.log('Today:', today.toISOString());
    console.log('Requested date obj:', requestedDate.toISOString());
    console.log('Is future?', requestedDate > today);
    
    // Try different date formats - some APIs expect different formats
    const dateObj = new Date(safeDate);
    
    // FatSecret expects "Number of days since January 1, 1970"
    const jan1970 = new Date('1970-01-01');
    const daysSince1970 = Math.floor((dateObj.getTime() - jan1970.getTime()) / (1000 * 60 * 60 * 24));
    
    const dateInt = Math.floor(dateObj.getTime() / 1000); // Unix timestamp (seconds)
    const dateString = dateObj.toISOString().slice(0, 10); // YYYY-MM-DD
    const dateFormatted = dateObj.toLocaleDateString('en-US'); // M/D/YYYY
    
    console.log('Requested date:', dateParam);
    console.log('Safe date used:', safeDate);
    console.log('Date as timestamp (seconds):', dateInt);
    console.log('Date as days since 1970:', daysSince1970);
    console.log('Date as ISO string:', dateString);
    console.log('Date formatted:', dateFormatted);

    // Try different methods based on query param
    const testMethod = req.nextUrl.searchParams.get("method");
    let params;
    
    if (testMethod === "profile") {
        params = { method: "profile.get", format: "json" };
    } else if (testMethod === "foods") {
        params = { method: "foods.search", format: "json", search_expression: "apple" };
    } else {
        // Use the correct method for getting daily food entries
        // FatSecret expects days since Jan 1, 1970, not seconds
        params = { method: "food_entries.get.v2", format: "json", date: String(daysSince1970) };
    }
    const reqData = { url: API, method: "GET", data: params };
    const oauth = getOAuth();
    const authData = oauth.authorize(reqData, { key: at, secret: ats });
    
    // FatSecret expects OAuth params in URL, not header
    const allParams = {
        ...params,
        ...Object.fromEntries(
            Object.entries(authData).map(([key, value]) => [key, String(value)])
        )
    };

    const url = API + "?" + new URLSearchParams(allParams).toString();
    const headers = {};
    
    console.log('Diary API URL:', url);
    console.log('Using access tokens:', { at: at?.substring(0, 10) + '...', ats: ats?.substring(0, 10) + '...' });
    
    const res = await fetch(url, { headers });
    const json = await res.json();
    
    console.log('Diary API response status:', res.status);
    console.log('Diary API response:', json);
    
    return NextResponse.json(json);
}
