export enum SortOptions {
  ACID = "ACID_SORT_OPTION",
  BOUNDARY_TIME = "BOUNDARY_TIME_SORT_OPTION",
  CONFLICT_STATUS = "CONFLICT_STATUS_SORT_OPTION",
  CONFLICT_TIME = "CONFLICT_TIME_SORT_OPTION",
  DESTINATION = "DESTINATION_SORT_OPTION",
  SECTOR_BY_SECTOR = "SECTOR_BY_SECTOR_SORT_OPTION",
  ORIGIN = "ORIGIN_SORT_OPTION",
  P_TIME = "P_TIME_SORT_OPTION"
}

export const SortOptionValues = {
  [SortOptions.ACID]: "ACID",
  [SortOptions.BOUNDARY_TIME]: "Boundary Time",
  [SortOptions.CONFLICT_STATUS]: "Conflict Status",
  [SortOptions.CONFLICT_TIME]: "Conflict Time",
  [SortOptions.DESTINATION]: "Destination",
  [SortOptions.SECTOR_BY_SECTOR]: "Sector-by-Sector",
  [SortOptions.ORIGIN]: "Origin",
  [SortOptions.P_TIME]: "P Time"
};
