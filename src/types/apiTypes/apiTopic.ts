import { ApiTopicCategory } from "./apiTopicCategory";

export class ApiTopic {
  constructor(category: ApiTopicCategory, facilityId: string) {
    this.category = category;
    this.facilityId = facilityId;
  }

  category: ApiTopicCategory;

  facilityId: string;

  sectorId?: string;
}
