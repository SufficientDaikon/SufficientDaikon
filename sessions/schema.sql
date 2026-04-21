CREATE TABLE IF NOT EXISTS signups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  availability TEXT NOT NULL,
  workExperience TEXT NOT NULL,
  ip TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email ON signups(email);
CREATE INDEX IF NOT EXISTS idx_createdAt ON signups(createdAt);
