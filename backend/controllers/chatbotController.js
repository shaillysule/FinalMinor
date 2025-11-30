
const axios = require("axios");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is missing!");
  throw new Error("GEMINI_API_KEY not configured");
}

console.log("Gemini API Key loaded");

// Helper function to fetch real stock data
const getStockData = async (symbol) => {
  try {
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    return response.data['Global Quote'];
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error.message);
    return null;
  }
};

// Helper function to get market overview
const getMarketOverview = async () => {
  const popularStocks = ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'AMZN', 'META'];
  const stockPromises = popularStocks.map(symbol => getStockData(symbol));
  const results = await Promise.all(stockPromises);
  
  let overview = "Current Market Data:\n\n";
  results.forEach((data, index) => {
    if (data && data['05. price']) {
      const symbol = popularStocks[index];
      const price = parseFloat(data['05. price']).toFixed(2);
      const change = data['10. change percent'];
      overview += `${symbol}: $${price} (${change})\n`;
    }
  });
  
  return overview;
};

// Helper function to analyze user's portfolio
const getUserPortfolio = async (userId) => {
  try {
    // Try to get user's portfolio from database
    const Portfolio = require("../models/Portfolio");
    const portfolio = await Portfolio.findOne({ userId });
    
    if (!portfolio || !portfolio.stocks || portfolio.stocks.length === 0) {
      return "No portfolio found.";
    }
    
    let portfolioSummary = "Your Current Portfolio:\n\n";
    portfolio.stocks.forEach(stock => {
      portfolioSummary += `${stock.symbol}: ${stock.quantity} shares @ $${stock.avgBuyPrice}\n`;
    });
    
    return portfolioSummary;
  } catch (error) {
    console.log("Portfolio model not found or error:", error.message);
    return ""; // Return empty string if portfolio feature not available
  }
};

exports.handleStockQuery = async (req, res) => {
  try {
    console.log("Received query:", req.body.query);

    const { query, conversationHistory = [] } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!query || !query.trim()) {
      console.log("Empty query received");
      return res.status(400).json({ error: "Query cannot be empty" });
    }

    // Check if query is asking for stock recommendations or analysis
    const isStockQuery = /invest|stock|buy|sell|recommend|portfolio|price|market|trading|ticker|symbol|ntpc|aapl|tsla|googl|msft|amzn|meta|nifty|sensex/i.test(query);

    let contextData = "";

    // If it's a stock-related query, fetch real data
    if (isStockQuery) {
      console.log("Stock query detected, fetching market data...");
      
      // Get market overview
      const marketData = await getMarketOverview();
      if (marketData) {
        contextData += marketData + "\n\n";
      }
      
      // Get user's portfolio if asking about their investments
      if (/my portfolio|my stock|my investment/i.test(query) && userId) {
        const portfolioData = await getUserPortfolio(userId);
        if (portfolioData) {
          contextData += portfolioData + "\n\n";
        }
      }
      
      // Extract specific stock symbols from query (e.g., "AAPL", "TSLA", "NTPC")
      const symbolMatches = query.match(/\b[A-Z]{2,5}\b/g);
      if (symbolMatches && symbolMatches.length > 0) {
        console.log("Specific symbols found:", symbolMatches);
        for (const symbol of symbolMatches) {
          const stockData = await getStockData(symbol);
          if (stockData && stockData['05. price']) {
            contextData += `${symbol} Current Data:\n`;
            contextData += `Price: $${stockData['05. price']}\n`;
            contextData += `Change: ${stockData['10. change percent']}\n`;
            contextData += `Volume: ${stockData['06. volume']}\n`;
            contextData += `High: $${stockData['03. high']}\n`;
            contextData += `Low: $${stockData['04. low']}\n\n`;
          }
        }
      }
    }

    // Build enhanced prompt with real data
    let fullPrompt = `You are a professional stock market advisor and financial analyst named "NexgenStocks AI Assistant". 

IMPORTANT INSTRUCTIONS:
- When asked about stock recommendations, ALWAYS provide specific stock symbols (e.g., AAPL, TSLA, MSFT)
- Base your recommendations on the real market data provided below
- Consider risk tolerance and investment goals
- Provide clear reasoning for each recommendation
- Include current prices and price changes when discussing stocks
- For Indian stocks (like NTPC, TCS, Reliance), mention they are NSE/BSE listed
- If asked general non-stock questions, politely redirect to stock/finance topics
- Be concise but informative
- Use bullet points for clarity when listing recommendations

`;

    // Add real market data to context
    if (contextData) {
      fullPrompt += `\nREAL-TIME MARKET DATA:\n${contextData}\n`;
    }

    fullPrompt += `\nCONVERSATION HISTORY:\n`;
    
    if (conversationHistory.length > 0) {
      conversationHistory.slice(-5).forEach((m) => { // Only last 5 messages for context
        fullPrompt += `${m.role === "user" ? "User" : "Assistant"}: ${m.content}\n`;
      });
    }
    
    fullPrompt += `\nUser: ${query}\nAssistant:`;

    console.log("Sending request to Gemini API with market data...");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: fullPrompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    };

    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log("Gemini API responded successfully");

    const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      console.log("No text in response:", JSON.stringify(response.data));
      throw new Error("No response text from Gemini API");
    }

    // const disclaimer = "\n\n⚠️ Disclaimer: This is AI-generated advice for educational purposes only. Always do your own research and consult with a licensed financial advisor before making investment decisions.";

    return res.status(200).json({
      response: aiResponse ,
      hasRealData: contextData.length > 0
    });

  } catch (error) {
    console.error("Gemini API Error:");
    console.error("Error message:", error.message);
    
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Response data:", JSON.stringify(error.response.data, null, 2));
    }

    return res.status(500).json({
      error: "Failed to get AI response. Please try again.",
      details: error.response?.data?.error?.message || error.message
    });
  }
};