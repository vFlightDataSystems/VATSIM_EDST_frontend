import React from "react";
import { AclHeader } from "./acl-components/AclHeader";
import { AclTable } from "./acl-components/AclTable";
import { EdstWindow } from "../../enums/edstWindow";
import { FullscreenWindow } from "./FullscreenWindow";

export const Acl = () => <FullscreenWindow edstWindow={EdstWindow.ACL} HeaderComponent={AclHeader} BodyComponent={AclTable} />;
