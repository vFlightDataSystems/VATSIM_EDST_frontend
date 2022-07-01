type LoginDto = {
  nasToken: string;
  vatsimToken: string;
};

export const login = async (code: string, redirectUrl: string) => {
  return fetch(
    `${process.env.REACT_APP_NAS_SERVER_URL}/api/auth/login?code=${code}&redirectUrl=${redirectUrl}&clientId=${process.env.REACT_APP_VATSIM_CLIENT_ID}`,
    {
      credentials: "include"
    }
  ).then(response => {
    return response.json().then((data: LoginDto) => ({ ...data, statusText: response.statusText, ok: response.ok }));
  });
};

export const refreshToken = async (vatsimToken: string) => {
  return fetch(`${process.env.REACT_APP_NAS_URL}/api/auth/refresh?vatsimToken=${vatsimToken}`).then(r =>
    r.text().then(data => ({ data, statusText: r.statusText, ok: r.ok }))
  );
};
