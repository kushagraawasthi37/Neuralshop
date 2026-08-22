import express from "express";
import { chatWithAgent } from "./agent.controller.js";
import { confirmAgentPayment } from "./agent.controller.js";
import isAuth from "../../middlewares/auth.middleware.js";
import checkIdempotency from "../../utils/idempotency-util.js";

const agentRoutes = express.Router();
// Discovery is available to guests; every mutating tool enforces user ownership.
agentRoutes.post("/chat", chatWithAgent);
agentRoutes.post("/confirm-payment", isAuth, checkIdempotency, confirmAgentPayment);
export default agentRoutes;
