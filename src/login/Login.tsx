// noinspection CssUnknownTarget

import { faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import {login, vatsimTokenSelector} from "../redux/slices/authSlice";
import {useHub} from '../hooks/hub';
import {useRootSelector} from '../redux/hooks';

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

const LoginBackground = styled.div`
  height: 100vh;
  width: 100vw;
  position: fixed;
  background-repeat: no-repeat;
  background-size: cover;
  background-image: url(${process.env.PUBLIC_URL}/img/EDST_SEND_ROUTE.jpg);
`;

const Button = styled.button`
  /* Adapt the colors based on primary prop */
  background-color: #1dbe77;
  color: white;

  font-size: 1em;
  margin: 1em;
  padding: 0.25em 1em;
  border: 2px solid #1dbe77;
  border-radius: 3px;
  width: 150px;
`;

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const vatsimToken = useRootSelector(vatsimTokenSelector);

  useEffect(() => {
    if (code) {
      dispatch(login({ code, redirectUrl: encodeURIComponent(`${process.env.REACT_APP_DOMAIN}/login`) }));
    }
  }, [code]);

  useEffect(() => {
    if (vatsimToken) {
      navigate("/", { replace: true });
    }
  }, [vatsimToken]);

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
              window.location.href = `https://auth.vatsim.net/oauth/authorize?client_id=${
                process.env.REACT_APP_VATSIM_CLIENT_ID
              }&redirect_uri=${encodeURIComponent(`${process.env.REACT_APP_DOMAIN}/login`)}&response_type=code&scope=vatsim_details`;
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
