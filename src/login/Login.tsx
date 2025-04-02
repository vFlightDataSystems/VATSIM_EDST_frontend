import { useHubConnector } from "hooks/useHubConnector";
import { useHubConnection } from "hooks/useHubConnection";
import { useInterval } from "usehooks-ts";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect } from "react";
import { HubContextProvider } from '../contexts/HubContext';
import { SocketContextProvider } from '../contexts/SocketContext';
import { useNavigate, useSearchParams } from "react-router-dom";
import { configSelector, envSelector, login, setEnv, vatsimTokenSelector, hubConnectedSelector } from "~redux/slices/authSlice";
import { useRootDispatch, useRootSelector } from "~redux/hooks"; 
import { DOMAIN, VATSIM_CLIENT_ID } from "~/utils/constants";
import loginStyles from "css/login.module.scss";

function redirectLogin() {
  window.location.href = `https://auth.vatsim.net/oauth/authorize?client_id=${VATSIM_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    `${DOMAIN}/login`
  )}&response_type=code&scope=vatsim_details`;
}

const Login = () => {
  const dispatch = useRootDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const vatsimToken = useRootSelector(vatsimTokenSelector);
  const config = useRootSelector(configSelector);
  const env = useRootSelector(envSelector);
  const hubConnected = useRootSelector(hubConnectedSelector);
  const { connectHub } = useHubConnector();

  useEffect(() => {
    if (code && env) {
      dispatch(
        login({
          code,
          redirectUrl: encodeURIComponent(`${DOMAIN}/login`),
        })
      );
    }
  }, [code, dispatch, env]);

  // Try connecting to hub every second when we have a token but session isn't active
  useInterval(() => {
    // Early return if we don't have required values
    if (!vatsimToken || hubConnected === undefined) {
      console.debug('Waiting for vatsim token or session state...');
      return;
    }

    // Only try connecting if we have token but no active session
    if (vatsimToken && hubConnected === false) {
      try {
        console.debug('Attempting hub connection...');
        connectHub().catch((e) => {
          console.warn("Failed to connect to hub:", e?.message || 'Unknown error');
        });
      } catch (err) {
        console.error("Error during hub connection:", err);
      }
    }
  }, 1000);

  // Navigate when session becomes active
  useEffect(() => {
    if (vatsimToken && hubConnected) {
      navigate("/", { replace: true });
    }
  }, [navigate, vatsimToken, hubConnected]);

  return (
    <>
      <div className={loginStyles.bg} />
      <div className={loginStyles.root}>
        <div>
          <img src="/img/vEDSTLogo.png" alt="vEDST Logo" width="200" />
          {vatsimToken ? (
            <div className={loginStyles.waiting}>
              <br></br>
              Waiting for vNAS Connection...
            </div>
          ) : (
            <>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    dispatch(setEnv(e.target.value));
                  }
                }}
                value={env?.name}
              >
                {config &&
                  config.environments.map((e) => (
                    <option key={e.name} disabled={e.isDisabled}>
                      {e.name}
                    </option>
                  ))}
              </select>
              <button type="button" disabled={code !== null} onClick={redirectLogin}>
                {code ? (
                  <FontAwesomeIcon icon={faGear} className="fa-spin" />
                ) : (
                  "Login with VATSIM"
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

const LoginProvider = () => (
  <React.StrictMode>
    <SocketContextProvider>
      <HubContextProvider>
        <Login />
      </HubContextProvider>
    </SocketContextProvider>
  </React.StrictMode>
);

export default LoginProvider;
