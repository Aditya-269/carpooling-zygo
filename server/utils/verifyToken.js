import jwt from "jsonwebtoken"
import { createError } from "./error.js";

export const verifyToken = (req, res, next) => {
  try {
    // Try to get token from cookie first
    const token = req.cookies.accessToken;
    
    // If no token in cookie, try Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
          if (err) {
            console.error('Token verification error:', err);
            return next(createError(403, "Token is not valid!"));
          }
          req.user = user;
          next();
        });
      } else {
        console.log('No token found in cookie or Authorization header');
        return next(createError(401, "You are not authenticated!"));
      }
    } else {
      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
          console.error('Token verification error:', err);
          return next(createError(403, "Token is not valid!"));
        }
        req.user = user;
        next();
      });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return next(createError(403, "Token is not valid!"));
  }
}

export const verifyUser = (req, res, next) => {
  verifyToken(req, res, (err) => {
    if (err) return next(err);
    if (req.user && (req.user.id === req.params.id || req.user.isAdmin)) {
      next();
    } else {
      return next(createError(403, "You are not authorized!"));
    }
  });
};

export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, (err) => {
    if (err) return next(err);
    if (req.user && req.user.isAdmin) {
      next();
    } else {
      return next(createError(403, "You are not authorized!"));
    }
  });
};
