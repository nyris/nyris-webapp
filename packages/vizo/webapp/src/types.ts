export enum MessageType {
  AI = "AI",
  USER = "USER",
}

export type Chat = {
  message: string;
  type: MessageType.AI | MessageType.USER;
  responseType?: "OCR" | "filter" | "upload_new_image" | "LLM_response";
};
