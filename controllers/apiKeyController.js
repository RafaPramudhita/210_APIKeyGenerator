const pool = require("../config/db");

exports.getAllApiKeys = async (req, res) => {
  const [rows] = await pool.query(`
    SELECT 
      id,
      key_value,
      out_of_date,
      CASE WHEN NOW() < out_of_date THEN 'ON' ELSE 'OFF' END AS status
    FROM api_keys2
  `);

  res.json(rows);
};
