import {FunctionComponent, useEffect, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/acl-styles.scss';
import {AclHeader} from "./acl-components/AclHeader";
import {AclTable} from "./acl-components/AclTable";
import {AselProps} from "../../interfaces";

interface AclProps {
  asel: AselProps | null;
  sort_data: {sector: boolean, name: string};
  dragging?: any;
  addEntry: Function;
  openMenu: Function;
  closeWindow: Function;
  cleanup: Function;
  unmount: Function;
}

export const Acl: FunctionComponent<AclProps> = (props) => {
  const [focused, setFocused] = useState(false);
  const unmount = () => props.unmount();
  useEffect(() => {
    return () => unmount();
    // eslint-disable-next-line
  }, []);

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
      cleanup={props.cleanup}
      closeWindow={props.closeWindow}
    />
    <AclTable/>
  </div>);
}
