const express = require('express');
const app = express();
const port = 8000;
const db = require('./db');

app.use(express.json());

// Seed data on startup
async function insertTestData() {
  try {
    await db.execute(`DELETE FROM WalkRatings`);
    await db.execute(`DELETE FROM WalkApplications`);
    await db.execute(`DELETE FROM WalkRequests`);
    await db.execute(`DELETE FROM Dogs`);
    await db.execute(`DELETE FROM Users`);

    // Insert users
    await db.execute(`INSERT INTO Users (username, email, password_hash, role) VALUES
         ('alice123', 'alice@example.com', 'hashed123', 'owner'),
         ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
         ('carol123', 'carol@example.com', 'hashed789', 'owner'),
         ('davidwalker', 'david@example.com', 'hashedabc', 'walker'),
         ('emilyowner', 'emily@example.com', 'hashedxyz', 'owner')`);

    // Insert dogs
    await db.execute(`INSERT INTO Dogs (owner_id, name, size) VALUES
         ((SELECT user_id FROM Users WHERE username = 'alice123'), 'Max', 'medium'),
         ((SELECT user_id FROM Users WHERE username = 'carol123'), 'Bella', 'small'),
         ((SELECT user_id FROM Users WHERE username = 'alice123'), 'Rocky', 'large'),
         ((SELECT user_id FROM Users WHERE username = 'emilyowner'), 'Daisy', 'small'),
         ((SELECT user_id FROM Users WHERE username = 'carol123'), 'Luna', 'medium')`);

    // Insert walk requests
    await db.execute(`INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES
      (1, '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
      (2, '2025-06-10 09:00:00', 45, 'Greenside', 'completed')`);

    // Insert ratings
    await db.execute(`INSERT INTO WalkRatings (request_id, walker_id, owner_id, rating, comments) VALUES
      (2, 3, 2, 5, 'Great job!')`);

    console.log("Test data inserted.");
  } catch (err) {
    console.error("Error inserting test data:", err);
  }
}

insertTestData();

// /api/dogs route
app.get('/api/dogs', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT Dogs.name AS dog_name, Dogs.size, Users.username AS owner_username
      FROM Dogs
      JOIN Users ON Dogs.owner_id = Users.user_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching dogs' });
  }
});

// /api/walkrequests/open route
app.get('/api/walkrequests/open', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        WalkRequests.request_id,
        Dogs.name AS dog_name,
        WalkRequests.requested_time,
        WalkRequests.duration_minutes,
        WalkRequests.location,
        Users.username AS owner_username
      FROM WalkRequests
      JOIN Dogs ON WalkRequests.dog_id = Dogs.dog_id
      JOIN Users ON Dogs.owner_id = Users.user_id
      WHERE WalkRequests.status = 'open'
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching open walk requests' });
  }
});

// /api/walkers/summary route
app.get('/api/walkers/summary', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        u.username AS walker_username,
        COUNT(r.rating_id) AS total_ratings,
        ROUND(AVG(r.rating), 1) AS average_rating,
        (
          SELECT COUNT(*)
          FROM WalkRequests wr
          JOIN WalkApplications wa ON wr.request_id = wa.request_id
          WHERE wa.walker_id = u.user_id AND wr.status = 'completed'
        ) AS completed_walks
      FROM Users u
      LEFT JOIN WalkRatings r ON u.user_id = r.walker_id
      WHERE u.role = 'walker'
      GROUP BY u.user_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching walker summary' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
