# Virtual Enroute Decision Support Tool (vEDST)

## ABOUT

This is project aims to simulate the Real World FAA ERAM EDST system as close as possible for the Virtual Air Traffic Control environment.  

## DOCUMENTATION
Documentation for the vEDST can be viewed [here](https://docs.edst.vfds.dev/).

The docs are markdown contained in the `docs/` directory of this repository. The documentation is built using [MkDocs](https://www.mkdocs.org/) and hosted on GitHub Pages. To build a local development version of the documentation, run `mkdocs serve` in the root directory of the repository.

## LOCAL DEVELOPMENT

Run `npm install`, create `.env.local` (gitignored), then `npm start`, which serves the app on http://localhost:3000.

`npm start` also serves the sign-in function `api/auth/login.ts` (deployed on Vercel as `/api/auth/login`), so `vercel dev` is not needed. It reads these `.env.local` keys:

| Key | Meaning |
| --- | --- |
| `VITE_VNAS_CONFIG_URL` | The vNAS configuration document listing the environments |
| `VITE_DOMAIN` | Where VATSIM sends the browser back to, plus `/login` |
| `VITE_VATSIM_CLIENT_ID` | The VATSIM Connect client the sign-in uses |
| `VATSIM_CLIENT_SECRET` | That client's secret, read only by the sign-in function; no `VITE_` prefix, so it never reaches the browser |
| `VITE_VATSIM_AUTH_BASE_URL` | Optional VATSIM Connect host, `https://auth.vatsim.net` by default; development builds only |
| `VITE_SERVERLESS_LOGIN_DEV_ORIGINS` | Optional comma-separated API origins that sign in through the function as vNAS hosts do; development builds only |

Environments on vNAS hosts sign in through the function. Any other environment, such as a [YAAT](https://github.com/leftos/yaat) server, exchanges the code at its own `/auth/login`, so the client and redirect are that server's ([YAAT's vEDST sign-in](https://github.com/leftos/yaat/blob/main/docs/vedst-sign-in.md)).

### Testing the sign-in function locally

VATSIM Connect will not redirect to `localhost` on production and vNAS has no development servers, so test against the [VATSIM Connect sandbox](https://vatsim.dev/services/connect/sandbox) and a local yaat-server, which accepts sandbox tokens at its vNAS-compatible `/vnas/auth/refresh` when run from source in Development.

1. Sign in at https://auth-dev.vatsim.net with a sandbox test account, open "Manage OAuth organizations", and add a client to the "VATSIM Connect Demo" organization with the redirect `http://localhost:3000/login`.
2. Run yaat-server from source (`dotnet run --project src/Yaat.Server`, which listens on `http://localhost:5130`).
3. Set `.env.local`:
   ```dotenv
   VITE_VNAS_CONFIG_URL=http://localhost:5130/vnas/configuration
   VITE_DOMAIN=http://localhost:3000
   VITE_VATSIM_AUTH_BASE_URL=https://auth-dev.vatsim.net
   VITE_SERVERLESS_LOGIN_DEV_ORIGINS=http://localhost:5130
   VITE_VATSIM_CLIENT_ID=<the sandbox client id>
   VATSIM_CLIENT_SECRET=<the sandbox client secret>
   ```
4. `npm start`, pick the `YAAT` environment and press **Login with VATSIM**, signing in with the same test account. The login page reaching "Waiting for vNAS Connection..." means the function exchanged the code and the environment accepted the token.

## CONTRIBUTING:
See the [contribution guide](CONTRIBUTING.md).

## EXTERNAL RIGHTS:

- VATSIM Icon use permission granted by MATT BARTELLS (VATSIM VP of Marketing and Communications) on 19JAN2022 to Kyle Sanders (vEDST Project Manager)
