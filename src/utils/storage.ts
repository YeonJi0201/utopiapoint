import { PointRecord } from '../types';
import { INITIAL_POINT_RECORDS } from '../data/initialRecords';
import { CUP_END_DATE } from '../data/houseData';

const STORAGE_KEY = 'hogwarts_house_cup_records_v1';
const ADMIN_PASS_KEY = 'hogwarts_house_cup_admin_pass';
const CUP_GOAL_KEY = 'hogwarts_house_cup_target_goal';
const CUP_END_KEY = 'hogwarts_house_cup_end_date';

/** fired on this page when the admin changes the end time (other tabs get 'storage') */
export const CUP_END_EVENT = 'house-cup-end-change';

export function loadStoredRecords(): PointRecord[] {
  if (typeof window === 'undefined') return INITIAL_POINT_RECORDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_POINT_RECORDS));
      return INITIAL_POINT_RECORDS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_POINT_RECORDS;
  } catch (err) {
    console.error('Failed to load records from storage, using defaults:', err);
    return INITIAL_POINT_RECORDS;
  }
}

export function saveStoredRecords(records: PointRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save records to storage:', err);
  }
}

export function resetStoredRecords(): PointRecord[] {
  if (typeof window === 'undefined') return INITIAL_POINT_RECORDS;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_POINT_RECORDS));
  } catch (err) {
    console.error('Failed to reset storage:', err);
  }
  return INITIAL_POINT_RECORDS;
}

export function getAdminPasscode(): string {
  if (typeof window === 'undefined') return 'alohomora';
  return localStorage.getItem(ADMIN_PASS_KEY) || 'alohomora';
}

export function setAdminPasscode(newPass: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_PASS_KEY, newPass);
}

export function getTargetCupGoal(): number {
  if (typeof window === 'undefined') return 500;
  const raw = localStorage.getItem(CUP_GOAL_KEY);
  return raw ? parseInt(raw, 10) || 500 : 500;
}

export function setTargetCupGoal(goal: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CUP_GOAL_KEY, goal.toString());
}

/** When the cup closes (ISO string). Set by the admin; falls back to the default in houseData. */
export function getCupEndDate(): string {
  if (typeof window === 'undefined') return CUP_END_DATE;
  try {
    const raw = localStorage.getItem(CUP_END_KEY);
    return raw && !Number.isNaN(new Date(raw).getTime()) ? raw : CUP_END_DATE;
  } catch {
    return CUP_END_DATE;
  }
}

export function setCupEndDate(iso: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUP_END_KEY, iso);
  } catch (err) {
    console.error('Failed to save the cup end date:', err);
  }
  window.dispatchEvent(new Event(CUP_END_EVENT));
}

export function exportDataAsJSON(records: PointRecord[]): void {
  const exportObject = {
    appName: 'Hogwarts House Cup Records',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    totalRecords: records.length,
    records,
  };
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `hogwarts_house_cup_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
