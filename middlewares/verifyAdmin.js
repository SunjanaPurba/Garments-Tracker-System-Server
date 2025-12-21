const verifyAdmin = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Forbidden: Admins only" });

    next();
  } catch (err) {
    console.error("verifyAdmin error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = verifyAdmin;
