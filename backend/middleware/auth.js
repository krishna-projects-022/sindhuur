require('dotenv').config(); // Ensure dotenv is loaded
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Auth middleware - header:', authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Auth middleware - No token provided or invalid format');
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Auth middleware - token:', token);
  
  try {
    if (!SECRET_KEY) {
      console.log('Auth middleware - JWT_SECRET not configured. Ensure JWT_SECRET is set in .env file.');
      console.log('Auth middleware - Environment variables:', process.env.JWT_SECRET);
      return res.status(500).json({ message: 'Server configuration error: JWT_SECRET not set' });
    }
    console.log('Auth middleware - Using JWT_SECRET:', SECRET_KEY);
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log('Auth middleware - decoded:', decoded);
    
    const userId = decoded.userId || decoded.profileId;
    
    if (!userId) {
      console.log('Auth middleware - No user ID found in token');
      return res.status(401).json({ message: 'Invalid token format' });
    }
    
    req.user = {
      id: userId,
      email: decoded.email,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware - token verification error:', error.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};