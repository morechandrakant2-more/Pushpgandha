const db = require("../config/db");

exports.login = (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: "Username & password required" });
  }

  try {
    const user = db
      .prepare("SELECT * FROM admin WHERE user_name = ?")
      .get(username);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (user.user_pass !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    res.json({ token: "my-secret-token" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};