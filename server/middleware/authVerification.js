import jwt from "jsonwebtoken";
import AdminProfile from "../models/AdminProfile.js";
import { createAppError } from "../utils/appError.js";

export const verifyToken = async (req, res, next) => {
  try {
    let token = req.header("Authorization");

    if (!token) {
      return next(
        createAppError(403, "Access denied", { code: "AUTH_MISSING_TOKEN" }),
      );
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    } else {
      return next(
        createAppError(403, "Access denied: invalid token format", {
          code: "AUTH_INVALID_TOKEN_FORMAT",
        }),
      );
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    req.account = verified;
    // console.log(req.user);

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(
        createAppError(401, "Access denied: token expired", {
          code: "AUTH_TOKEN_EXPIRED",
        }),
      );
    }

    if (err.name === "JsonWebTokenError") {
      return next(
        createAppError(401, "Access denied: invalid token", {
          code: "AUTH_INVALID_TOKEN",
        }),
      );
    }

    return next(err);
  }
};

export const isAdmin = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return next(
      createAppError(401, "Access denied. No token provided.", {
        code: "AUTH_MISSING_TOKEN",
      }),
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const roles = decoded?.roles || [];
    const isAdminRole = roles.includes("admin") || roles.includes("superadmin");

    if (!isAdminRole) {
      return next(
        createAppError(403, "Access denied. Admin only.", {
          code: "AUTH_ADMIN_REQUIRED",
        }),
      );
    }

    const adminProfile = await AdminProfile.findOne({
      accountId: decoded.accountId,
    });

    req.admin = {
      accountId: decoded.accountId,
      role: decoded.role,
      roles,
      permissions: adminProfile?.permissions || new Map(),
    };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(
        createAppError(401, "Access denied: token expired", {
          code: "AUTH_TOKEN_EXPIRED",
        }),
      );
    }

    if (err.name === "JsonWebTokenError") {
      return next(
        createAppError(401, "Access denied: invalid token", {
          code: "AUTH_INVALID_TOKEN",
        }),
      );
    }

    return next(err);
  }
};

export const authorizeAdmin = (action) => (req, res, next) => {
  const { permissions } = req.admin;
  console.log("Admin permissions:", permissions);
  console.log("Required action:", action);
  console.log(
    "Permission for action:",
    permissions.get(action),
    permissions[action],
  );

  if (!permissions.get(action)) {
    return next(
      createAppError(403, "Unauthorized: Permission denied", {
        code: "AUTH_PERMISSION_DENIED",
      }),
    );
  }

  next();
};

export const verifySuperAdmin = (req, res, next) => {
  if (req.admin && req.admin.roles?.includes("superadmin")) {
    next();
  } else {
    return next(
      createAppError(403, "Access denied. Superadmin only.", {
        code: "AUTH_SUPERADMIN_REQUIRED",
      }),
    );
  }
};
