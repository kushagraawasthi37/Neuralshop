import express from "express";
import { interpretVoice } from "./voice.controller.js";

const voiceRoutes = express.Router();

voiceRoutes.post("/interpret", interpretVoice);

export default voiceRoutes;
