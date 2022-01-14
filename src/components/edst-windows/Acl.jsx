import {useEffect, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/acl-styles.scss';
import AclHeader from "./acl-components/AclHeader";
import AclTable from "./acl-components/AclTable";

export function Acl(props) {
  const [focused, setFocused] = useState(false);
  const [posting_manual, setPostingManual] = useState(true);
  const unmount = () => props.unmount();
  useEffect(() => unmount(), []);

  return (<div
    className={`acl ${props.dragging ? 'dragging' : ''}`}
    // style={{zIndex: props.z_index}}
    onMouseEnter={() => setFocused(true)}
    onMouseLeave={() => setFocused(false)}
  >
    <AclHeader
      addEntry={props.addEntry}
      sort_data={props.sort_data}
      openMenu={props.openMenu}
      asel={props.asel}
      focused={focused}
      posting_manual={posting_manual}
      closeWindow={props.closeWindow}
      togglePosting={() => setPostingManual(!posting_manual)}
      cleanup={props.cleanup}
    />
    <AclTable
      posting_manual={posting_manual}
    />
  </div>);
}
