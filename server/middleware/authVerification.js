import jwt from "jsonwebtoken";
import AdminProfile from "../models/AdminProfile.js";

export const verifyToken = async (req, res, next) => {
  try {
    let token = req.header("Authorization");

    if (!token) {
      return res.status(403).json({ msg: "Access Denied" });
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    } else {
      return res
        .status(403)
        .json({ msg: "Access Denied: Invalid token format" });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    req.account = verified;
    // console.log(req.user);

    next();
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const isAdmin = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const roles = decoded?.roles || [];
    const isAdminRole = roles.includes("admin") || roles.includes("superadmin");

    if (!isAdminRole) {
      return res.status(403).json({ message: "Access denied. Admin only." });
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
    res.status(400).json({ message: "Invalid token" });
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
    return res.status(403).json({ message: "Unauthorized: Permission denied" });
  }

  next();
};

export const verifySuperAdmin = (req, res, next) => {
  if (req.admin && req.admin.roles?.includes("superadmin")) {
    next();
  } else {
    return res.status(403).json({ message: "Access denied. Superadmin only." });
  }
};
