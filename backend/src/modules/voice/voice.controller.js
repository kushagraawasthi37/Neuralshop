import { asyncHandler } from "../../utils/async-handler.js";
import ApiResponse from "../../utils/api-response.js";
import { runAgent } from "../agent/agent.service.js";

export const interpretVoice = asyncHandler(async (req, res) => {
  const { transcript, context = {} } = req.body;

  if (!transcript?.trim()) {
    return res.status(400).json({ message: "transcript is required" });
  }

  const result = await runAgent({
    text: transcript.trim(),
    userId: req.userId || null,
    sessionId: context.sessionId || `voice-${req.ip}`,
  });

  const compatibilityAction = result.action || (
    result.tool === "search_products" ? "search" :
      result.tool === "add_to_cart" ? "add_to_cart" :
        result.tool === "prepare_order" ? "checkout" : "speak_info"
  );
  const compatibilityParams = result.toolArguments || {};
  res.status(200).json(new ApiResponse(200, {
    ...result,
    action: compatibilityAction,
    params: compatibilityParams,
    speak: result.message,
    requiresAction: Boolean(result.tool),
  }, "ok"));
});
