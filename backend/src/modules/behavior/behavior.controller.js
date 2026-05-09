import { asyncHandler } from "../../utils/async-handler.js";
import ApiResponse from "../../utils/api-response.js";
import {
  trackEventService,
  getBehaviorEventsService,
} from "./behavior.service.js";

export const trackEvent = asyncHandler(async (req, res) => {
  const { event, productId, metadata, sessionId } = req.body;

  if (!event || !sessionId) {
    return res.status(400).json({ message: "event and sessionId are required" });
  }

  const userId = req.userId || null;
  await trackEventService({ userId, sessionId, event, productId, metadata });

  res.status(200).json(new ApiResponse(200, null, "ok"));
});

export const getBehaviorSummary = asyncHandler(async (req, res) => {
  const userId = req.userId || null;
  const { sessionId } = req.query;

  if (!userId && !sessionId) {
    return res.status(400).json({ message: "userId or sessionId required" });
  }

  const events = await getBehaviorEventsService(userId, sessionId);
  res.status(200).json(new ApiResponse(200, events, "ok"));
});
