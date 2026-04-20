import dotenv from "dotenv";
import axios from "axios";
import crypto from "crypto";

// ANSI color codes for red and green text
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const RESET = "\x1b[0m";

const expectedApiKeyHashes = {
  gemini: [
    "dc983ef645cfee944054616fe2198b4c8c1716553043ae4bc57eb34684bb66d5", "710a0f9816fdf82c1f32f2fd9f641c2d21cb74589974df3825070e731deee786"
  ]
};

dotenv.config({ path: ".env.local" });
dotenv.config();

export function validateLLMConfig() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const apiKeyEnvVar = "GOOGLE_GENERATIVE_AI_API_KEY";
  const llmProvider = "gemini";

  if (!apiKey) {
    console.error(`${RED}Missing API key in "${apiKeyEnvVar}" in .env.local file.${RESET}`);
    return;
  } else {
    // Compute the SHA-256 hash of the provided API key
    const hash = crypto.createHash("sha256").update(apiKey).digest("hex");

    // Lookup the list of expected hashes for the provider
    const allowedHashes = expectedApiKeyHashes[llmProvider];

    // Check if the computed hash is in the list of allowed hashes
    if (!allowedHashes.includes(hash)) {
      console.log(`Got API key hash "${hash}", espected one of: ${allowedHashes}`)
      console.error(
        `${RED}Invalid API key in "${apiKeyEnvVar}". Please update your .env.local file with a valid key.${RESET}`
      );
      return;
    }

    console.log(`API key in "${apiKeyEnvVar}" validated ${GREEN}[OK]${RESET}`);

    return { llmProvider, apiKey };
  }
}

export async function testLLMConnection(): Promise<void> {
  const configResult = validateLLMConfig();
  if (!configResult) {
    console.error(`${RED}LLM config validation failed. Exiting LLM test...${RESET}`);
    return;
  }

  const { apiKey } = configResult;
  const endpoint = "https://generativelanguage.googleapis.com/v1beta/models";
  const config = {
    params: { key: apiKey },
  };

  try {
    const response = await axios.get(endpoint, config);
    console.log(`Connection successful for Gemini. Status: ${response.status} ${GREEN}[OK]${RESET}`);
    console.log(`All checks passed ${GREEN}[OK]${RESET}`);
  } catch (error: any) {
    if (error.response) {
      console.error(`Connection failed for Gemini. Status: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(`Connection failed for Gemini. Error: ${error.message}`);
    }
  }
}


(async () => {
  await testLLMConnection();
})();
