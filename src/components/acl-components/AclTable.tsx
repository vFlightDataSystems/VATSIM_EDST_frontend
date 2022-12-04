import React, { useState } from "react";
import { Tooltips } from "~/tooltips";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { aclListSelector, anyAssignedHdgSelector, anyAssignedSpdSelector, anyHoldingSelector } from "~redux/selectors";
import { aselSelector, setAsel } from "~redux/slices/appSlice";
import { aclHiddenColumnsSelector, aclManualPostingSelector, toggleAclHideColumn, toolsOptionsSelector } from "~redux/slices/aclSlice";
import { VCI_SYMBOL } from "~/utils/constants";
import { AclRow } from "components/AclRow";
import { ListMapper } from "components/utils/ListMapper";
import aclStyles from "css/acl.module.scss";
import tableStyles from "css/table.module.scss";
import clsx from "clsx";

export const AclTable = () => {
  const dispatch = useRootDispatch();
  const manualPosting = useRootSelector(aclManualPostingSelector);
  const toolOptions = useRootSelector(toolsOptionsSelector);

  const asel = useRootSelector(aselSelector);
  const anyHolding = useRootSelector(anyHoldingSelector);
  const anyAssignedHeading = useRootSelector(anyAssignedHdgSelector);
  const anyAssignedSpeed = useRootSelector(anyAssignedSpdSelector);
  const hiddenColumns = useRootSelector(aclHiddenColumnsSelector);

  const [spaList, ackList, unAckList] = useRootSelector(aclListSelector);
  const [, setAltMouseDown] = useState(false);

  const handleClickSlash = () => {
    if (hiddenColumns.includes("SPD_ACL_ROW_FIELD") && hiddenColumns.includes("HDG_ACL_ROW_FIELD")) {
      dispatch(toggleAclHideColumn(["SPD_ACL_ROW_FIELD", "HDG_ACL_ROW_FIELD"]));
      if (asel?.field === "SPD_ACL_ROW_FIELD" || asel?.field === "HDG_ACL_ROW_FIELD") {
        dispatch(setAsel(null));
      }
    } else {
      if (!hiddenColumns.includes("HDG_ACL_ROW_FIELD")) {
        dispatch(toggleAclHideColumn("HDG_ACL_ROW_FIELD"));
        if (asel?.field === "HDG_ACL_ROW_FIELD") {
          dispatch(setAsel(null));
        }
      }
      if (!hiddenColumns.includes("SPD_ACL_ROW_FIELD")) {
        dispatch(toggleAclHideColumn("SPD_ACL_ROW_FIELD"));
        if (asel?.field === "SPD_ACL_ROW_FIELD") {
          dispatch(setAsel(null));
        }
      }
    }
  };

  return (
    <div className={tableStyles.body}>
      <div className={tableStyles.topRow}>
        <div className={clsx(aclStyles.radioCol, "header", "cGreen")}>{VCI_SYMBOL}</div>
        <div className={clsx(aclStyles.col1, "cRed")}>R</div>
        <div className={clsx(aclStyles.col1, "cYellow")}>Y</div>
        <div className={clsx(aclStyles.col1, "cOrange")}>A</div>
        <div className={clsx(tableStyles.specialBox, "isDisabled")} />
        <div className={tableStyles.innerRow}>
          <div className={clsx(tableStyles.fidCol, "noPointerEvents")}>Flight ID</div>
          <div className={aclStyles.paCol} title={Tooltips.aclHeaderPa}>
            PA
          </div>
          {toolOptions.displayCoordinationColumn && <div className={clsx(aclStyles.specialBox, "isDisabled")} />}
          {/* spa indicator column */}
          <div className={clsx(tableStyles.specialBox, "isDisabled")} />
          {/* hotbox column */}
          <div className={clsx(tableStyles.specialBox, "isDisabled")} />
          <div
            className={clsx(tableStyles.acTypeCol, { hover: true, hidden: hiddenColumns.includes("TYPE_ACL_ROW_FIELD") })}
            onMouseDown={() => dispatch(toggleAclHideColumn("TYPE_ACL_ROW_FIELD"))}
          >
            T{!hiddenColumns.includes("TYPE_ACL_ROW_FIELD") && "ype"}
          </div>
          <div
            className={clsx(tableStyles.altCol, { hover: true })}
            onMouseDown={() => setAltMouseDown(true)}
            onMouseUp={() => setAltMouseDown(false)}
          >
            Alt.
          </div>
          <div
            className={clsx(tableStyles.codeCol, { hover: true, hidden: hiddenColumns.includes("CODE_ACL_ROW_FIELD") })}
            onMouseDown={() => dispatch(toggleAclHideColumn("CODE_ACL_ROW_FIELD"))}
          >
            C{!hiddenColumns.includes("CODE_ACL_ROW_FIELD") && "ode"}
          </div>
          <div className={clsx(tableStyles.specialBox, "isDisabled")} />
          <div
            className={clsx(aclStyles.hdgCol, { hover: true, hidden: hiddenColumns.includes("HDG_ACL_ROW_FIELD") })}
            title={Tooltips.aclHeaderHdg}
            onMouseDown={() => dispatch(toggleAclHideColumn("HDG_ACL_ROW_FIELD"))}
          >
            {hiddenColumns.includes("HDG_ACL_ROW_FIELD") && anyAssignedHeading && "*"}H{!hiddenColumns.includes("HDG_ACL_ROW_FIELD") && "dg"}
          </div>
          <div className={aclStyles.slashColHeader} title={Tooltips.aclHeaderSlash} onMouseDown={handleClickSlash}>
            /
          </div>
          <div
            className={clsx(aclStyles.spdCol, { hover: true, hidden: hiddenColumns.includes("SPD_ACL_ROW_FIELD") })}
            title={Tooltips.aclHeaderSpd}
            onMouseDown={() => dispatch(toggleAclHideColumn("SPD_ACL_ROW_FIELD"))}
          >
            S{!hiddenColumns.includes("SPD_ACL_ROW_FIELD") && "pd"}
            {hiddenColumns.includes("SPD_ACL_ROW_FIELD") && anyAssignedSpeed && "*"}
          </div>
          <div className={clsx(tableStyles.specialBox, "isDisabled")} />
          <div className={clsx(tableStyles.specialBox, "isDisabled")} />
          {anyHolding && <div className={clsx(tableStyles.specialBox, "isDisabled")}>H</div>}
          {/* toggle remarks column */}
          <div className={clsx(tableStyles.specialBox, "isDisabled")} />
          <div className={tableStyles.routeCol}>Route</div>
        </div>
      </div>
      <div className="scrollContainer">
        <ListMapper key="aclSpaList" list={spaList} Component={AclRow} showSep />
        <ListMapper key="aclAckList" list={ackList} Component={AclRow} />
        {manualPosting && (
          <>
            <div className={tableStyles.separator} />
            <ListMapper key="aclUnAckList" list={unAckList} Component={AclRow} />
          </>
        )}
      </div>
    </div>
  );
};
