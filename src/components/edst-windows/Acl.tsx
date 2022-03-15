import React, {useRef} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/acl-styles.scss';
import {AclHeader} from "./acl-components/AclHeader";
import {AclTable} from "./acl-components/AclTable";
import {useAppSelector} from "../../redux/hooks";
import {draggingSelector} from "../../redux/slices/appSlice";
import {useFocused} from "../../hooks";

export const Acl: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  const dragging = useAppSelector(draggingSelector);

  return (<div
    ref={ref}
    className={`acl ${dragging ? 'dragging' : ''}`}
    // style={{zIndex: props.z_index}}
  >
    <AclHeader focused={focused}/>
    <AclTable/>
  </div>);
}
