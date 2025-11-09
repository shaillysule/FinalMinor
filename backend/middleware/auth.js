// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from multiple sources
  let token = req.header('Authorization');
  
  // Remove 'Bearer ' prefix if present
  if (token && token.startsWith('Bearer ')) {
    token = token.substring(7);
  }
  
  // Also check x-auth-token header (fallback)
  if (!token) {
    token = req.header('x-auth-token');
  }

  console.log("Auth middleware - Token received:", token ? "YES" : "NO");
  
  if (token) {
    console.log("Token preview:", token.substring(0, 20) + "...");
  }

  // Check if no token
  if (!token) {
    console.log("Auth middleware - No token provided");
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    console.log(`Auth middleware: User authenticated - ID: ${decoded.id}, Email: ${decoded.email || 'N/A'}`);
    next();
  } catch (err) {
    console.error("Auth middleware - Token verification failed:", err.message);
    
    // Provide specific error messages
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired. Please login again.' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token. Please login again.' });
    }
    
    res.status(401).json({ error: 'Token verification failed' });
  }
};