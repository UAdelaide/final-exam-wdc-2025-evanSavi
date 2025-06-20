const db = require('./db');

async function insertTestData() {
  const conn = await db.getConnection();
  try {
    // Delete in reverse foreign key order
    await conn.query('DELETE FROM WalkRatings');
    await conn.query('DELETE FROM WalkApplications');
    await conn.query('DELETE FROM WalkRequests');
    await conn.query('DELETE FROM Dogs');
    await conn.query('DELETE FROM Users');

    // Insert users (2 owners, 2 walkers)
    await conn.query(`
      INSERT INTO Users (username, email, password_hash, role) VALUES
      ('alice123', 'alice@example.com', 'hash1', 'owner'),
      ('carol123', 'carol@example.com', 'hash2', 'owner'),
      ('bobwalker', 'bob@example.com', 'hash3', 'walker'),
      ('newwalker', 'new@example.com', 'hash4', 'walker')
    `);

    // Insert dogs
    await conn.query(`
      INSERT INTO Dogs (owner_id, name, size) VALUES
      (1, 'Max', 'medium'),
      (2, 'Bella', 'small')
    `);

    // Insert walk requests
    await conn.query(`
      INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES
      (1, '2025-06-10 08:00:00', 30, 'Parklands', 'completed'),
      (2, '2025-06-12 09:30:00', 45, 'Riverwalk', 'completed'),
      (1, '2025-06-15 10:00:00', 60, 'Central Park', 'open')
    `);

    // Insert walk ratings for completed requests
    await conn.query(`
      INSERT INTO WalkRatings (request_id, walker_id, owner_id, rating, comments) VALUES
      (1, 3, 1, 5, 'Great walk!'),
      (2, 3, 2, 4, 'On time and friendly')
    `);
  } catch (err) {
    console.error('Error seeding test data:', err);
  } finally {
    conn.release();
  }
}

module.exports = insertTestData;