import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  try {
    let token = req.header("Authorization");

    if (!token) {
      return res.status(403).send("Access Denied");
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    } else {
      return res
        .status(403)
        .json({ message: "Access Denied: Invalid token format" });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;

    // console.log(req.user);

    next();
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
