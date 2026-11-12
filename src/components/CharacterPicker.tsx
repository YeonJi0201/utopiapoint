import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { HOUSES, HOUSE_ORDER } from '../data/houseData';
import type { HouseId } from '../types';
import { CommunityCharacter, fetchCommunityCharacters } from '../lib/characters';

interface CharacterPickerProps {
  value: string;
  onChange: (name: string) => void;
  /** a character from the archive was chosen (fill in house and grade) */
  onPick: (character: CommunityCharacter) => void;
}

/**
 * The character-name field: type to search the archive's characters (with
 * their portraits), pick one to fill in house and grade, or just type a name
 * that isn't in the archive.
 */
export const CharacterPicker: React.FC<CharacterPickerProps> = ({ value, onChange, onPick }) => {
  const [characters, setCharacters] = useState<CommunityCharacter[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  // which house's characters the list shows
  const [houseFilter, setHouseFilter] = useState<HouseId | 'all'>('all');
  const listId = useId();
  const inputId = useId();
  const listRef = useRef<HTMLUListElement>(null);

  const load = () => {
    setStatus('loading');
    fetchCommunityCharacters()
      .then((list) => {
        setCharacters(list);
        setStatus('ready');
        setError('');
      })
      .catch((e: Error) => {
        setStatus('error');
        setError(e.message);
      });
  };
  useEffect(load, []);

  const matches = useMemo(() => {
    const q = value.trim().toLowerCase();
    return characters
      .filter((c) => houseFilter === 'all' || c.house === houseFilter)
      .filter((c) => !q || c.nameKo.toLowerCase().includes(q) || c.nameEn.toLowerCase().includes(q));
  }, [characters, value, houseFilter]);

  const houseCounts = useMemo(() => {
    const n: Record<HouseId | 'all', number> = { all: characters.length, gryffindor: 0, slytherin: 0, ravenclaw: 0, hufflepuff: 0 };
    characters.forEach((c) => c.house && n[c.house]++);
    return n;
  }, [characters]);

  useEffect(() => setActive(0), [value, houseFilter]);
  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const choose = (c: CommunityCharacter) => {
    onChange(c.nameKo);
    onPick(c);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!matches.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (a + 1) % matches.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (a - 1 + matches.length) % matches.length);
    } else if (e.key === 'Enter' && open) {
      e.preventDefault();
      choose(matches[active]);
    }
  };

  const showList = open && status === 'ready' && characters.length > 0;

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={inputId} className="text-xs font-semibold text-neutral-300">
          캐릭터(자캐) 이름 *
        </label>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-amber-300 transition-colors"
          title="캐릭터 도감에서 목록을 다시 불러옵니다"
        >
          <RefreshCw className={`h-3 w-3 ${status === 'loading' ? 'animate-spin' : ''}`} aria-hidden="true" />
          {status === 'loading' ? '불러오는 중…' : status === 'ready' ? `도감 ${characters.length}명` : '목록 새로고침'}
        </button>
      </div>
      <input
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList ? `${listId}-${active}` : undefined}
        autoComplete="off"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKeyDown}
        placeholder={status === 'ready' ? '이름으로 검색하거나 직접 입력' : '예: 아르테미스 블랙우드'}
        className="w-full px-3.5 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-md text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-amber-500"
        required
      />
      {status === 'error' && (
        <p className="mt-1.5 text-[11px] text-amber-300/80">{error} 이름은 직접 입력할 수 있습니다.</p>
      )}
      {showList && (
        <div className="absolute z-20 mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 shadow-2xl overflow-hidden">
          {/* house tabs: keep focus in the name field while switching */}
          <div role="group" aria-label="기숙사별로 보기" className="flex flex-wrap gap-1 p-1.5 border-b border-neutral-800">
            {(['all', ...HOUSE_ORDER] as const).map((h) => (
              <button
                key={h}
                type="button"
                aria-pressed={houseFilter === h}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setHouseFilter(h)}
                className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded border transition-colors ${
                  houseFilter === h
                    ? 'bg-amber-950/80 text-amber-300 border-amber-600'
                    : 'text-neutral-400 border-transparent hover:text-neutral-200 hover:border-neutral-700'
                }`}
              >
                {h === 'all' ? '전체' : HOUSES[h].nameKo}
                <span className="text-neutral-500">{houseCounts[h]}</span>
              </button>
            ))}
          </div>
          {matches.length === 0 ? (
            <p className="px-3 py-3 text-[11px] text-neutral-500">
              {value.trim() ? '이 기숙사에 맞는 이름이 없습니다. 이름은 그대로 직접 입력해도 됩니다.' : '이 기숙사의 캐릭터가 없습니다.'}
            </p>
          ) : (
        <ul
          id={listId}
          ref={listRef}
          role="listbox"
          className="max-h-72 overflow-y-auto py-1"
        >
          {matches.map((c, i) => (
            <li
              key={c.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(c)}
              onMouseEnter={() => setActive(i)}
              className={`flex items-center gap-2.5 px-2.5 py-1.5 cursor-pointer ${i === active ? 'bg-amber-950/60' : ''}`}
            >
              {c.thumbnail ? (
                <img src={c.thumbnail} alt="" loading="lazy" className="h-8 w-8 rounded-full object-cover shrink-0 bg-neutral-800" />
              ) : (
                <span className="h-8 w-8 rounded-full bg-neutral-800 shrink-0" aria-hidden="true" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-neutral-100 truncate">{c.nameKo}</span>
                {c.nameEn && <span className="block text-[10px] text-neutral-500 truncate">{c.nameEn}</span>}
              </span>
              <span className="text-[10px] text-neutral-400 shrink-0">
                {[c.house ? HOUSES[c.house].nameKo : null, c.year ? `${c.year}학년` : null].filter(Boolean).join(' · ')}
              </span>
            </li>
          ))}
        </ul>
          )}
        </div>
      )}
    </div>
  );
};
