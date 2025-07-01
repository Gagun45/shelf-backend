import type { NextFunction, Request, Response } from "express";
import { auth } from "express-oauth2-jwt-bearer";
import User from "../models/User";

declare global {
  namespace Express {
    interface Request {
      userPid: string;
      role: string;
    }
  }
}

export const jwtCheck = auth({
  audience: "shelf-api",
  issuerBaseURL: "https://dev-e1itesexox2swlri.eu.auth0.com/",
  tokenSigningAlg: "RS256",
});

export const isLoggedIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const auth0Id = req.auth?.payload.sub;
    const user = await User.findOne({ auth0Id });
    if (!user) {
      res.status(403).json({ message: "Access denied" });
      return;
    }
    req.userPid = user.userPid;
    req.role = user.role;
    next();
  } catch (error) {
    console.log("Error parsing jwt ", error);
    res.status(500).json({ message: "Something went wrong" });
    return;
  }
};

export const isAdminAtLeast = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const allowedRoles = ["admin", "superadmin"];
  if (!allowedRoles.includes(req.role)) {
    res.status(403).json({ message: "Access denied" });
    return;
  }
  next();
};

export const isSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const allowedRoles = ["superadmin"];
  if (!allowedRoles.includes(req.role)) {
    res.status(403).json({ message: "Access denied" });
    return;
  }
  next();
};
