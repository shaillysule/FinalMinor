const axios = require('axios');

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const DEFAULT_SYMBOLS = ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'AMZN', 'META'];

// Get list of stocks
exports.getStocks = async (req, res) => {
  try {
    console.log("Getting stock data with API key:", API_KEY ? "API key found" : "API key missing");
    
    if (!API_KEY) {
      return res.status(500).json({ error: 'API key is missing' });
    }

    const stockData = await Promise.all(
      DEFAULT_SYMBOLS.map(async (symbol) => {
        try {
          const response = await axios.get(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
          );
          console.log(`Quote response for ${symbol}:`, response.data);
          
          const quote = response.data['Global Quote'];
          
          if (!quote || Object.keys(quote).length === 0) {
            return {
              symbol,
              companyName: symbol,
              latestPrice: '0.00',
              changePercent: '0.00%',
              error: 'No data available'
            };
          }
          
          return {
            symbol,
            companyName: symbol,
            latestPrice: quote['05. price'],
            changePercent: quote['10. change percent'],
          };
        } catch (err) {
          console.error(`Error fetching data for ${symbol}:`, err.message);
          return {
            symbol,
            companyName: symbol,
            latestPrice: '0.00',
            changePercent: '0.00%',
            error: err.message
          };
        }
      })
    );
    
    res.json(stockData);
  } catch (error) {
    console.error('Error fetching stock data:', error.message);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
};

// Get details for a specific stock
exports.getStockBySymbol = async (req, res) => {
  const { symbol } = req.params;
  const normalizedSymbol = symbol.toUpperCase(); // Normalize to uppercase
  
  if (!normalizedSymbol) {
    return res.status(400).json({ error: 'Stock symbol is required' });
  }
  
  try {
    console.log("Getting stock detail for:", normalizedSymbol);
    
    if (!API_KEY) {
      return res.status(500).json({ error: 'API key is missing' });
    }

    // Get company overview
    const overviewResponse = await axios.get(
      `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${normalizedSymbol}&apikey=${API_KEY}`
    );
    console.log(`Overview response for ${normalizedSymbol}:`, overviewResponse.data);
    const overview = overviewResponse.data;

    // Get current quote
    const quoteResponse = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${normalizedSymbol}&apikey=${API_KEY}`
    );
    console.log(`Quote response for ${normalizedSymbol}:`, quoteResponse.data);
    const quote = quoteResponse.data['Global Quote'];

    // If no data was returned
    if (!quote || Object.keys(quote).length === 0 || !overview || Object.keys(overview).length === 0) {
      return res.status(200).json({
        symbol: normalizedSymbol,
        name: normalizedSymbol,
        description: `No data available for ${normalizedSymbol}`,
        latestPrice: '0.00',
        changePercent: '0.00%',
        dayHigh: 'N/A',
        dayLow: 'N/A',
        yearHigh: 'N/A',
        yearLow: 'N/A',
        sector: 'N/A',
        industry: 'N/A',
        marketCap: 'N/A',
        peRatio: 'N/A',
        dividendYield: 'N/A',
        eps: 'N/A',
        error: 'Stock data not found'
      });
    }

    res.json({
      symbol: normalizedSymbol,
      name: overview.Name || normalizedSymbol,
      description: overview.Description || `No description available for ${normalizedSymbol}`,
      latestPrice: quote['05. price'] || '0.00',
      changePercent: quote['10. change percent'] || '0.00%',
      dayHigh: overview['52WeekHigh'] || 'N/A',
      dayLow: overview['52WeekLow'] || 'N/A',
      yearHigh: overview['52WeekHigh'] || 'N/A',
      yearLow: overview['52WeekLow'] || 'N/A',
      sector: overview.Sector || 'N/A',
      industry: overview.Industry || 'N/A',
      marketCap: overview.MarketCapitalization || 'N/A',
      peRatio: overview.PERatio || 'N/A',
      dividendYield: overview.DividendYield || 'N/A',
      eps: overview.EPS || 'N/A',
    });
  } catch (err) {
    console.error('Stock detail fetch failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch stock detail' });
  }
};

exports.getStockHistory = async (req, res) => {
  const { symbol } = req.params;
  const normalizedSymbol = symbol.toUpperCase(); // Normalize to uppercase
  const { interval = 'daily' } = req.query;
  
  if (!normalizedSymbol) {
    return res.status(400).json({ error: 'Stock symbol is required' });
  }
  
  try {
    console.log(`Getting ${interval} history for:`, normalizedSymbol);
    
    if (!API_KEY) {
      return res.status(500).json({ error: 'API key is missing' });
    }
    
    let timeSeriesFunction;
    switch (interval) {
      case 'daily':
        timeSeriesFunction = 'TIME_SERIES_DAILY';
        break;
      case 'weekly':
        timeSeriesFunction = 'TIME_SERIES_WEEKLY';
        break;
      case 'monthly':
        timeSeriesFunction = 'TIME_SERIES_MONTHLY';
        break;
      default:
        timeSeriesFunction = 'TIME_SERIES_DAILY';
    }
    
    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=${timeSeriesFunction}&symbol=${normalizedSymbol}&apikey=${API_KEY}`
      );
      console.log(`Historical data response for ${normalizedSymbol}:`, 
                  response.data ? 'Data received' : 'No data');
      
      // Check for API limit message
      if (response.data && response.data.Note && response.data.Note.includes('API call frequency')) {
        console.warn('API call frequency exceeded:', response.data.Note);
        return res.status(429).json({ 
          error: 'API rate limit reached. Please try again in a minute.',
          symbol: normalizedSymbol,
          interval,
          dates: [],
          prices: []
        });
      }
      
      let timeSeriesKey;
      switch (interval) {
        case 'daily':
          timeSeriesKey = 'Time Series (Daily)';
          break;
        case 'weekly':
          timeSeriesKey = 'Weekly Time Series';
          break;
        case 'monthly':
          timeSeriesKey = 'Monthly Time Series';
          break;
        default:
          timeSeriesKey = 'Time Series (Daily)';
      }
      
      const timeSeries = response.data[timeSeriesKey];
      
      if (!timeSeries || Object.keys(timeSeries).length === 0) {
        console.warn(`No time series data found for ${normalizedSymbol}`);
        // Return empty data instead of error for better UI handling
        return res.status(200).json({
          symbol: normalizedSymbol,
          interval,
          dates: [],
          prices: [],
          message: 'No historical data found' // Added message for debugging
        });
      }
      
      const dates = [];
      const prices = [];
      
      // Sort dates in ascending order for proper display
      const sortedDates = Object.keys(timeSeries).sort((a, b) => new Date(a) - new Date(b));
      // Get most recent 30 days (or all days if less than 30)
      const recentDates = sortedDates.slice(-30);
      
      recentDates.forEach(date => {
        dates.push(date);
        prices.push(parseFloat(timeSeries[date]['4. close']));
      });
      
      console.log(`Successfully processed ${dates.length} data points for ${normalizedSymbol}`);
      
      res.json({
        symbol: normalizedSymbol,
        interval,
        dates,
        prices,
      });
    } catch (axiosError) {
      console.error(`Axios error for ${normalizedSymbol}:`, axiosError.message);
      
      // Provide fallback data with error message for better UI handling
      res.status(200).json({
        symbol: normalizedSymbol,
        interval,
        dates: [],
        prices: [],
        error: `API request failed: ${axiosError.message}`
      });
    }
  } catch (err) {
    console.error('Historical data fetch failed:', err.message);
    res.status(500).json({ 
      error: 'Failed to fetch historical data',
      details: err.message
    });
  }
};

// Get market indices
exports.getMarketIndices = async (req, res) => {
  try {
    const indices = [
      { symbol: 'NIFTY 50', price: '22,055.18', changePercent: '+0.53%' },
      { symbol: 'SENSEX', price: '72,643.21', changePercent: '+0.42%' },
      { symbol: 'BANKNIFTY', price: '47,250.35', changePercent: '+0.76%' },
      { symbol: 'NASDAQ', price: '16,432.86', changePercent: '-0.31%' }
    ];
    
    res.json(indices);
  } catch (err) {
    console.error('Market indices fetch failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch market indices' });
  }
};

// Get trending stocks
exports.getTrendingStocks = async (req, res) => {
  try {
    const trendingStocks = [
      { symbol: 'AAPL', companyName: 'Apple Inc.', latestPrice: '189.34', changePercent: '1.5%' },
      { symbol: 'TSLA', companyName: 'Tesla Inc.', latestPrice: '765.23', changePercent: '2.3%' },
      { symbol: 'AMZN', companyName: 'Amazon.com Inc.', latestPrice: '3150.00', changePercent: '1.2%' },
      { symbol: 'MSFT', companyName: 'Microsoft Corp.', latestPrice: '234.12', changePercent: '0.7%' }
    ];
    
    res.json(trendingStocks);
  } catch (err) {
    console.error('Trending stocks fetch failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch trending stocks' });
  }
};

// Get market data
exports.getMarketData = async (req, res) => {
  try {
    const topPerformers = [
      { symbol: 'AAPL', price: '189.34', change: '1.5%' },
      { symbol: 'TSLA', price: '765.23', change: '2.3%' },
      { symbol: 'AMZN', price: '3150.00', change: '1.2%' },
      { symbol: 'MSFT', price: '234.12', change: '0.7%' },
      { symbol: 'META', price: '465.78', change: '3.1%' }
    ];
    
    const currentSentiment = 'bullish';
    
    const trends = [
      { name: 'Tech Sector', description: 'Growing after strong earnings' },
      { name: 'Energy Stocks', description: 'Declining due to oversupply concerns' },
      { name: 'Healthcare', description: 'Stable with slight upward movement' }
    ];
    
    res.json({
      topPerformers,
      marketSentiment: currentSentiment,
      recentTrends: trends
    });
  } catch (error) {
    console.error('Error fetching market data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching market data',
      error: error.message 
    });
  }
};