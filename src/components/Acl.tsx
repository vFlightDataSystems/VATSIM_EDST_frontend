import React from "react";
import { FullscreenWindow } from "components/utils/FullscreenWindow";
import { AclHeader } from "components/AclHeader";
import { AclTable } from "components/AclTable";

export const Acl = () => <FullscreenWindow edstWindow="ACL" HeaderComponent={AclHeader} BodyComponent={AclTable} />;
