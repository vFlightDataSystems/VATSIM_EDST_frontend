import { faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { isLoggedInSelector, login } from "../redux/slices/authSlice";

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
`;

const Login = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const isLoggingIn = useSelector(isLoggedInSelector);
  const code = searchParams.get("code");

  if (code && !isLoggingIn) {
    dispatch(login({ code, redirectUrl: encodeURIComponent(`${process.env.REACT_APP_DOMAIN}/login`) }));
  }

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
            style={{ width: "150px" }}
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
