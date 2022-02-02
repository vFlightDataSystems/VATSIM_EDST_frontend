import React, {useContext, useEffect, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/acl-styles.scss';
import {AclHeader} from "./acl-components/AclHeader";
import {AclTable} from "./acl-components/AclTable";
import {EdstContext} from "../../contexts/contexts";

interface AclProps {
  closeWindow: () => void;
  cleanup: () => void;
  unmount: () => void;
}

export const Acl: React.FC<AclProps> = (props) => {
  const [focused, setFocused] = useState(false);
  const {dragging} = useContext(EdstContext);
  const unmount = () => props.unmount();
  useEffect(() => {
    return () => unmount();
    // eslint-disable-next-line
  }, []);

  return (<div
    className={`acl ${dragging ? 'dragging' : ''}`}
    // style={{zIndex: props.z_index}}
    onMouseEnter={() => setFocused(true)}
    onMouseLeave={() => setFocused(false)}
  >
    <AclHeader
      focused={focused}
      cleanup={props.cleanup}
      closeWindow={props.closeWindow}
    />
    <AclTable/>
  </div>);
}
