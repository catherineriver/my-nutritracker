// src/lib/oauth.ts
import OAuth from "oauth-1.0a";
import crypto from "crypto";

function reqEnv(name: string) {
    const v = process.env[name];
    if (!v) throw new Error(`ENV ${name} is missing`);
    return v;
}

export function getOAuth() {
    const key = reqEnv("FATSECRET_CONSUMER_KEY");
    const secret = reqEnv("FATSECRET_CONSUMER_SECRET");
    return new OAuth({
        consumer: { key, secret },
        signature_method: "HMAC-SHA1",
        hash_function(base, key) {
            return crypto.createHmac("sha1", key).update(base).digest("base64");
        },
    });
}
