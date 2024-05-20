require("dotenv").config()
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);

async function ai_response(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro"});
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log(text);
}
const question="Write a program that takes 10 input integers from a user and gives sum"
ai_response(`Write a algorithm for this question '${question}'. Give only steps. Each step should be minimal in the sense that it is not lengthy`);
