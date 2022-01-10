import {useEffect, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/acl-styles.scss';
import AclHeader from "./acl-components/AclHeader";
import AclTable from "./acl-components/AclTable";

export default function Acl(props) {
  const [focused, setFocused] = useState(false);
  const [posting_manual, setPostingManual] = useState(true);

  useEffect(() => props.unmount(), []);

  return (<div
    className={`acl ${props.dragging ? 'dragging' : ''}`}
    // style={{zIndex: props.z_index}}
    onMouseEnter={() => setFocused(true)}
    onMouseLeave={() => setFocused(false)}
  >
    <AclHeader
      addEntry={props.addEntry}
      sorting={props.sorting}
      openMenu={props.openMenu}
      asel={props.asel}
      focused={focused} posting_manual={posting_manual}
      closeWindow={props.closeWindow}
      togglePosting={() => setPostingManual(!posting_manual)}
      cleanup={props.cleanup}
    />
    <AclTable
      posting_manual={posting_manual}
      sorting={props.sorting}
      cid_list={props.cid_list}
      edst_data={props.edst_data}
      asel={props.asel}
      updateEntry={props.updateEntry}
      amendEntry={props.amendEntry}
      aircraftSelect={props.aircraftSelect}
      deleteEntry={props.deleteEntry}
    />
  </div>);
}
