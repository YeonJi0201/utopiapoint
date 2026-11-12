import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Hourglass,
  ArrowLeft,
  Lock,
  Plus,
  Trash2,
  Edit2,
  Download,
  Upload,
  RefreshCw,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HouseId, PointCategory, PointRecord } from '../types';
import { HOUSES, HOUSE_ORDER, CATEGORY_LABELS, CUP_END_DATE, DEFAULT_AUTHORITIES } from '../data/houseData';
import { magicAudio } from '../utils/audio';
import { exportDataAsJSON } from '../utils/storage';
import * as backend from '../lib/backend';
import logoImg from '../assets/hall/logo.webp';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const pad2 = (n: number) => String(n).padStart(2, '0');

/** yyyy-MM-ddTHH:mm:ss in this browser's local time, for <input type="datetime-local"> */
const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
};

const longLabel = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]}) ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
};

const remainingLabel = (iso: string, now: number) => {
  const diff = new Date(iso).getTime() - now;
  if (!Number.isFinite(diff)) return '—';
  if (diff <= 0) return '대회 종료됨';
  const t = Math.floor(diff / 1000);
  return `${Math.floor(t / 86400)}일 ${pad2(Math.floor((t % 86400) / 3600))}시간 ${pad2(Math.floor((t % 3600) / 60))}분 ${pad2(t % 60)}초`;
};

interface AdminPageProps {
  records: PointRecord[];
  /** when the cup closes (ISO), as stored */
  cupEnd: string;
  /** set when records or settings could not be loaded */
  loadError?: string;
  onAddRecord: (record: backend.NewRecord) => Promise<void>;
  onUpdateRecord: (id: string, updated: Partial<PointRecord>) => Promise<void>;
  onDeleteRecord: (id: string) => Promise<void>;
  onImportRecords: (records: PointRecord[]) => Promise<void>;
  onResetRecords: () => Promise<void>;
  onSaveCupEnd: (iso: string) => Promise<void>;
}

const usingDatabase = backend.backendMode === 'supabase';

/**
 * The staff room, at /admin only: the cup's closing time, awarding and
 * deducting points, editing and deleting records, backups and settings.
 * Nothing on the public pages links here.
 */
export const AdminPage: React.FC<AdminPageProps> = ({
  records,
  cupEnd,
  loadError,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  onImportRecords,
  onResetRecords,
  onSaveCupEnd,
}) => {
  // who is signed in: checked with the database (or this tab, in local mode)
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  useEffect(() => {
    backend.isSignedInAdmin().then((ok) => {
      setIsAdmin(ok);
      setCheckingSession(false);
    });
  }, []);
  const onLogout = () => {
    backend.signOut();
    setIsAdmin(false);
  };

  // an action that failed (no permission, offline, …)
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const run = async (work: () => Promise<void>) => {
    setActionError('');
    setBusy(true);
    try {
      await work();
      return true;
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
      magicAudio.playDeductSound();
      return false;
    } finally {
      setBusy(false);
    }
  };

  // Sign-in state
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPasscodeChange, setShowPasscodeChange] = useState(false);
  const [newPasscode, setNewPasscode] = useState('');
  const [passcodeSuccess, setPasscodeSuccess] = useState('');

  // Admin tabs
  const [activeAdminTab, setActiveAdminTab] = useState<'schedule' | 'award' | 'manage' | 'settings'>('schedule');

  // Cup schedule
  const [cupEndInput, setCupEndInput] = useState(() => toLocalInput(cupEnd));
  // follow the stored value when it arrives or changes elsewhere
  useEffect(() => setCupEndInput(toLocalInput(cupEnd)), [cupEnd]);
  const [scheduleNote, setScheduleNote] = useState('');
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!isAdmin || activeAdminTab !== 'schedule') return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [isAdmin, activeAdminTab]);

  // New Award Form State
  const [targetHouse, setTargetHouse] = useState<HouseId>('gryffindor');
  const [characterName, setCharacterName] = useState('');
  const [characterGrade, setCharacterGrade] = useState<number>(3);
  const [activity, setActivity] = useState('');
  const [points, setPoints] = useState<number>(10);
  const [category, setCategory] = useState<PointCategory>('class');
  const [awardedBy, setAwardedBy] = useState<string>(DEFAULT_AUTHORITIES[1]);
  const [customAwarder, setCustomAwarder] = useState('');
  const [notes, setNotes] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Edit Mode state
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PointRecord>>({});

  // Search in Admin Table
  const [adminSearch, setAdminSearch] = useState('');

  const saveCupEnd = async (iso: string, note: string) => {
    const ok = await run(() => onSaveCupEnd(iso));
    if (!ok) return;
    setScheduleNote(note);
    magicAudio.playAwardSound();
    window.setTimeout(() => setScheduleNote(''), 3000);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const d = new Date(cupEndInput); // datetime-local is read as local time
    if (!cupEndInput || Number.isNaN(d.getTime())) {
      setScheduleNote('날짜와 시간을 올바르게 입력해 주세요.');
      return;
    }
    saveCupEnd(d.toISOString(), `대회 종료 시각을 ${longLabel(d.toISOString())}(으)로 저장했습니다.`);
  };

  // Handle Login
  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const result = await backend.signIn(email, passcode);
    setBusy(false);
    if (result.ok) {
      magicAudio.playAwardSound();
      setLoginError('');
      setPasscode('');
      setIsAdmin(true);
    } else {
      magicAudio.playDeductSound();
      setLoginError(result.message);
    }
  };

  // Handle Passcode Change
  const handleChangePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = newPasscode.trim();
    if (!next) return;
    if (usingDatabase && next.length < 8) {
      setActionError('비밀번호는 8자 이상으로 정해 주세요.');
      return;
    }
    const ok = await run(() => backend.changePassword(next));
    if (!ok) return;
    setPasscodeSuccess('관리자 비밀번호가 변경되었습니다.');
    setNewPasscode('');
    setTimeout(() => {
      setPasscodeSuccess('');
      setShowPasscodeChange(false);
    }, 2000);
  };

  // Submit Point Award
  const handleSubmitAward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!characterName.trim()) {
      alert('캐릭터(자캐) 이름을 입력해주세요.');
      return;
    }
    if (!activity.trim()) {
      alert('활동 내용 및 사유를 입력해주세요.');
      return;
    }
    if (points === 0) {
      alert('부여할 점수를 0이 아닌 숫자로 입력해주세요.');
      return;
    }

    const finalAwarder = awardedBy === 'custom' ? (customAwarder.trim() || '관리인') : awardedBy;

    const saved = await run(() =>
      onAddRecord({
        houseId: targetHouse,
        characterName: characterName.trim(),
        characterGrade,
        activity: activity.trim(),
        points,
        category,
        awardedBy: finalAwarder,
        notes: notes.trim() ? notes.trim() : undefined,
      }),
    );
    if (!saved) return;

    if (points > 0) {
      magicAudio.playAwardSound();
      confetti({
        particleCount: 70,
        spread: 50,
        origin: { y: 0.6 },
      });
    } else {
      magicAudio.playDeductSound();
    }

    setFormSuccess(`${HOUSES[targetHouse].nameKo}의 ${characterName} 학생에게 ${points > 0 ? `+${points}` : points}점이 수여되었습니다!`);
    
    // Reset fields
    setCharacterName('');
    setActivity('');
    setNotes('');
    setPoints(10);

    setTimeout(() => {
      setFormSuccess('');
    }, 3500);
  };

  // Quick Preset Points
  const applyPresetPoints = (presetValue: number) => {
    setPoints(presetValue);
    if (presetValue < 0) {
      setCategory('violation');
    }
    magicAudio.playGemClink();
  };

  // Handle Edit Record Save
  const handleSaveEdit = async (id: string) => {
    const ok = await run(() => onUpdateRecord(id, editForm));
    if (!ok) return;
    setEditingRecordId(null);
    magicAudio.playAwardSound();
  };

  // Handle File Import
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      let list: PointRecord[] | null = null;
      try {
        const json = JSON.parse(event.target?.result as string);
        list = json && Array.isArray(json.records) ? json.records : Array.isArray(json) ? json : null;
      } catch {
        alert('JSON 파일을 파싱하는 데 실패했습니다.');
        return;
      }
      if (!list) {
        alert('올바르지 않은 백업 파일 형식입니다.');
        return;
      }
      if (!confirm(`백업 파일의 기록 ${list.length}건으로 현재 기록 ${records.length}건을 모두 바꿉니다. 계속할까요?`)) return;
      const ok = await run(() => onImportRecords(list));
      if (ok) {
        magicAudio.playAwardSound();
        alert(`성공적으로 ${list.length}건의 기록을 불러왔습니다!`);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // the same file can be chosen again
  };

  return (
    <div className="admin-page min-h-screen bg-[#0b0c10] text-neutral-100 font-sans">
      <header className="border-b border-amber-900/40 bg-neutral-950/90">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src={logoImg} alt="" width={36} height={37} className="shrink-0" />
            <div className="min-w-0">
              <div className="font-cinzel text-sm text-amber-200/90 truncate">Once Upon a time...</div>
              <div className="text-[11px] text-neutral-400">관리자 집무실</div>
            </div>
          </div>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amber-200 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            홈페이지로
          </a>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="relative w-full rounded-2xl border border-amber-900/50 bg-neutral-950 p-6 sm:p-8 shadow-2xl text-neutral-100">

        {checkingSession ? (
          <p className="py-16 text-center text-xs text-neutral-400" role="status">
            로그인 상태를 확인하는 중…
          </p>
        ) : /* Not Logged In: Password Gate */ !isAdmin ? (
          <div className="max-w-md mx-auto py-8 text-center space-y-6">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-amber-950/60 border border-amber-600/50 text-amber-400">
              <Lock className="h-8 w-8" />
            </div>

            <div className="space-y-1.5">
              <h1 className="font-cinzel text-2xl font-bold text-neutral-100">
                교수진 및 관리자 집무실
              </h1>
              <p className="text-xs text-neutral-400">
                기숙사 우승컵 점수 부여 및 기록 관리는 권한을 가진 관리자만 가능합니다.{' '}
                {usingDatabase ? '관리자 계정의 이메일과 비밀번호를 입력하세요.' : '잠금 해제 주문(비밀번호)을 입력하세요.'}
              </p>
            </div>

            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              {usingDatabase && (
                <div>
                  <label htmlFor="admin-email" className="sr-only">
                    관리자 이메일
                  </label>
                  <input
                    id="admin-email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setLoginError('');
                    }}
                    placeholder="관리자 이메일"
                    className="w-full px-4 py-2.5 text-center text-sm bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-hidden focus:border-amber-500 placeholder-neutral-500"
                    autoFocus
                    required
                  />
                </div>
              )}
              <div>
                <label htmlFor="admin-password" className="sr-only">
                  비밀번호
                </label>
                <input
                  id="admin-password"
                  autoComplete="current-password"
                  type="password"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setLoginError('');
                  }}
                  placeholder={usingDatabase ? '비밀번호' : '잠금 해제 주문 입력...'}
                  className="w-full px-4 py-2.5 text-center text-sm font-mono tracking-widest bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-hidden focus:border-amber-500 placeholder-neutral-500"
                  autoFocus={!usingDatabase}
                  required
                />
              </div>

              {loginError && (
                <div className="text-xs text-rose-400 flex items-center justify-center gap-1.5 font-medium">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full py-2.5 px-4 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 rounded-lg shadow-md transition-colors font-cinzel tracking-wider"
              >
                {busy ? '확인하는 중…' : '집무실 입장하기 (ALOHOMORA)'}
              </button>
            </form>

            {!usingDatabase && (
              <p className="text-[11px] text-neutral-500">
                데이터베이스가 아직 연결되지 않아 이 브라우저에만 저장됩니다.
              </p>
            )}

          </div>
        ) : (
          /* Logged In: Full Admin Suite */
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-950/80 border border-amber-600/70 text-amber-300">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="font-cinzel text-xl font-bold text-neutral-100">
                    호그와트 관리자 집무실
                  </h1>
                  <div className="text-xs text-neutral-400">
                    대회 일정, 기숙사 점수 수여·감점, 활동 기록과 백업 관리
                  </div>
                </div>
              </div>

              {/* Top Admin Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    magicAudio.playGemClink();
                    onLogout();
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-neutral-400 bg-neutral-900 border border-neutral-800 rounded-md hover:text-rose-300 hover:border-rose-800 transition-colors"
                >
                  집무실 퇴장 (로그아웃)
                </button>
              </div>
            </div>

            {/* Admin Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800 pb-2">
              <button
                onClick={() => setActiveAdminTab('schedule')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeAdminTab === 'schedule'
                    ? 'bg-amber-950/70 text-amber-300 border border-amber-700/60'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                대회 일정
              </button>
              <button
                onClick={() => setActiveAdminTab('award')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeAdminTab === 'award'
                    ? 'bg-amber-950/70 text-amber-300 border border-amber-700/60'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                + 점수 수여 / 감점 입력
              </button>
              <button
                onClick={() => setActiveAdminTab('manage')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeAdminTab === 'manage'
                    ? 'bg-amber-950/70 text-amber-300 border border-amber-700/60'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                기록 수정 및 삭제 ({records.length})
              </button>
              <button
                onClick={() => setActiveAdminTab('settings')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeAdminTab === 'settings'
                    ? 'bg-amber-950/70 text-amber-300 border border-amber-700/60'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                백업 및 설정
              </button>
            </div>

            {/* problems: data that would not load, or an action that failed */}
            {(loadError || actionError) && (
              <div
                role="alert"
                className="p-3 bg-rose-950/50 border border-rose-700/50 rounded-lg text-rose-200 text-xs flex items-start gap-2"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-px" aria-hidden="true" />
                <span>{actionError || loadError}</span>
              </div>
            )}
            {!usingDatabase && (
              <p className="text-[11px] text-amber-300/80">
                데이터베이스 미연결: 지금은 이 브라우저에만 저장되어 다른 사람에게는 보이지 않습니다.
              </p>
            )}

            {/* SUCCESS BANNER */}
            {formSuccess && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-600/50 rounded-lg text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                <span className="font-medium">{formSuccess}</span>
              </div>
            )}

            {/* TAB 0: CUP SCHEDULE */}
            {activeAdminTab === 'schedule' && (
              <div className="space-y-6">
                <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-5 grid gap-5 sm:grid-cols-2">
                  <div>
                    <div className="text-[11px] text-neutral-400 mb-1">현재 대회 종료 시각</div>
                    <div className="text-sm font-semibold text-neutral-100">{longLabel(cupEnd)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-neutral-400 mb-1">메인 화면에 보이는 남은 시간</div>
                    <div className="text-sm font-semibold text-amber-300 tabular-nums flex items-center gap-1.5">
                      <Hourglass className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {remainingLabel(cupEnd, now)}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSaveSchedule} className="space-y-3">
                  <label htmlFor="cup-end" className="block text-xs font-semibold text-neutral-300">
                    대회 종료 날짜와 시각 (초 단위까지)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      id="cup-end"
                      type="datetime-local"
                      step={1}
                      value={cupEndInput}
                      onChange={(e) => setCupEndInput(e.target.value)}
                      className="w-full sm:w-72 px-3.5 py-2 text-sm bg-neutral-900 border border-neutral-700 rounded-md text-neutral-100 focus:outline-hidden focus:border-amber-500 [color-scheme:dark]"
                      required
                    />
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-md shadow-md transition-colors"
                    >
                      종료 시각 저장
                    </button>
                    <button
                      type="button"
                      onClick={() => saveCupEnd(CUP_END_DATE, `기본값(${longLabel(CUP_END_DATE)})으로 되돌렸습니다.`)}
                      className="px-4 py-2 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-700 rounded-md hover:border-amber-600 transition-colors"
                    >
                      기본값으로 되돌리기
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    이 기기의 시간대 기준으로 입력됩니다. 저장하면 메인 화면의 "대회 종료까지" 카운트다운이 바로 바뀝니다.
                  </p>
                  {scheduleNote && (
                    <div className="text-xs text-emerald-400 flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      {scheduleNote}
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* TAB 1: POINT AWARD FORM */}
            {activeAdminTab === 'award' && (
              <form onSubmit={handleSubmitAward} className="space-y-6">
                {/* 1. House Selector */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-2">
                    점수를 부여할 대상 기숙사 선택
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {HOUSE_ORDER.map((id) => {
                      const h = HOUSES[id];
                      const isSelected = targetHouse === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => {
                            setTargetHouse(id);
                            magicAudio.playGemClink();
                          }}
                          className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all ${
                            isSelected
                              ? `${h.borderColor} bg-neutral-900 ring-2 ring-amber-500/40 text-neutral-100 shadow-md`
                              : 'border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                          }`}
                        >
                          <img
                            src={h.crestImg}
                            alt={h.nameKo}
                            className="w-7 h-7 rounded-sm object-cover shrink-0"
                          />
                          <div>
                            <div className="text-xs font-bold font-cinzel">{h.nameKo}</div>
                            <div className="text-[10px] text-neutral-400 font-sans">{h.nameEn}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Character Name & Grade */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      캐릭터(자캐) 이름 *
                    </label>
                    <input
                      type="text"
                      value={characterName}
                      onChange={(e) => setCharacterName(e.target.value)}
                      placeholder="예: 아르테미스 블랙우드, 루카스 에반스"
                      className="w-full px-3.5 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-md text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      학년 (1~7학년)
                    </label>
                    <select
                      value={characterGrade}
                      onChange={(e) => setCharacterGrade(parseInt(e.target.value, 10))}
                      className="w-full px-3.5 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-md text-neutral-100 focus:outline-hidden focus:border-amber-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                        <option key={num} value={num}>
                          {num}학년
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. Points & Quick Presets */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-neutral-300">
                      부여 점수 (양수는 가산, 음수는 감점) *
                    </label>
                    <span className="text-[11px] text-neutral-400">
                      현재 설정: <strong className={points >= 0 ? 'text-amber-400 font-bold' : 'text-rose-400 font-bold'}>{points > 0 ? `+${points}` : points}점</strong>
                    </span>
                  </div>

                  {/* Number Input & Quick Presets */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="number"
                      value={points}
                      onChange={(e) => setPoints(parseInt(e.target.value, 10) || 0)}
                      className="w-full sm:w-36 px-3.5 py-2 text-sm font-mono font-bold bg-neutral-900 border border-neutral-700 rounded-md text-neutral-100 text-center focus:outline-hidden focus:border-amber-500"
                    />

                    {/* Presets */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-neutral-400 mr-1">빠른 입력:</span>
                      {[5, 10, 20, 30, 50].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => applyPresetPoints(val)}
                          className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-sm border transition-colors ${
                            points === val
                              ? 'bg-amber-950/80 text-amber-300 border-amber-600'
                              : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-amber-600/50'
                          }`}
                        >
                          +{val}
                        </button>
                      ))}
                      {[-5, -10, -20, -30].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => applyPresetPoints(val)}
                          className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-sm border transition-colors ${
                            points === val
                              ? 'bg-rose-950/80 text-rose-300 border-rose-600'
                              : 'bg-neutral-900 text-rose-300 border-neutral-800 hover:border-rose-800/50'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Activity Description (어떤 활동으로 점수를 주었는가) */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    활동 내용 및 상세 사유 *
                  </label>
                  <textarea
                    rows={3}
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    placeholder="예: 변신술 실습에서 찻잔을 흰 토끼로 완벽 변형함, 퀴디치 경기에서 스니치 포획, 야간 통금 위반 등"
                    className="w-full px-3.5 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-md text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-amber-500 leading-relaxed"
                    required
                  />
                </div>

                {/* 5. Category & Awarder */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      활동 분류 (카테고리)
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as PointCategory)}
                      className="w-full px-3.5 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-md text-neutral-100 focus:outline-hidden focus:border-amber-500"
                    >
                      {Object.entries(CATEGORY_LABELS).map(([catKey, info]) => (
                        <option key={catKey} value={catKey}>
                          {info.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      수여자 명의 (교수 / 관리인)
                    </label>
                    <select
                      value={awardedBy}
                      onChange={(e) => setAwardedBy(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-md text-neutral-100 focus:outline-hidden focus:border-amber-500"
                    >
                      {DEFAULT_AUTHORITIES.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                      <option value="custom">직접 수여자 이름 입력...</option>
                    </select>

                    {awardedBy === 'custom' && (
                      <input
                        type="text"
                        value={customAwarder}
                        onChange={(e) => setCustomAwarder(e.target.value)}
                        placeholder="예: 래번클로 7학년 반장, 마법부 심사관"
                        className="mt-2 w-full px-3 py-1.5 text-xs bg-neutral-900 border border-neutral-700 rounded-md text-neutral-100 focus:outline-hidden focus:border-amber-500"
                      />
                    )}
                  </div>
                </div>

                {/* 6. Notes (Optional) */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    추가 비고 / 로어 메모 (선택 사항)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="예: 표창장 수여, 트로피 진열실 청소 벌칙 병과"
                    className="w-full px-3.5 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-md text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2 border-t border-neutral-800 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-md shadow-md transition-colors flex items-center gap-1.5 font-cinzel tracking-wider"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>기숙사 점수 공식 수여하기</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: MANAGE & EDIT LOGS */}
            {activeAdminTab === 'manage' && (
              <div className="space-y-4">
                {/* Search in Admin */}
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="text"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="수정할 캐릭터명 또는 활동 내용 검색..."
                    className="w-full sm:w-80 px-3 py-1.5 text-xs bg-neutral-900 border border-neutral-700 rounded-md text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-amber-500"
                  />
                  <span className="text-xs text-neutral-400 font-mono">총 {records.length}건</span>
                </div>

                {/* Table of records */}
                <div className="max-h-96 overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-900/40 divide-y divide-neutral-800">
                  {records
                    .filter((r) => {
                      if (!adminSearch.trim()) return true;
                      const q = adminSearch.toLowerCase();
                      return (
                        r.characterName.toLowerCase().includes(q) ||
                        r.activity.toLowerCase().includes(q) ||
                        r.awardedBy.toLowerCase().includes(q)
                      );
                    })
                    .map((r) => {
                      const house = HOUSES[r.houseId];
                      const isEditing = editingRecordId === r.id;

                      if (isEditing) {
                        return (
                          <div key={r.id} className="p-4 bg-neutral-900 space-y-3">
                            <div className="text-xs font-bold text-amber-300">기록 수정 중...</div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <input
                                type="text"
                                value={editForm.characterName ?? r.characterName}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, characterName: e.target.value })
                                }
                                placeholder="캐릭터명"
                                className="px-2 py-1 text-xs bg-neutral-950 border border-neutral-700 rounded text-neutral-100"
                              />
                              <input
                                type="number"
                                value={editForm.points ?? r.points}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    points: parseInt(e.target.value, 10) || 0,
                                  })
                                }
                                placeholder="점수"
                                className="px-2 py-1 text-xs bg-neutral-950 border border-neutral-700 rounded text-neutral-100"
                              />
                              <select
                                value={editForm.houseId ?? r.houseId}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, houseId: e.target.value as HouseId })
                                }
                                className="px-2 py-1 text-xs bg-neutral-950 border border-neutral-700 rounded text-neutral-100"
                              >
                                {HOUSE_ORDER.map((hid) => (
                                  <option key={hid} value={hid}>
                                    {HOUSES[hid].nameKo}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <textarea
                              rows={2}
                              value={editForm.activity ?? r.activity}
                              onChange={(e) =>
                                setEditForm({ ...editForm, activity: e.target.value })
                              }
                              placeholder="활동 내용"
                              className="w-full px-2 py-1 text-xs bg-neutral-950 border border-neutral-700 rounded text-neutral-100"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingRecordId(null)}
                                className="px-3 py-1 text-xs text-neutral-400 bg-neutral-800 rounded hover:text-neutral-200"
                              >
                                취소
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(r.id)}
                                className="px-3 py-1 text-xs font-semibold text-neutral-950 bg-amber-400 rounded hover:bg-amber-300"
                              >
                                저장 완료
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={r.id}
                          className="p-3 sm:p-4 flex items-center justify-between gap-3 text-xs hover:bg-neutral-900/80 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span
                              className={`px-2 py-0.5 rounded font-mono font-bold shrink-0 ${
                                r.points >= 0
                                  ? 'bg-amber-950/60 text-amber-300'
                                  : 'bg-rose-950/60 text-rose-300'
                              }`}
                            >
                              {r.points >= 0 ? `+${r.points}` : r.points}점
                            </span>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-neutral-200">
                                  {r.characterName}
                                </span>
                                <span className={`text-[11px] ${house.accentColor}`}>
                                  {house.nameKo}
                                </span>
                                <span className="text-[11px] text-neutral-500">
                                  {r.characterGrade}학년
                                </span>
                              </div>
                              <p className="text-neutral-400 truncate mt-0.5">{r.activity}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                setEditingRecordId(r.id);
                                setEditForm({
                                  characterName: r.characterName,
                                  characterGrade: r.characterGrade,
                                  points: r.points,
                                  activity: r.activity,
                                  houseId: r.houseId,
                                });
                              }}
                              className="p-1.5 text-neutral-400 hover:text-amber-300 rounded hover:bg-neutral-800 transition-colors"
                              title="수정"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={async () => {
                                if (
                                  confirm(
                                    `'${r.characterName}'의 활동 기록을 삭제하시겠습니까? 이 기숙사 점수가 다시 차감/복원됩니다.`
                                  )
                                ) {
                                  if (await run(() => onDeleteRecord(r.id))) magicAudio.playDeductSound();
                                }
                              }}
                              disabled={busy}
                              className="p-1.5 text-neutral-400 hover:text-rose-400 rounded hover:bg-neutral-800 transition-colors"
                              title="삭제"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* TAB 3: SETTINGS & BACKUP */}
            {activeAdminTab === 'settings' && (
              <div className="space-y-6">
                {/* Backup & Restore */}
                <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
                  <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider font-cinzel">
                    데이터 백업 및 복원
                  </h3>
                  <p className="text-xs text-neutral-400">
                    현재 등록된 모든 자캐 점수 기록을 JSON 파일로 내보내거나 백업 파일에서 복원할 수 있습니다.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => exportDataAsJSON(records)}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-neutral-900 border border-neutral-700 rounded-md text-neutral-200 hover:border-amber-600 transition-colors"
                    >
                      <Download className="h-3.5 w-3.5 text-amber-400" />
                      <span>점수 기록 백업 다운로드 (.json)</span>
                    </button>

                    <label className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-neutral-900 border border-neutral-700 rounded-md text-neutral-200 hover:border-amber-600 transition-colors cursor-pointer">
                      <Upload className="h-3.5 w-3.5 text-amber-400" />
                      <span>백업 파일 불러오기 (.json)</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileImport}
                        className="hidden"
                      />
                    </label>

                    <button
                      onClick={async () => {
                        if (
                          confirm(
                            '정말로 초기 호그와트 기본 데이터로 리셋하시겠습니까? 현재 입력된 추가 데이터는 사라집니다.'
                          )
                        ) {
                          if (await run(onResetRecords)) {
                            magicAudio.playAwardSound();
                            alert('초기 기본 데이터로 재설정되었습니다.');
                          }
                        }
                      }}
                      disabled={busy}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-rose-300 bg-rose-950/30 border border-rose-900/50 rounded-md hover:bg-rose-900/40 transition-colors"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>기본 데이터로 초기화</span>
                    </button>
                  </div>
                </div>

                {/* Change Passcode */}
                <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
                  <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider font-cinzel">
                    {usingDatabase ? '내 관리자 비밀번호 변경' : '관리자 주문(비밀번호) 변경'}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {usingDatabase
                      ? '지금 로그인한 관리자 계정의 비밀번호를 바꿉니다 (8자 이상). 관리자 추가·삭제는 supabase/schema.sql 맨 아래 안내를 따르세요.'
                      : '관리자 집무실 잠금 해제에 사용되는 주문(비밀번호)을 변경합니다.'}
                  </p>

                  {passcodeSuccess && (
                    <div className="text-xs text-emerald-400">{passcodeSuccess}</div>
                  )}

                  <form onSubmit={handleChangePasscode} className="flex gap-3 max-w-sm pt-1">
                    <input
                      type={usingDatabase ? 'password' : 'text'}
                      autoComplete="new-password"
                      value={newPasscode}
                      onChange={(e) => setNewPasscode(e.target.value)}
                      placeholder="새로운 비밀번호 입력..."
                      className="flex-1 px-3 py-1.5 text-xs bg-neutral-950 border border-neutral-700 rounded-md text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors whitespace-nowrap"
                    >
                      변경 저장
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      </main>
    </div>
  );
};
