import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  try {
    let token = req.header("Authorization");
    // console.log(token);

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

    next();
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
