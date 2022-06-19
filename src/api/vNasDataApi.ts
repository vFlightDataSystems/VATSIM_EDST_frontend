export const login = async (code: string, redirectUrl: string) => {
  return fetch(
    `${process.env.REACT_APP_ATC_SERVER_URL}/api/auth/code-exchange?code=${code}&redirectUrl=${redirectUrl}&clientId=${process.env.REACT_APP_VATSIM_CLIENT_ID}`,
    {
      credentials: "include"
    }
  ).then(response => {
    return response.text().then(token => ({ token, statusText: response.statusText, ok: response.ok }));
  });
};

export const logout = async () => {
  return fetch(`${process.env.REACT_APP_ATC_SERVER_URL}/api/auth/logout`, { credentials: "include" });
};
