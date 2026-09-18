import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

let db: any = null;

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (e) {
    console.error('Failed to create data directory:', e);
  }
}
const dbFilePath = path.join(dataDir, 'saleem_daal_factory.sqlite');

export async function initDatabase() {
  if (db) return db;
  const SQL = await initSqlJs({
    locateFile: (file: string) => {
      const nodeModulesPath = path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', file);
      if (fs.existsSync(nodeModulesPath)) {
        return nodeModulesPath;
      }
      return path.join(__dirname, file);
    }
  });
  if (fs.existsSync(dbFilePath)) {
    try {
      const fileBuffer = fs.readFileSync(dbFilePath);
      if (fileBuffer.length === 0) {
        console.warn('Database file was 0 bytes, creating fresh database...');
        db = new SQL.Database();
        persistDatabase();
      } else {
        db = new SQL.Database(fileBuffer);
      }
    } catch (readErr) {
      console.error('Error opening existing SQLite file (corrupt or invalid format):', readErr);
      const backupPath = `${dbFilePath}.corrupt-${Date.now()}`;
      try {
        fs.renameSync(dbFilePath, backupPath);
        console.log(`Corrupt database moved to: ${backupPath}`);
      } catch {}
      db = new SQL.Database();
      persistDatabase();
    }
  } else {
    db = new SQL.Database();
    persistDatabase();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS kv_store (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TEXT
    );
  `);
  console.log('SQLite database initialized at:', dbFilePath);
  return db;
}

export function persistDatabase() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbFilePath, buffer);
}

export function getStoreValue(key: string): any {
  if (!db) return null;
  const stmt = db.prepare('SELECT value FROM kv_store WHERE key = ?');
  stmt.bind([key]);
  if (stmt.step()) {
    const row = stmt.getAsObject() as { value: string };
    stmt.free();
    try {
      return JSON.parse(row.value);
    } catch {
      return row.value;
    }
  }
  stmt.free();
  return null;
}

export function setStoreValue(key: string, value: any): void {
  if (!db) return;
  const stringVal = typeof value === 'string' ? value : JSON.stringify(value);
  const now = new Date().toISOString();
  db.run('INSERT OR REPLACE INTO kv_store (key, value, updated_at) VALUES (?, ?, ?)', [key, stringVal, now]);
  persistDatabase();
}

export function getAllStoreValues(): Record<string, any> {
  if (!db) return {};
  const stmt = db.prepare('SELECT key, value FROM kv_store');
  const result: Record<string, any> = {};
  while (stmt.step()) {
    const row = stmt.getAsObject() as { key: string; value: string };
    try {
      result[row.key] = JSON.parse(row.value);
    } catch {
      result[row.key] = row.value;
    }
  }
  stmt.free();
  return result;
}
