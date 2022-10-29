export enum DepSortOption {
  ACID = "DEP_ACID_SORT_OPTION",
  DESTINATION = "DEP_DESTINATION_SORT_OPTION",
  ORIGIN = "DEP_ORIGIN_SORT_OPTION",
  P_TIME = "DEP_P_TIME_SORT_OPTION",
}

export const DepSortOptionValues = {
  [DepSortOption.ACID]: "ACID",
  [DepSortOption.DESTINATION]: "Destination",
  [DepSortOption.ORIGIN]: "Origin",
  [DepSortOption.P_TIME]: "P Time",
};
