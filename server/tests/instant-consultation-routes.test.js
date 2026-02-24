import request from "supertest";
import { jest } from "@jest/globals";

const mockResolveSpecializationsFromSymptoms = jest.fn();
const mockResolveConsultationChatResponse = jest.fn();

jest.unstable_mockModule("../services/instantConsultationService.js", () => ({
  resolveSpecializationsFromSymptoms: mockResolveSpecializationsFromSymptoms,
  resolveConsultationChatResponse: mockResolveConsultationChatResponse,
}));

const { createApp } = await import("../app.js");
const app = createApp();

describe("Instant consultation routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /health/specialty/chat", () => {
    test("returns AI consultation payload on success", async () => {
      mockResolveConsultationChatResponse.mockResolvedValue({
        reply: "Please monitor symptoms and stay hydrated.",
        disclaimer: "Not a diagnosis.",
        suggested_followups: [
          "How long have you had these symptoms?",
          "Have they been getting worse?",
        ],
        specializations: [
          { Name: "General Physician", Accuracy: 75, Reason: "Initial triage" },
        ],
      });

      const res = await request(app)
        .post("/health/specialty/chat")
        .send({
          message: "  Headache and mild fever  ",
          history: [{ role: "user", text: "Since yesterday" }],
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        reply: "Please monitor symptoms and stay hydrated.",
        disclaimer: "Not a diagnosis.",
        suggested_followups: [
          "How long have you had these symptoms?",
          "Have they been getting worse?",
        ],
        specializations: [
          { Name: "General Physician", Accuracy: 75, Reason: "Initial triage" },
        ],
      });
      expect(mockResolveConsultationChatResponse).toHaveBeenCalledWith({
        message: "Headache and mild fever",
        history: [{ role: "user", text: "Since yesterday" }],
      });
    });

    test("rejects invalid request body via validation middleware", async () => {
      const res = await request(app)
        .post("/health/specialty/chat")
        .send({
          history: [{ role: "user", text: "Missing latest message" }],
        });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
        },
      });
      expect(mockResolveConsultationChatResponse).not.toHaveBeenCalled();
    });

    test("returns 500 when consultation service throws", async () => {
      mockResolveConsultationChatResponse.mockRejectedValue(
        new Error("Service unavailable"),
      );

      const res = await request(app)
        .post("/health/specialty/chat")
        .send({
          message: "Cough and sore throat",
          history: [],
        });

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        message: "Unable to process consultation right now.",
        error: "Service unavailable",
      });
    });
  });

  describe("GET /health/specialty/specializations", () => {
    test("returns mapped specialization suggestions on success", async () => {
      mockResolveSpecializationsFromSymptoms.mockResolvedValue([
        { Name: "Dermatology", Accuracy: 90, Reason: "Skin symptoms" },
      ]);

      const res = await request(app)
        .get("/health/specialty/specializations")
        .query({ symptoms: "itchy rash on arm" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual([
        { Name: "Dermatology", Accuracy: 90, Reason: "Skin symptoms" },
      ]);
      expect(mockResolveSpecializationsFromSymptoms).toHaveBeenCalledWith({
        symptoms: "itchy rash on arm",
      });
    });

    test("rejects missing symptoms query via validation middleware", async () => {
      const res = await request(app).get("/health/specialty/specializations");

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
        },
      });
      expect(mockResolveSpecializationsFromSymptoms).not.toHaveBeenCalled();
    });

    test("returns 500 when specialization service throws", async () => {
      mockResolveSpecializationsFromSymptoms.mockRejectedValue(
        new Error("AI backend failed"),
      );

      const res = await request(app)
        .get("/health/specialty/specializations")
        .query({ symptoms: "persistent cough" });

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        error: "AI backend failed",
      });
    });
  });
});
