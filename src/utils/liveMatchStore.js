import { getDatabase } from '../database/database';

export async function saveLiveMatchState(matchId, state) {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO live_match_state (match_id, state_json, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(match_id) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at`,
    [matchId, JSON.stringify(state)]
  );
}

export async function loadLiveMatchState(matchId) {
  const db = await getDatabase();
  const row = await db.getFirstAsync(
    'SELECT state_json FROM live_match_state WHERE match_id = ?',
    [matchId]
  );
  if (!row) return null;
  try {
    return JSON.parse(row.state_json);
  } catch {
    return null;
  }
}

export async function clearLiveMatchState(matchId) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM live_match_state WHERE match_id = ?', [matchId]);
}
