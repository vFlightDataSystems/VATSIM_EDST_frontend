import { AclSortOption } from "../../enums/acl/aclSortOption";

export class SharedAclState {
  open = false;

  sortOption = AclSortOption.ACID;

  sortSector = false;

  manualPosting = true;
}
