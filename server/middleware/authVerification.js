import jwt from "jsonwebtoken";

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
    // console.log(req.user);

    next();
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const isAdmin = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.admin = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};

export const authorizeAdmin = (action) => (req, res, next) => {
  const { permissions } = req.admin;

  if (!permissions[action]) {
    return res.status(403).json({ message: "Unauthorized: Permission denied" });
  }

  next();
};
