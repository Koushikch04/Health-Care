import {
  resolveConsultationChatResponse,
  resolveConsultationChatResponseStream,
  resolveSpecializationsFromSymptoms,
} from "../services/instantConsultationService.js";

const writeSseEvent = (res, event, payload) => {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
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
