// Use global to persist across module reloads in development
declare global {
  var __oauthTokenStore: Map<string, string> | undefined;
}

const mem = globalThis.__oauthTokenStore ?? (globalThis.__oauthTokenStore = new Map<string, string>());

export const setReqSecret = (token: string, secret: string) => {
  mem.set(token, secret);
};
export const getReqSecret = (token: string) => {
  return mem.get(token);
};
export const delReqSecret = (token: string) => mem.delete(token);
