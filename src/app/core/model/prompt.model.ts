export interface PromptDto {
  promptId: number;
  tag: string;
  description: string;
}

export interface PromptTagSelection {
  value: string;
  promptId: number;
}

export interface UpdatePromptRequest {
  promptId: number;
  tag: string;
  description: string;
}
