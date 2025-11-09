const axios = require("axios");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log("Testing Gemini API...");
console.log("API Key:", GEMINI_API_KEY ? "Found ✅" : "Missing ❌");

const testAPI = async () => {
  try {
    // Using v1beta with gemini-1.5-flash-latest
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await axios.post(url, {
      contents: [{ 
        parts: [{ text: "Say hello in one sentence" }] 
      }]
    });
    
    console.log("✅ SUCCESS!");
    console.log("Response:", response.data.candidates[0].content.parts[0].text);
  } catch (error) {
    console.log("❌ ERROR!");
    console.log("Status:", error.response?.status);
    console.log("Error:", JSON.stringify(error.response?.data, null, 2));
  }
};

testAPI();