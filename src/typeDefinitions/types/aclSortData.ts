import { AclSortOption } from "enums/acl/aclSortOption";

export type AclSortData = { selectedOption: AclSortOption; sector: boolean };

export type AclSortKey = "OB" | "OT" | "OC" | "OS" | "OA" | "OD" | "OSB" | "OST" | "OSC" | "OSA" | "OSD";
export const SORT_KEYS_NOT_IMPLEMENTED = ["OB", "OT", "OC", "OS", "OSB", "OST", "OSC"];
export const ACL_SORT_MAP: Record<AclSortKey, AclSortData> = {
  OB: {
    selectedOption: AclSortOption.BOUNDARY_TIME,
    sector: false,
  },
  OT: {
    selectedOption: AclSortOption.CONFLICT_TIME,
    sector: false,
  },
  OC: {
    selectedOption: AclSortOption.CONFLICT_STATUS,
    sector: false,
  },
  OS: {
    selectedOption: AclSortOption.SECTOR_BY_SECTOR,
    sector: false,
  },
  OA: {
    selectedOption: AclSortOption.ACID,
    sector: false,
  },
  OD: {
    selectedOption: AclSortOption.DESTINATION,
    sector: false,
  },
  OSB: {
    selectedOption: AclSortOption.BOUNDARY_TIME,
    sector: true,
  },
  OST: {
    selectedOption: AclSortOption.CONFLICT_TIME,
    sector: true,
  },
  OSC: {
    selectedOption: AclSortOption.CONFLICT_STATUS,
    sector: true,
  },
  OSA: {
    selectedOption: AclSortOption.ACID,
    sector: true,
  },
  OSD: {
    selectedOption: AclSortOption.DESTINATION,
    sector: true,
  },
};
export const ACL_SORT_UU_ARGS = Object.keys(ACL_SORT_MAP);
export function isAclSortKey(str: string): str is AclSortKey {
  return ACL_SORT_UU_ARGS.includes(str);
}
