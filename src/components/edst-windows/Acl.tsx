import React, {useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/acl-styles.scss';
import {AclHeader} from "./acl-components/AclHeader";
import {AclTable} from "./acl-components/AclTable";
import {useAppSelector} from "../../redux/hooks";

export const Acl: React.FC = () => {
  const [focused, setFocused] = useState(false);
  const dragging = useAppSelector((state) => state.app.dragging);

  return (<div
    className={`acl ${dragging ? 'dragging' : ''}`}
    // style={{zIndex: props.z_index}}
    onMouseEnter={() => setFocused(true)}
    onMouseLeave={() => setFocused(false)}
  >
    <AclHeader focused={focused}/>
    <AclTable/>
  </div>);
}
