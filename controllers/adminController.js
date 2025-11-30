const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.registerAdmin = async (req, res) => {
  const { email, password } = req.body;

  const [exist] = await pool.query("SELECT * FROM admins WHERE email = ?", [email]);
  if (exist.length > 0) {
    return res.status(400).json({ message: "Email already used" });
  }

  const hashed = await bcrypt.hash(password, 10);

  await pool.query("INSERT INTO admins (email, password) VALUES (?, ?)", [
    email,
    hashed,
  ]);

  res.json({ message: "Admin registered" });
};

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await pool.query("SELECT * FROM admins WHERE email = ?", [email]);
  if (rows.length === 0) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const admin = rows[0];
  const match = await bcrypt.compare(password, admin.password);

  if (!match) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: admin.id, email: admin.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES }
  );

  res.json({ message: "Login success", token });
};
