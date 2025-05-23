export interface EramMessageProcessingResultDto {
  isSuccess: boolean;
  autoRecall: boolean;
  feedback: string[];
  response: string | null;
}