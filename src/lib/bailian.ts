import OpenAI from "openai";

export function createBailianClient() {
  return new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY || "",
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  });
}

export const MODELS = {
  predict: "qwen3-max",
  chat: "qwen-plus",
  fallback: "qwen3.5-flash",
} as const;
