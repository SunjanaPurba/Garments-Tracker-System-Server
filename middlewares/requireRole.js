const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin required" });
  next();
};

const requireManager = (req, res, next) => {
  if (req.user.role !== "manager")
    return res.status(403).json({ message: "Manager required" });
  next();
};

const requireBuyer = (req, res, next) => {
  if (req.user.role !== "buyer")
    return res.status(403).json({ message: "Buyer required" });
  next();
};

module.exports = { requireAdmin, requireManager, requireBuyer };
