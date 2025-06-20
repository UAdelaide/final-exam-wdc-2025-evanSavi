const db = require('./db');

async function insertTestData() {
  const conn = await db.getConnection();
  try {
    await conn.query(`DELETE FROM CompletedWalks`);
    await conn.query(`DELETE FROM WalkRequests`);
    await conn.query(`DELETE FROM Dogs`);
    await conn.query(`DELETE FROM Walkers`);
    await conn.query(`DELETE FROM Users`);

    await conn.query(`INSERT INTO Users (username, email) VALUES ('alice123', 'alice@example.com'), ('carol123', 'carol@example.com')`);
    await conn.query(`INSERT INTO Walkers (username) VALUES ('bobwalker'), ('newwalker')`);

    await conn.query(`INSERT INTO Dogs (dog_name, size, owner_id) VALUES
      ('Max', 'medium', 1),
      ('Bella', 'small', 2)`);

    await conn.query(`INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location) VALUES
      (1, '2025-06-10T08:00:00', 30, 'Parklands'),
      (2, '2025-06-11T10:00:00', 45, 'Riverwalk')`);

    await conn.query(`INSERT INTO CompletedWalks (request_id, walker_id, rating) VALUES
      (1, 1, 5),
      (2, 1, 4)`);
  } finally {
    conn.release();
  }
}

module.exports = insertTestData;
