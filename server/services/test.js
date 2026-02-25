import dotenv from "dotenv";
import { HfInference } from "@huggingface/inference";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const hf = new HfInference(process.env.HF_API_KEY);

async function test() {
  const model = process.env.HF_TRIAGE_MODEL || "mistralai/Mistral-7B-Instruct-v0.2";

  const response = await hf.chatCompletion({
    model,
    messages: [{ role: "user", content: "Hello doctor, I have a headache." }],
  });

  console.log(response.choices[0].message.content);
}

test();
