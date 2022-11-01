// noinspection CssUnknownTarget
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { login, vatsimTokenSelector } from "~redux/slices/authSlice";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { VATSIM_CLIENT_ID } from "api/vNasDataApi";
import { DOMAIN } from "~/utils/constants";

const LoginPanel = styled.div`
  height: 100vh;
  width: 35vw;
  background-color: #222222;
  position: fixed;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  box-shadow: -5px 0 40px 5px rgba(0, 0, 0, 0.5);

  > div {
    background-color: #585858;
    padding: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    border-radius: 15px;
    box-shadow: -5px 0 40px 5px rgba(0, 0, 0, 0.5);
  }
`;

// noinspection CssUnknownTarget
const LoginBackground = styled.div`
  height: 100vh;
  width: 100vw;
  position: fixed;
  background-repeat: no-repeat;
  background-size: cover;
  background-image: url(${import.meta.env.PUBLIC_URL}/img/EDST_SEND_ROUTE.jpg);
`;

const Button = styled.button`
  /* Adapt the colors based on primary prop */
  background-color: #1dbe77;
  color: white;

  transition: color 0.05s ease-in-out, background-color 0.05s ease-in-out, border-color 0.05s ease-in-out, box-shadow 0.05s ease-in-out;

  font-size: 1em;
  margin: 1em;
  padding: 0.25em 1em;
  border: 2px solid #1dbe77;
  border-radius: 3px;
  width: 150px;

  :not(:disabled) {
    cursor: pointer;
  }

  :focus {
    background-color: #009670;
    border-color: #008966;
    box-shadow: 0 0 0 0 rgb(38 198 157 / 50%);
  }

  :hover:not(:disabled) {
    background-color: #009670;
    border-color: #008966;
  }
`;

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
      <LoginBackground />
      <LoginPanel>
        <div>
          <img src="/img/vEDSTLogo.png" alt="vEDST Logo" width="200" />
          <Button
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
          </Button>
        </div>
      </LoginPanel>
    </>
  );
};

export default Login;
