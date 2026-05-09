import api from "./axios";

export const voiceApi = {
  interpret: (transcript, context) =>
    api.post("/voice/interpret", { transcript, context }),
};
