import ArtccSummary from "./ArtccSummary";

export default interface User {
  cid: number;
  firstName: string;
  lastName: string;
  role: string;
  artccs: ArtccSummary[];
}
