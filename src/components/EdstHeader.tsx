import type { CSSProperties } from "react";
import React from "react";
import { Tooltips } from "~/tooltips";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { headerTopSelector, setHeaderTop, toggleWindow, windowSelector, windowsSelector } from "~redux/slices/appSlice";
import { planQueueSelector } from "~redux/slices/planSlice";
import { sectorIdSelector } from "~redux/slices/sectorSlice";
import type { EdstWindow } from "types/edstWindow";
import { openWindowThunk } from "~redux/thunks/openWindowThunk";
import { Time } from "components/utils/Time";
import { aclLenSelector, depLenSelector, sigmetLenSelector } from "~redux/selectors";
import edstStyles from "css/edst.module.scss";
import clsx from "clsx";

const YELLOW = "#A3A300";
// const RED = "#590000";

type EdstHeaderButtonCSSProps = Pick<CSSProperties, "width" | "color" | "borderColor" | "backgroundColor">;
type EdstHeaderButtonProps = {
  title?: string;
  disabled?: boolean;
  content: string;
  window: EdstWindow;
} & EdstHeaderButtonCSSProps;

const noToggleWindows = ["ACL", "DEP", "GPD", "PLANS_DISPLAY"];

const EdstHeaderButton = ({ title, content, disabled, window, borderColor, ...props }: EdstHeaderButtonProps) => {
  const dispatch = useRootDispatch();
  const edstWindow = useRootSelector((state) => windowSelector(state, window));

  const mouseDownHandler = () => {
    if (noToggleWindows.includes(window)) {
      dispatch(openWindowThunk(window));
    } else {
      dispatch(toggleWindow(window));
    }
  };

  return (
    <button
      style={{ "--border-color": borderColor, ...props }}
      type="button"
      onMouseDown={mouseDownHandler}
      title={title}
      disabled={disabled}
      className={clsx({ highlight: edstWindow.open })}
    >
      {content}
    </button>
  );
};

const EdstHeaderButton6 = (props: EdstHeaderButtonProps) => <EdstHeaderButton width="6ch" {...props} />;

export const EdstHeader = () => {
  const dispatch = useRootDispatch();
  const planQueue = useRootSelector(planQueueSelector);
  const windows = useRootSelector(windowsSelector);
  const headerTop = useRootSelector(headerTopSelector);

  const sectorId = useRootSelector(sectorIdSelector);
  const aclLen = useRootSelector(aclLenSelector);
  const depLen = useRootSelector(depLenSelector);
  const sigLen = useRootSelector(sigmetLenSelector);
  const giLen = 0;

  return (
    <div className={clsx(edstStyles.header, { bottom: !headerTop })}>
      {windows.MORE.open && !headerTop && (
        <div className={edstStyles.headerRow}>
          <div className={clsx(edstStyles.headerCol, edstStyles.bottomCol)}>
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
          </div>
        </div>
      )}
      <div className={edstStyles.headerRow}>
        <div className={edstStyles.headerCol}>
          <button style={{ width: "1.4ch" }} onMouseDown={() => dispatch(setHeaderTop(!headerTop))}>
            {headerTop ? "#" : "@"}
          </button>
          <button style={{ width: "6ch" }} className={clsx({ highlight: windows.MORE.open })} onMouseDown={() => dispatch(toggleWindow("MORE"))}>
            MORE
          </button>
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
          <EdstHeaderButton window="CPDLC_ADV" content="CPDLC ADV" disabled />
          <EdstHeaderButton window="CPDLC_HIST" content="CPDLC HIST" disabled />
          <EdstHeaderButton window="CPDLC_MSG" content="CPDLC MSGOUT" disabled />
          <button disabled>KEEP ALL</button>
        </div>
        <div className={edstStyles.headerCol}>
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
        </div>
      </div>
      {windows.MORE.open && headerTop && (
        <div className={edstStyles.headerRow}>
          <div className={clsx(edstStyles.headerCol, edstStyles.bottomCol)}>
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
          </div>
        </div>
      )}
    </div>
  );
};
