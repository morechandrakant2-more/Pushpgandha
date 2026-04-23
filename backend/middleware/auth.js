module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization || req.query.token;

  if (!authHeader) {
    return res.status(401).json({ error: "No token" });
  }

  try {
    const token = authHeader.split(" ")[1]; // Bearer xxx

    const [id, name] = token.split("|");

    req.user = {
      id,
      name
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};