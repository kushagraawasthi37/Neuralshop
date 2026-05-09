import api from "./axios";

export const behaviorApi = {
  track: (payload) => api.post("/behavior/track", payload),
};
