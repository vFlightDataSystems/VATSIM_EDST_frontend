import React, {useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/acl-styles.scss';
import {AclHeader} from "./acl-components/AclHeader";
import {AclTable} from "./acl-components/AclTable";
import {useAppSelector} from "../../redux/hooks";
import {draggingSelector} from "../../redux/slices/appSlice";

export const Acl: React.FC = () => {
  const [focused, setFocused] = useState(false);
  const dragging = useAppSelector(draggingSelector);

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
