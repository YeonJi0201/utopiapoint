/**
 * Where the house cup's data lives.
 *
 *  - Supabase, when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set
 *    (see .env.example and supabase/schema.sql): everyone sees the same
 *    records, only admins can change them, and open pages update live.
 *  - Otherwise this browser's localStorage, as before, so the site still runs
 *    before the database exists.
 *
 * Everything else in the app talks to this module, never to either directly.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { HouseId, PointCategory, PointRecord } from '../types';
import { INITIAL_POINT_RECORDS } from '../data/initialRecords';
import { CUP_END_DATE } from '../data/houseData';
import {
  getAdminPasscode,
  getCupEndDate as getLocalCupEnd,
  loadStoredRecords,
  saveStoredRecords,
  setAdminPasscode,
  setCupEndDate as setLocalCupEnd,
  CUP_END_EVENT,
} from '../utils/storage';

export type NewRecord = Omit<PointRecord, 'id' | 'timestamp'>;

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as string | undefined;

const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;

/** 'supabase' when connected to the database, 'local' when using this browser only */
export const backendMode: 'supabase' | 'local' = supabase ? 'supabase' : 'local';

// ---------------------------------------------------------------------------
// rows <-> records
// ---------------------------------------------------------------------------

interface RecordRow {
  id: string;
  house_id: HouseId;
  character_name: string;
  character_grade: number;
  activity: string;
  points: number;
  category: PointCategory;
  awarded_by: string;
  notes: string | null;
  created_at: string;
}

const fromRow = (r: RecordRow): PointRecord => ({
  id: r.id,
  houseId: r.house_id,
  characterName: r.character_name,
  characterGrade: r.character_grade,
  activity: r.activity,
  points: r.points,
  category: r.category,
  awardedBy: r.awarded_by,
  timestamp: r.created_at,
  notes: r.notes ?? undefined,
});

const toRow = (r: Partial<PointRecord>) => {
  const row: Partial<Omit<RecordRow, 'id' | 'created_at'>> = {};
  if (r.houseId !== undefined) row.house_id = r.houseId;
  if (r.characterName !== undefined) row.character_name = r.characterName;
  if (r.characterGrade !== undefined) row.character_grade = r.characterGrade;
  if (r.activity !== undefined) row.activity = r.activity;
  if (r.points !== undefined) row.points = r.points;
  if (r.category !== undefined) row.category = r.category;
  if (r.awardedBy !== undefined) row.awarded_by = r.awardedBy;
  if ('notes' in r) row.notes = r.notes?.trim() ? r.notes : null;
  return row;
};

/** Turn a Supabase/Postgres error into a sentence an admin can act on. */
const explain = (err: { message?: string; code?: string } | null, what: string): Error => {
  const code = err?.code ?? '';
  if (code === '42501' || /row-level security|permission/i.test(err?.message ?? '')) {
    return new Error(`${what}: 관리자 권한이 없습니다. 관리자 계정으로 다시 로그인해 주세요.`);
  }
  if (code === '23514') return new Error(`${what}: 입력값이 허용 범위를 벗어났습니다.`);
  if (/fetch|network/i.test(err?.message ?? '')) return new Error(`${what}: 서버에 연결하지 못했습니다. 인터넷 연결을 확인해 주세요.`);
  return new Error(`${what}: ${err?.message ?? '알 수 없는 오류'}`);
};

// ---------------------------------------------------------------------------
// records
// ---------------------------------------------------------------------------

export async function loadRecords(): Promise<PointRecord[]> {
  if (!supabase) return loadStoredRecords();
  const { data, error } = await supabase
    .from('point_records')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw explain(error, '기록을 불러오지 못했습니다');
  return (data as RecordRow[]).map(fromRow);
}

export async function addRecord(rec: NewRecord): Promise<PointRecord> {
  if (!supabase) {
    const created: PointRecord = {
      ...rec,
      id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    saveStoredRecords([created, ...loadStoredRecords()]);
    return created;
  }
  const { data, error } = await supabase.from('point_records').insert(toRow(rec)).select().single();
  if (error) throw explain(error, '점수를 기록하지 못했습니다');
  return fromRow(data as RecordRow);
}

export async function updateRecord(id: string, patch: Partial<PointRecord>): Promise<PointRecord> {
  if (!supabase) {
    const all = loadStoredRecords().map((r) => (r.id === id ? { ...r, ...patch } : r));
    saveStoredRecords(all);
    return all.find((r) => r.id === id)!;
  }
  const { data, error } = await supabase.from('point_records').update(toRow(patch)).eq('id', id).select().single();
  if (error) throw explain(error, '기록을 수정하지 못했습니다');
  return fromRow(data as RecordRow);
}

export async function deleteRecord(id: string): Promise<void> {
  if (!supabase) {
    saveStoredRecords(loadStoredRecords().filter((r) => r.id !== id));
    return;
  }
  const { error } = await supabase.from('point_records').delete().eq('id', id);
  if (error) throw explain(error, '기록을 삭제하지 못했습니다');
}

/** Replace every record (restore a backup). All or nothing. */
export async function replaceRecords(records: PointRecord[]): Promise<void> {
  if (!supabase) {
    saveStoredRecords(records);
    return;
  }
  const { error } = await supabase.rpc('replace_point_records', { rows: records });
  if (error) throw explain(error, '기록을 바꾸지 못했습니다');
}

/** Back to the sample records the site started with. */
export const resetRecords = () => replaceRecords(INITIAL_POINT_RECORDS);

// ---------------------------------------------------------------------------
// the cup's end time
// ---------------------------------------------------------------------------

export async function loadCupEnd(): Promise<string> {
  if (!supabase) return getLocalCupEnd();
  const { data, error } = await supabase.from('cup_settings').select('ends_at').eq('id', 1).maybeSingle();
  if (error) throw explain(error, '대회 종료 시각을 불러오지 못했습니다');
  return (data?.ends_at as string | undefined) ?? CUP_END_DATE;
}

export async function saveCupEnd(iso: string): Promise<void> {
  if (!supabase) {
    setLocalCupEnd(iso);
    return;
  }
  const { data, error } = await supabase
    .from('cup_settings')
    .update({ ends_at: iso, updated_at: new Date().toISOString() })
    .eq('id', 1)
    .select('id');
  if (error) throw explain(error, '대회 종료 시각을 저장하지 못했습니다');
  // with row level security, a refused update changes nothing instead of failing
  if (!data?.length) throw explain({ code: '42501' }, '대회 종료 시각을 저장하지 못했습니다');
}

// ---------------------------------------------------------------------------
// live updates
// ---------------------------------------------------------------------------

/**
 * Call back whenever records or the end time change — made by an admin
 * anywhere (Supabase realtime) or, in local mode, in another tab.
 */
export function subscribe(handlers: { records: () => void; cupEnd: () => void }): () => void {
  if (!supabase) {
    const onStorage = (e: StorageEvent) => {
      if (e.key?.includes('records')) handlers.records();
      if (e.key?.includes('end_date')) handlers.cupEnd();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(CUP_END_EVENT, handlers.cupEnd);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(CUP_END_EVENT, handlers.cupEnd);
    };
  }
  const client = supabase;
  const channel = client
    .channel('house-cup')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'point_records' }, handlers.records)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'cup_settings' }, handlers.cupEnd)
    .subscribe();
  return () => {
    client.removeChannel(channel);
  };
}

// ---------------------------------------------------------------------------
// admin sign-in
// ---------------------------------------------------------------------------

const LOCAL_SESSION_KEY = 'hogwarts_house_cup_admin_session';

/** Is someone signed in as an admin right now? */
export async function isSignedInAdmin(): Promise<boolean> {
  if (!supabase) {
    try {
      return sessionStorage.getItem(LOCAL_SESSION_KEY) === '1';
    } catch {
      return false;
    }
  }
  const { data } = await supabase.auth.getSession();
  if (!data.session) return false;
  const { data: ok, error } = await supabase.rpc('is_admin');
  return !error && ok === true;
}

/**
 * Supabase: email + password, and the account must be in the admins table.
 * Local: the old passcode (email is ignored).
 */
export async function signIn(email: string, password: string): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!supabase) {
    if (password.trim().toLowerCase() !== getAdminPasscode().toLowerCase()) {
      return { ok: false, message: '주문(비밀번호)이 일치하지 않습니다. 다시 입력해주세요.' };
    }
    try {
      sessionStorage.setItem(LOCAL_SESSION_KEY, '1');
    } catch {
      /* ignore */
    }
    return { ok: true };
  }
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) {
    const message = /invalid login/i.test(error.message)
      ? '이메일 또는 비밀번호가 일치하지 않습니다.'
      : /fetch|network/i.test(error.message)
        ? '서버에 연결하지 못했습니다. 인터넷 연결과 Supabase 주소(VITE_SUPABASE_URL)를 확인해 주세요.'
        : `로그인하지 못했습니다: ${error.message}`;
    return { ok: false, message };
  }
  if (!(await isSignedInAdmin())) {
    await supabase.auth.signOut();
    return { ok: false, message: '이 계정은 관리자로 등록되어 있지 않습니다.' };
  }
  return { ok: true };
}

export async function signOut(): Promise<void> {
  if (!supabase) {
    try {
      sessionStorage.removeItem(LOCAL_SESSION_KEY);
    } catch {
      /* ignore */
    }
    return;
  }
  await supabase.auth.signOut();
}

/** Change the signed-in admin's password (local mode: the shared passcode). */
export async function changePassword(next: string): Promise<void> {
  if (!supabase) {
    setAdminPasscode(next);
    return;
  }
  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) throw explain(error, '비밀번호를 바꾸지 못했습니다');
}
