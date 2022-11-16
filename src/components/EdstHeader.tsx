import React from "react";
import type { CSSProperties } from "styled-components";
import styled, { css } from "styled-components";
import { Tooltips } from "~/tooltips";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { toggleWindow, windowSelector, windowsSelector } from "~redux/slices/appSlice";
import { planQueueSelector } from "~redux/slices/planSlice";
import { sectorIdSelector } from "~redux/slices/sectorSlice";
import type { EdstWindow } from "types/edstWindow";
import { openWindowThunk } from "~redux/thunks/openWindowThunk";
import { borderHover } from "styles/styles";
import { EdstTooltip } from "components/utils/EdstTooltip";
import { Time } from "components/utils/Time";
import { aclLenSelector, depLenSelector, sigmetLenSelector } from "~redux/selectors";

const YELLOW = "#A3A300";
// const RED = "#590000";

const EdstHeaderDiv = styled.div`
  height: auto;
  font-family: ${(props) => props.theme.fontProps.eramFontFamily};
  width: 100vw;
  position: absolute;
`;

const EdstHeaderRow = styled.div`
  margin-top: 2px;
  z-index: 20001;
  justify-content: space-between;
  height: auto;
  display: flex;
`;
type EdstHeaderColProps = { bottomRow?: boolean };
const EdstHeaderCol = styled.div<EdstHeaderColProps>`
  z-index: 20001;
  display: inline-flex;
  ${(props) => props.bottomRow && { "margin-left": "calc(7.6ch + 4px)" }};
`;

type ColButtonCSSProps = Pick<CSSProperties, "width" | "color" | "fontWeight" | "backgroundColor" | "borderColor">;
type ColButtonProps = { highlight?: boolean } & ColButtonCSSProps;
const ColButton = styled.button<ColButtonProps>`
  padding: 0;
  border: none;
  display: flex;
  height: 2em;
  justify-content: center;
  line-height: 0.95em;
  font-size: inherit;
  margin: 0 1px;
  ${(props) => css`
    font-family: ${props.theme.fontProps.eramFontFamily};
    width: ${props.width ?? "7ch"};
    color: ${props.color ?? props.theme.colors.grey};
    background-color: ${props.highlight ? "#595959" : props.backgroundColor ?? "#000000"};
    font-weight: ${props.fontWeight ?? "normal"};
    border: 1px solid ${props.borderColor ?? props.theme.colors.grey};
  `};

  ${borderHover};
  &[disabled] {
    pointer-events: none;
    border: 1px solid #707070;
    color: #707070;
  }
`;

type EdstHeaderButtonCSSProps = Pick<CSSProperties, "width" | "color" | "backgroundColor" | "borderColor">;
type EdstHeaderButtonProps = {
  title?: string;
  disabled?: boolean;
  content: string;
  window: EdstWindow;
} & EdstHeaderButtonCSSProps;

const noToggleWindows = ["ACL", "DEP", "GPD", "PLANS_DISPLAY"];

const EdstHeaderButton = ({ title, content, ...props }: EdstHeaderButtonProps) => {
  const dispatch = useRootDispatch();
  const edstWindow = useRootSelector((state) => windowSelector(state, props.window));

  const mouseDownHandler = () => {
    if (noToggleWindows.includes(props.window)) {
      dispatch(openWindowThunk(props.window));
    } else {
      dispatch(toggleWindow(props.window));
    }
  };

  return (
    <EdstTooltip title={title}>
      <ColButton {...props} highlight={edstWindow.open} disabled={props.disabled} onMouseDown={mouseDownHandler}>
        {content}
      </ColButton>
    </EdstTooltip>
  );
};

const EdstHeaderButton6 = (props: EdstHeaderButtonProps) => <EdstHeaderButton width="6ch" {...props} />;

export const EdstHeader = () => {
  const dispatch = useRootDispatch();
  const planQueue = useRootSelector(planQueueSelector);
  const windows = useRootSelector(windowsSelector);

  const sectorId = useRootSelector(sectorIdSelector);
  const aclLen = useRootSelector(aclLenSelector);
  const depLen = useRootSelector(depLenSelector);
  const sigLen = useRootSelector(sigmetLenSelector);
  const giLen = 0;

  return (
    <EdstHeaderDiv>
      <EdstHeaderRow>
        <EdstHeaderCol>
          <ColButton width="1.6ch" disabled>
            #
          </ColButton>
          <ColButton width="6ch" highlight={windows.MORE.open} onMouseDown={() => dispatch(toggleWindow("MORE"))}>
            MORE
          </ColButton>
          <EdstHeaderButton window="ACL" content={`ACL ${aclLen.toString().padStart(2, "0")}`} title={Tooltips.acl} />
          <EdstHeaderButton window="DEP" content={`DEP ${depLen.toString().padStart(2, "0")}`} title={Tooltips.dep} />
          <EdstHeaderButton
            window="GPD"
            content="GPD"
            // title={Tooltips.gpd}
          />
          <EdstHeaderButton window="PLANS_DISPLAY" content="PLANS" disabled={planQueue.length === 0} title={Tooltips.plans} />
          <EdstHeaderButton
            window="METAR"
            content="WX REPORT"
            // title={Tooltips.wx}
          />
          <EdstHeaderButton
            window="SIGMETS"
            borderColor={sigLen > 0 ? YELLOW : undefined}
            color={sigLen > 0 ? YELLOW : undefined}
            content={`SIG ${sigLen > 0 ? sigLen.toString().padStart(2, "0") : "✓"}`}
            // title={Tooltips.sig}
          />
          <EdstHeaderButton
            window="GI"
            content={`GI ${giLen > 0 ? giLen.toString().padStart(2, "0") : ""}`}
            // title={Tooltips.gi}
          />
          <EdstHeaderButton
            window="UA"
            content="UA"
            disabled
            // title={Tooltips.ua}
          />
          <ColButton highlight={false} disabled>
            KEEP ALL
          </ColButton>
        </EdstHeaderCol>
        <EdstHeaderCol>
          <EdstHeaderButton window="STATUS" content="STATUS ACTIVE" title={Tooltips.statusActive} />
          <EdstHeaderButton window="OUTAGE" content={`OUTAGE ${sectorId}`} title={Tooltips.statusOutage} />
          <Time />
          <EdstHeaderButton6
            window="ADSB"
            content="NON-ADSB"
            disabled
            // title={Tooltips.adsb}
          />
          <EdstHeaderButton6
            window="SAT"
            content="SAT COMM"
            disabled
            // title={Tooltips.sat}
          />
          <EdstHeaderButton6
            window="MSG"
            // backgroundColor={YELLOW}
            // borderColor={YELLOW}
            content="MSG WAIT"
            disabled
            // title={Tooltips.msg}
          />
        </EdstHeaderCol>
      </EdstHeaderRow>
      {windows.MORE.open && (
        <EdstHeaderRow>
          <EdstHeaderCol bottomRow>
            <EdstHeaderButton
              window="WIND"
              content="WIND"
              disabled
              // title={Tooltips.wind}
            />
            <EdstHeaderButton
              window="ALTIMETER"
              content="ALTIM SET"
              // title={Tooltips.alt}
            />
            <EdstHeaderButton window="MESSAGE_COMPOSE_AREA" content="MCA" title={Tooltips.mca} />
            <EdstHeaderButton window="MESSAGE_RESPONSE_AREA" content="RA" title={Tooltips.ra} />
            <EdstHeaderButton
              window="FEL"
              content="FEL"
              disabled
              // title={Tooltips.fel}
            />
            <EdstHeaderButton
              window="CPDLC_HIST"
              content="CPDLC HIST"
              disabled
              // title={Tooltips.cpdlc_hist}
            />
            <EdstHeaderButton
              window="CPDLC_MSG"
              content="CPDLC MSGOUT"
              disabled
              // title={Tooltips.cpdlc_msg_out}
            />
          </EdstHeaderCol>
        </EdstHeaderRow>
      )}
    </EdstHeaderDiv>
  );
};
