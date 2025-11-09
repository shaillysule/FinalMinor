const axios = require("axios");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log("Checking API Key validity...");
console.log("Key:", GEMINI_API_KEY ? `${GEMINI_API_KEY.substring(0, 15)}...` : "MISSING!");
console.log("");

// Test 1: Check if API key format is valid
if (!GEMINI_API_KEY || !GEMINI_API_KEY.startsWith("AIza")) {
  console.log("❌ API Key format looks wrong!");
  console.log("   Should start with 'AIza'");
  process.exit(1);
}

// Test 2: Try to list available models
const listModels = async () => {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
    
    console.log("📋 Fetching list of available models...");
    const response = await axios.get(url);
    
    console.log("✅ API Key is VALID!");
    console.log("\n📦 Available models for your API key:");
    console.log("=".repeat(60));
    
    response.data.models.forEach(model => {
      const supportsGenerate = model.supportedGenerationMethods?.includes("generateContent");
      console.log(`${supportsGenerate ? "✅" : "❌"} ${model.name}`);
    });
    
    console.log("=".repeat(60));
    
    // Find first working model
    const workingModel = response.data.models.find(m => 
      m.supportedGenerationMethods?.includes("generateContent")
    );
    
    if (workingModel) {
      console.log(`\n🎯 RECOMMENDED MODEL: ${workingModel.name.replace("models/", "")}`);
    }
    
  } catch (error) {
    console.log("❌ API Key validation FAILED!");
    console.log("Status:", error.response?.status);
    console.log("Error:", error.response?.data?.error?.message || error.message);
    console.log("\n🔧 Solutions:");
    console.log("   1. Create a NEW API key at: https://aistudio.google.com/app/apikey");
    console.log("   2. Wait 5-10 minutes for the key to activate");
    console.log("   3. Make sure you copied the ENTIRE key");
  }
};

listModels();