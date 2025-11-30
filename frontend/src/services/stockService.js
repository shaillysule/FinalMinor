// src/services/stockService.js
import axios from "axios";

const API_BASE ="http://localhost:5000";

/**
 * Fetch trending stocks from backend.
 * Expects backend route: GET /api/stocks/trending/stocks
 * Passes auth token if present in localStorage.
 */
export async function getTrendingStocks() {
  const token = localStorage.getItem("token") || localStorage.getItem("authToken");

  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const url = `${API_BASE}/api/stocks/trending/stocks`;

  const res = await axios.get(url, { headers, timeout: 15000 });
  // normalize response to an array of objects { symbol, change, price }
  // adapt mapping if your backend returns a different shape
  const data = res.data;
  if (Array.isArray(data)) return data;
  if (data.stocks && Array.isArray(data.stocks)) return data.stocks;
  // otherwise return as single-item array
  return [data];
}
