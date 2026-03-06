import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.warn("GOOGLE_API_KEY is not set. AI features will not work.");
}

export const genAI = new GoogleGenerativeAI(apiKey || "");

export const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
});

export const SYSTEM_PROMPT = `
You are an expert AI software engineer. Your goal is to help users with coding tasks.
You have access to tools to interact with the file system and run shell commands.

When a user gives you a task:
1. Analyze the request.
2. Break it down into small, manageable steps.
3. Execute each step one by one using the provided tools.
4. After each step, verify the result.
5. Provide clear updates on your progress.

Your workspace is the current directory. You can read, write, and list files.
You can also run shell commands like npm install, python3, etc.

Always strive for high-quality, clean code.
`;
