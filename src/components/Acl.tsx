import React from "react";
import { EdstWindow } from "enums/edstWindow";
import { FullscreenWindow } from "components/utils/FullscreenWindow";
import { AclHeader } from "components/AclHeader";
import { AclTable } from "components/AclTable";

export const Acl = () => <FullscreenWindow edstWindow={EdstWindow.ACL} HeaderComponent={AclHeader} BodyComponent={AclTable} />;
