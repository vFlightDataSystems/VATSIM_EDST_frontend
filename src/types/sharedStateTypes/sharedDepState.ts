import { DepSortOption } from "../../enums/dep/depSortOption";

export class SharedDepState {
  open = false;

  sortOption = DepSortOption.ACID;

  manualPosting = true;
}
