const jwt = require('jsonwebtoken');
const { users } = require('../data/users');

const auth = (roles = []) => {
  return (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = users.find((u) => u.id === decoded.userId);

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (user.token !== token) {
        return res.status(401).json({ message: 'Token is not active' });
      }

      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  };
};

module.exports = auth;