import { SessionInfo } from "../types";

export const exchangeCode = async (code: string, redirectUrl: string) => {
  return fetch(
    `${process.env.REACT_APP_NAS_SERVER_URL}/api/auth/code-exchange?code=${code}&redirectUrl=${redirectUrl}&clientId=${process.env.REACT_APP_VATSIM_CLIENT_ID}`,
    {
      credentials: "include"
    }
  ).then(response => {
    return response.text().then(token => ({ token, statusText: response.statusText, ok: response.ok }));
  });
};

export const getSession = async (userId: string) => {
  return fetch(`${process.env.REACT_APP_NAS_SERVER_URL}/api/sessions/${userId}`).then(response => {
    if (response.status === 204) {
      return {
        // TODO: replace data with null
        data: { id: "123ABC", artccId: "ZBW", facilityId: "ZBW", positionId: "01G3CZTG1TFZZ4EB2PJ5P4MJ2X" } as SessionInfo | null,
        statusText: response.statusText,
        ok: response.ok
      };
    }
    return response.json().then(data => ({
      data: data as SessionInfo | null,
      statusText: response.statusText,
      ok: response.ok
    }));
  });
};
