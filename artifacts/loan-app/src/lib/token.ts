import { setAuthTokenGetter } from "@workspace/api-client-react";

let currentToken: string | null = null;

export const setToken = (token: string | null) => {
  currentToken = token;
};

export const getToken = () => currentToken;

// Register the getter with custom-fetch so it automatically attaches Authorization: Bearer
setAuthTokenGetter(getToken);
