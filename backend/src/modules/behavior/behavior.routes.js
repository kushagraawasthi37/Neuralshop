import express from "express";
import jwt from "jsonwebtoken";
import config from "../../config/environment.config.js";
import { trackEvent, getBehaviorSummary } from "./behavior.controller.js";

const behaviorRoutes = express.Router();

// Soft auth: attaches req.userId if a valid token is present, never blocks
const softAuth = (req, _res, next) => {
  const authHeader = req.header("Authorization");
  const token =
    req.cookies?.userToken ||
    (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1].trim() : null);
  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.userId = decoded?.userId;
    } catch (_) {}
  }
  next();
};

behaviorRoutes.post("/track", softAuth, trackEvent);
behaviorRoutes.get("/summary", softAuth, getBehaviorSummary);

export default behaviorRoutes;
