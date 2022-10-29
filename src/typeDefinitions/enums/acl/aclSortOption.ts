export enum AclSortOption {
  ACID = "ACL_ACID_SORT_OPTION",
  BOUNDARY_TIME = "ACL_BOUNDARY_TIME_SORT_OPTION",
  CONFLICT_STATUS = "ACL_CONFLICT_STATUS_SORT_OPTION",
  CONFLICT_TIME = "ACL_CONFLICT_TIME_SORT_OPTION",
  DESTINATION = "ACL_DESTINATION_SORT_OPTION",
  SECTOR_BY_SECTOR = "ACL_SECTOR_BY_SECTOR_SORT_OPTION",
}

export const AclSortOptionValues = {
  [AclSortOption.ACID]: "ACID",
  [AclSortOption.BOUNDARY_TIME]: "Boundary Time",
  [AclSortOption.CONFLICT_STATUS]: "Conflict Status",
  [AclSortOption.CONFLICT_TIME]: "Conflict Time",
  [AclSortOption.DESTINATION]: "Destination",
  [AclSortOption.SECTOR_BY_SECTOR]: "Sector-by-Sector",
};
