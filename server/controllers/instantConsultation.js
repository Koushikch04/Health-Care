import {
  resolveConsultationChatResponse,
  resolveConsultationChatResponseStream,
  resolveSpecializationsFromSymptoms,
} from "../services/instantConsultationService.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import AiRecommendationFeedback from "../models/AiRecommendationFeedback.js";

const writeSseEvent = (res, event, payload) => {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
};

const extractAccountIdFromAuthHeader = (authHeader = "") => {
  if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.accountId || !mongoose.isValidObjectId(decoded.accountId)) {
      return null;
    }
    return decoded.accountId;
  } catch (_error) {
    return null;
  }
};

export const getSpecializations = async (req, res) => {
  const { symptoms, gender, yearOfBirth } = req.query;
  console.log("Received symptoms:", symptoms, gender, yearOfBirth);

  if (!symptoms) {
    return res.status(400).json({ message: "Please describe your symptoms" });
  }

  try {
    const mappedResponse = await resolveSpecializationsFromSymptoms({
      symptoms,
    });
    return res.json(mappedResponse);
  } catch (error) {
    const errorMessage = error.response?.data || error.message;
    console.error("Error fetching specializations:", errorMessage);
    return res.status(500).json({ error: errorMessage });
  }
};

export const chatConsultation = async (req, res) => {
  const { message, history } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: "Message is required" });
  }

  console.log("Received chat message:", message);
  console.log("Chat history:", history);

  try {
    const response = await resolveConsultationChatResponse({
      message: message.trim(),
      history,
    });
    return res.json(response);
  } catch (error) {
    const errorMessage = error.response?.data || error.message;
    console.error("Error generating AI chat response:", errorMessage);
    return res.status(500).json({
      message: "Unable to process consultation right now.",
      error: errorMessage,
    });
  }
};

export const chatConsultationStream = async (req, res) => {
  const { message, history } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: "Message is required" });
  }

  const abortController = new AbortController();
  let isClosed = false;
  let heartbeat = null;

  req.on("close", () => {
    isClosed = true;
    abortController.abort();
    if (heartbeat) {
      clearInterval(heartbeat);
      heartbeat = null;
    }
  });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  heartbeat = setInterval(() => {
    if (!isClosed) {
      res.write(": ping\n\n");
    }
  }, 20000);

  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  try {
    writeSseEvent(res, "start", {
      requestId,
      mode: "external_stream",
    });

    const response = await resolveConsultationChatResponseStream({
      message: message.trim(),
      history,
      onToken: (token) => {
        if (!isClosed) {
          writeSseEvent(res, "token", { token });
        }
      },
      signal: abortController.signal,
    });

    if (isClosed) {
      return;
    }

    writeSseEvent(res, "meta", {
      ai_summary: response.ai_summary || "",
      disclaimer: response.disclaimer || "",
      suggested_followups: Array.isArray(response.suggested_followups)
        ? response.suggested_followups
        : [],
      specializations: Array.isArray(response.specializations)
        ? response.specializations
        : [],
    });

    writeSseEvent(res, "done", {
      ...response,
      requestId,
    });
  } catch (error) {
    if (!isClosed) {
      writeSseEvent(res, "error", {
        message: "Unable to process consultation right now.",
        code: "CONSULTATION_STREAM_FAILED",
      });
    }
  } finally {
    if (heartbeat) {
      clearInterval(heartbeat);
      heartbeat = null;
    }
    if (!isClosed) {
      res.end();
    }
  }
};

export const submitRecommendationFeedback = async (req, res) => {
  const {
    sessionId,
    messageId,
    requestId = "",
    helpful,
    recommendationCount,
    recommendationNames = [],
    source = "instant_consultation_chat",
  } = req.body;

  const accountId = extractAccountIdFromAuthHeader(req.header("Authorization"));

  const normalizedRecommendationNames = Array.isArray(recommendationNames)
    ? recommendationNames
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
        .slice(0, 20)
    : [];

  void (async () => {
    try {
      await AiRecommendationFeedback.create({
        accountId: accountId || undefined,
        sessionId,
        messageId,
        requestId,
        helpful,
        recommendationCount,
        recommendationNames: normalizedRecommendationNames,
        source,
      });
    } catch (error) {
      if (error?.code !== 11000) {
        console.error("Failed to store recommendation feedback:", error);
      }
    }
  })();

  return res.status(202).json({ accepted: true });
};
