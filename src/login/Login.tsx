import { useHubConnector } from "hooks/useHubConnector";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect } from "react";
import { HubContextProvider } from '../contexts/HubContext';
import { SocketContextProvider } from '../contexts/SocketContext';
import { useNavigate, useSearchParams } from "react-router-dom";
import { configSelector, envSelector, login, setEnv, vatsimTokenSelector, logout, sessionSelector } from "~redux/slices/authSlice";
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
  const hubSession = useRootSelector(sessionSelector);
  const { connectHub, disconnectHub } = useHubConnector();

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

  const handleLogout = () => {
    disconnectHub();
    dispatch(logout());
    dispatch(setEnv(""));
    const currentPath = window.location.pathname;
    window.history.replaceState({}, document.title, currentPath);
    window.location.reload();
  };

  useEffect(() => {
    if (vatsimToken && env && hubSession === null) {
      const connectionTimer = setTimeout(() => {
        console.debug('Attempting hub connection...');
        connectHub().catch((e) => {
          console.warn("Failed to connect to hub:", e?.message || 'Unknown error');
        });
      }, 500);
      
      return () => clearTimeout(connectionTimer);
    }
  }, [vatsimToken, env, hubSession, connectHub]);

  useEffect(() => {
    if (vatsimToken && hubSession) {
      navigate("/", { replace: true });
    }
  }, [navigate, vatsimToken, hubSession]);

  return (
    <>
      <div className={loginStyles.bg} />
      <div className={loginStyles.root}>
        <div>
          <img src="/img/vEDSTLogo.png" alt="vEDST Logo" width="200" />
          {vatsimToken ? (
            <>
              <div className={loginStyles.waiting}>
                <br />
                Waiting for vNAS Connection...
                <br />
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className={loginStyles.logoutButton}
              >
                Logout
              </button>
            </>
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
