import type { AclSortOption } from "types/acl/aclSortOption";

export type AclSortData = { selectedOption: AclSortOption; sector: boolean };

export type AclSortKey = "OB" | "OT" | "OC" | "OS" | "OA" | "OD" | "OSB" | "OST" | "OSC" | "OSA" | "OSD";
export const SORT_KEYS_NOT_IMPLEMENTED = ["OB", "OT", "OC", "OS", "OSB", "OST", "OSC"];
export const ACL_SORT_MAP: Record<AclSortKey, AclSortData> = {
  OB: {
    selectedOption: "ACL_BOUNDARY_TIME_SORT_OPTION",
    sector: false,
  },
  OT: {
    selectedOption: "ACL_CONFLICT_TIME_SORT_OPTION",
    sector: false,
  },
  OC: {
    selectedOption: "ACL_CONFLICT_STATUS_SORT_OPTION",
    sector: false,
  },
  OS: {
    selectedOption: "ACL_SECTOR_BY_SECTOR_SORT_OPTION",
    sector: false,
  },
  OA: {
    selectedOption: "ACL_ACID_SORT_OPTION",
    sector: false,
  },
  OD: {
    selectedOption: "ACL_DESTINATION_SORT_OPTION",
    sector: false,
  },
  OSB: {
    selectedOption: "ACL_BOUNDARY_TIME_SORT_OPTION",
    sector: true,
  },
  OST: {
    selectedOption: "ACL_CONFLICT_TIME_SORT_OPTION",
    sector: true,
  },
  OSC: {
    selectedOption: "ACL_CONFLICT_STATUS_SORT_OPTION",
    sector: true,
  },
  OSA: {
    selectedOption: "ACL_ACID_SORT_OPTION",
    sector: true,
  },
  OSD: {
    selectedOption: "ACL_DESTINATION_SORT_OPTION",
    sector: true,
  },
};
export const ACL_SORT_UU_ARGS = Object.keys(ACL_SORT_MAP);
export function isAclSortKey(str: string): str is AclSortKey {
  return ACL_SORT_UU_ARGS.includes(str);
}
