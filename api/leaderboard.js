import postgres from "postgres";

const connectionString =
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.DATABASE_URL;

let sql;
let tableReady;

function getClient() {
  if (!connectionString) {
    throw new Error("Missing POSTGRES_URL or DATABASE_URL.");
  }

  if (!sql) {
    sql = postgres(connectionString, {
      max: 1,
      ssl: "require",
    });
  }

  return sql;
}

async function ensureTable() {
  if (!tableReady) {
    const db = getClient();

    tableReady = db`
      CREATE TABLE IF NOT EXISTS leaderboard_entries (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        score INTEGER NOT NULL CHECK (score >= 0),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
  }

  return tableReady;
}

async function readLeaderboard() {
  await ensureTable();
  const db = getClient();

  return db`
    SELECT name, score, created_at AS date
    FROM leaderboard_entries
    ORDER BY score DESC, created_at ASC
    LIMIT 5
  `;
}

function parseBody(body) {
  if (!body) return {};
  if (typeof body === "object") return body;
  return JSON.parse(body);
}

function cleanName(name) {
  if (typeof name !== "string") return "Player";

  const trimmedName = name.trim().replace(/\s+/g, " ");
  return trimmedName.slice(0, 18) || "Player";
}

function cleanScore(score) {
  const parsedScore = Number(score);

  if (!Number.isFinite(parsedScore)) {
    return null;
  }

  return Math.max(0, Math.floor(parsedScore));
}

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const leaderboard = await readLeaderboard();
      return res.status(200).json({ leaderboard });
    }

    if (req.method === "POST") {
      const body = parseBody(req.body);
      const name = cleanName(body.name);
      const score = cleanScore(body.score);

      if (score === null) {
        return res.status(400).json({ error: "Score must be a number." });
      }

      await ensureTable();
      const db = getClient();

      await db`
        INSERT INTO leaderboard_entries (name, score)
        VALUES (${name}, ${score})
      `;

      const leaderboard = await readLeaderboard();
      return res.status(201).json({ leaderboard });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    console.error("Leaderboard API error:", error);
    return res.status(500).json({ error: "Leaderboard unavailable." });
  }
}
