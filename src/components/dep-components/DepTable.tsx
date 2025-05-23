import React from "react";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { depHiddenColumnsSelector, depManualPostingSelector, toggleDepHideColumn } from "~redux/slices/depSlice";
import { COMPLETED_CHECKMARK_SYMBOL } from "~/utils/constants";
import { DepRow } from "components/DepRow";
import { ListMapper } from "components/utils/ListMapper";
import { depListSelector } from "~redux/selectors";
import tableStyles from "css/table.module.scss";
import clsx from "clsx";

export const DepTable = () => {
  const dispatch = useRootDispatch();
  const manualPosting = useRootSelector(depManualPostingSelector);
  const hiddenColumns = useRootSelector(depHiddenColumnsSelector);

  const [spaList, ackList, unAckList] = useRootSelector(depListSelector);

  return (
    <div className={tableStyles.body}>
      <div className={tableStyles.topRow}>
        <div className={clsx(tableStyles.checkmarkCol, "noPointerEvents")}>{COMPLETED_CHECKMARK_SYMBOL}</div>
        <div className={tableStyles.pTimeCol}>P-Time</div>
        <div className={clsx(tableStyles.fidCol, "owned", "noPointerEvents")}>Flight ID</div>
        <div className={clsx(tableStyles.specialBox, "noPointerEvents")} />
        <div className={clsx(tableStyles.specialBox, "noPointerEvents")} />
        <div className={clsx(tableStyles.specialBox, "noPointerEvents")} />
        <div
          className={clsx(tableStyles.acTypeCol, { hover: true, hidden: hiddenColumns.includes("TYPE_DEP_ROW_FIELD") })}
          onMouseDown={() => dispatch(toggleDepHideColumn("TYPE_DEP_ROW_FIELD"))}
        >
          T{!hiddenColumns.includes("TYPE_DEP_ROW_FIELD") && "ype"}
        </div>
        <div className={clsx(tableStyles.altCol)}>Alt.</div>
        <div
          className={clsx(tableStyles.codeCol, { hover: true, hidden: hiddenColumns.includes("CODE_DEP_ROW_FIELD") })}
          onMouseDown={() => dispatch(toggleDepHideColumn("CODE_DEP_ROW_FIELD"))}
        >
          C{!hiddenColumns.includes("CODE_DEP_ROW_FIELD") && "ode"}
        </div>
        <div className={clsx(tableStyles.specialBox, "noPointerEvents")} />
        <div className={tableStyles.routeCol}>Route</div>
      </div>
      <div className="scrollContainer">
        <ListMapper key="depSpaList" list={spaList} Component={DepRow} showSep />
        <ListMapper key="depAckList" list={ackList} Component={DepRow} />
        {manualPosting && (
          <>
            <div className={tableStyles.separator} />
            <ListMapper key="depUnAckList" list={unAckList} Component={DepRow} />
          </>
        )}
      </div>
    </div>
  );
};
