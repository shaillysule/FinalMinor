const mongoose = require('mongoose');
const LearningModule = require('../models/LearningModule');

mongoose.connect('mongodb://localhost/stock_platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const modules = [
  {
    title: 'Introduction to Stock Markets',
    description: 'Learn the basics of how stock markets operate.',
    difficulty: 'Beginner',
    estimatedTime: 15,
    lessons: [
      {
        step: 1,
        title: 'What is a Stock Market?',
        content: 'A stock market is a place where buyers and sellers trade shares of publicly listed companies. It acts as a platform for companies to raise capital and for investors to buy ownership in businesses.'
      },
      {
        step: 2,
        title: 'Key Players in the Stock Market',
        content: 'The main participants include investors (individuals or institutions), stockbrokers (who facilitate trades), and regulatory bodies (like the SEC in the U.S.). Companies list their shares to raise funds.'
      },
      {
        step: 3,
        title: 'How Stock Prices are Determined',
        content: 'Stock prices are determined by supply and demand. If more people want to buy a stock (demand) than sell it (supply), the price goes up, and vice versa. Factors like company performance, market conditions, and news impact prices.'
      }
    ]
  },
  {
    title: 'Understanding Stock Market Trends',
    description: 'Learn how to identify and analyze stock market trends.',
    difficulty: 'Intermediate',
    estimatedTime: 25,
    lessons: [
      {
        step: 1,
        title: 'What are Market Trends?',
        content: 'Market trends refer to the general direction of stock prices over time. There are three types: uptrend (rising prices), downtrend (falling prices), and sideways trend (stable prices).'
      },
      {
        step: 2,
        title: 'Using Charts to Identify Trends',
        content: 'Charts plot stock prices over time. A line chart shows the closing price each day, while a candlestick chart shows the open, high, low, and close prices. Look for patterns like higher highs and higher lows to identify an uptrend.'
      },
      {
        step: 3,
        title: 'Moving Averages',
        content: 'A moving average smooths out price data to identify trends. A 50-day moving average calculates the average closing price over the last 50 days. If the stock price is above the moving average, it’s a bullish signal.'
      }
    ]
  },
  {
    title: 'Portfolio Diversification Strategies',
    description: 'Learn strategies to diversify your investment portfolio.',
    difficulty: 'Advanced',
    estimatedTime: 40,
    lessons: [
      {
        step: 1,
        title: 'What is Portfolio Diversification?',
        content: 'Diversification means spreading your investments across different assets to reduce risk. If one stock performs poorly, others may perform well, balancing your overall returns.'
      },
      {
        step: 2,
        title: 'Diversifying Across Sectors',
        content: 'Invest in different sectors like technology, healthcare, and energy. For example, if tech stocks drop due to a market correction, healthcare stocks might remain stable.'
      },
      {
        step: 3,
        title: 'Balancing Risk and Return',
        content: 'Mix high-risk stocks (e.g., small-cap growth stocks) with low-risk assets (e.g., bonds or blue-chip stocks). Use a 60/40 portfolio (60% stocks, 40% bonds) for a balanced approach.'
      }
    ]
  }
];

const seedModules = async () => {
  try {
    await LearningModule.deleteMany();
    await LearningModule.insertMany(modules);
    console.log('Modules seeded successfully');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding modules:', err);
    mongoose.connection.close();
  }
};

seedModules();