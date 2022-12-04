import { faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { login, vatsimTokenSelector } from "~redux/slices/authSlice";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { DOMAIN, VATSIM_CLIENT_ID } from "~/utils/constants";
import loginStyles from "css/login.module.scss";

const Login = () => {
  const dispatch = useRootDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const vatsimToken = useRootSelector(vatsimTokenSelector);

  useEffect(() => {
    if (code) {
      dispatch(
        login({
          code,
          redirectUrl: encodeURIComponent(`${DOMAIN}/login`),
        })
      );
    }
  }, [code, dispatch]);

  useEffect(() => {
    if (vatsimToken) {
      navigate("/", { replace: true });
    }
  }, [navigate, vatsimToken]);

  return (
    <>
      <div className={loginStyles.bg} />
      <div className={loginStyles.root}>
        <div>
          <img src="/img/vEDSTLogo.png" alt="vEDST Logo" width="200" />
          <button
            type="button"
            disabled={code !== null}
            onClick={() => {
              window.location.href = `https://auth.vatsim.net/oauth/authorize?client_id=${VATSIM_CLIENT_ID}&redirect_uri=${encodeURIComponent(
                `${DOMAIN}/login`
              )}&response_type=code&scope=vatsim_details`;
            }}
          >
            {code ? (
              /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
              <FontAwesomeIcon // @ts-ignore
                icon={faGear}
                className="fa-spin"
              />
            ) : (
              "Login with VATSIM"
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Login;
