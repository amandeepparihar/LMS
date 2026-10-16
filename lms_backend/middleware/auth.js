var jwt = require("jsonwebtoken")
exports.requireLogin = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect("/login.html");
  }

  res.set("Cache-Control", "no-store");
  next();
};

exports.auth = async (req, res, next) => {
  try {
    const token = req.get("Authorization")?.replace("Bearer ", "").trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied, No TOKEN found!!!",
      });
    }
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded Token: ", decode);
      req.user = decode;
    } catch (error) {
      console.error("JWT verification Error: ", error.message);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
        error: error.message,
      });
    }
    next();
  } catch (error) {
    console.error("Auth middleware Error : ", error);
    return res.status(401).json({
      success: false,
      error: "Internal server error during authentication",
    });
  }
};
