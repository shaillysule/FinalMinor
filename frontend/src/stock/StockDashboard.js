import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StockDashboard.css';
import StockCard from './StockCard';

const StockDashboard = () => {
  const [stockData, setStockData] = useState([]);
  const [indices, setIndices] = useState([]);
  const [trendingStocks, setTrendingStocks] = useState([]);
  const [activeTab, setActiveTab] = useState('explore');
  const [activeSection, setActiveSection] = useState('gainers');
  const [marketCap, setMarketCap] = useState('large');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view stock data.');
          setLoading(false);
          return;
        }

        const headers = { 'x-auth-token': token };

        const [stocksResponse, indicesResponse, trendingResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/stocks', { headers }),
          axios.get('http://localhost:5000/api/stocks/indices/market', { headers }),
          axios.get('http://localhost:5000/api/stocks/trending/stocks', { headers })
        ]);

        setStockData(stocksResponse.data);
        setIndices(indicesResponse.data);
        setTrendingStocks(trendingResponse.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.response?.data?.error || 'Failed to load data');
        if (error.response?.status === 401) {
          setError('Please log in to view stock data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const renderStockCard = (stock) => (
    <StockCard
      key={stock.symbol}
      stock={stock}
      onClick={() => {
        console.log('Navigating to stock:', stock.symbol);
        window.location.href = `/stock/${stock.symbol.toUpperCase()}`; // Normalize to uppercase
      }}
    />
  );

  if (loading) {
    return <div className="stock-dashboard">Loading...</div>;
  }

  if (error) {
    return <div className="stock-dashboard text-red-500">{error}</div>;
  }

  return (
    <div className="stock-dashboard">
      <div className="dashboard-header">
        <div className="app-title">
          <div className="app-logo"></div>
          <h1>Stocks</h1>
        </div>
        
      </div>

      <div className="market-indices">
        {indices.map((index) => (
          <div className="index-card" key={index.symbol}>
            <div className="index-name">{index.symbol}</div>
            <div className="index-price">₹{index.price} {index.changePercent}</div>
          </div>
        ))}
      </div>

      <div className="navigation-tabs">
        <button 
          className={`tab ${activeTab === 'explore' ? 'active' : ''}`}
          onClick={() => setActiveTab('explore')}
        >
          Explore
        </button>
        <button 
          className={`tab ${activeTab === 'holdings' ? 'active' : ''}`}
          onClick={() => setActiveTab('holdings')}
        >
          Holdings
        </button>
        <button 
          className={`tab ${activeTab === 'watchlist' ? 'active' : ''}`}
          onClick={() => setActiveTab('watchlist')}
        >
          My Watchlist
        </button>
        <button className="add-watchlist">+ Watch</button>
      </div>

      {activeTab === 'explore' && (
        <>
          <div className="section-header">
            <h2>Stocks in news</h2>
          </div>

          <div className="stocks-grid">
            {trendingStocks.map(renderStockCard)}
          </div>

          <div className="section-header">
            <div className="tab-buttons">
              <button 
                className={`section-tab ${activeSection === 'gainers' ? 'active' : ''}`}
                onClick={() => setActiveSection('gainers')}
              >
                Gainers
              </button>
              <button 
                className={`section-tab ${activeSection === 'losers' ? 'active' : ''}`}
                onClick={() => setActiveSection('losers')}
              >
                Losers
              </button>
            </div>
          </div>

          <div className="market-cap-filter">
            <button 
              className={`cap-button ${marketCap === 'large' ? 'active' : ''}`}
              onClick={() => setMarketCap('large')}
            >
              Large
            </button>
            <button 
              className={`cap-button ${marketCap === 'mid' ? 'active' : ''}`}
              onClick={() => setMarketCap('mid')}
            >
              Mid
            </button>
            <button 
              className={`cap-button ${marketCap === 'small' ? 'active' : ''}`}
              onClick={() => setMarketCap('small')}
            >
              Small
            </button>
          </div>

          <div className="stocks-grid">
            {stockData
              .filter(stock => activeSection === 'gainers' ? parseFloat(stock.changePercent) > 0 : parseFloat(stock.changePercent) < 0)
              .map(renderStockCard)}
            <div className="stock-card see-more-card">
              <div className="see-more-content">
                <div className="see-more-label">{activeSection === 'gainers' ? 'Gainers' : 'Losers'}</div>
              </div>
            </div>
          </div>

          <div className="section-header">
            <h2>Most traded</h2>
          </div>

          <div className="stocks-grid">
            {trendingStocks.slice(0, 2).map(renderStockCard)}
          </div>

          <div className="section-header">
            <h2>Popular stocks</h2>
          </div>

          <div className="stocks-grid">
            {stockData.slice(0, 4).map(renderStockCard)}
          </div>

          <div className="product-tools"></div>
        </>
      )}
    </div>
  );
};

export default StockDashboard;