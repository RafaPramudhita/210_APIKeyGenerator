const pool = require("../config/db");
const crypto = require("crypto");

function generateKey() {
  return crypto.randomBytes(32).toString("hex");
}

exports.createUserWithApiKey = async (req, res) => {
  const { firstname, lastname, email } = req.body;

  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    // 1. Insert user
    const [userRes] = await conn.query(
      "INSERT INTO users (firstname, lastname, email) VALUES (?, ?, ?)",
      [firstname, lastname, email]
    );
    const userId = userRes.insertId;

    // 2. Create API Key
    const apiKey = generateKey();
    const outDate = new Date(Date.now() + 7 * 86400000); // +7 hari

    const [keyRes] = await conn.query(
      "INSERT INTO api_keys2 (key_value, out_of_date) VALUES (?, ?)",
      [apiKey, outDate]
    );

    const keyId = keyRes.insertId;

    // 3. Update user.apikeys
    await conn.query("UPDATE users SET apikeys = ? WHERE id = ?", [keyId, userId]);

    await conn.commit();

    res.json({
      message: "User created with API key",
      user: { id: userId, firstname, lastname, email },
      api_key: { id: keyId, key: apiKey, out_of_date: outDate },
    });
  } catch (err) {
    await conn.rollback();
    console.log(err);
    res.status(500).json({ message: "Server error" });
  } finally {
    conn.release();
  }
};

exports.getAllUsers = async (req, res) => {
  const [rows] = await pool.query(`
    SELECT u.*, ak.key_value, ak.out_of_date
    FROM users u
    LEFT JOIN api_keys2 ak ON u.apikeys = ak.id
  `);

  res.json(rows);
};
