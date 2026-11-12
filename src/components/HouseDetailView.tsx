import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { HouseId, PointCategory, PointRecord } from '../types';
import { HOUSES, CATEGORY_LABELS, HOUSE_ORDER } from '../data/houseData';
import { MINI_CREST } from '../data/hallAssets';
import { FrameButton, GothicPage, HouseTabs, PageHeading, StarRule, Triangle, signed } from './GothicKit';

interface HouseDetailViewProps {
  records: PointRecord[];
  initialHouseId?: HouseId | 'all';
  initialSearch?: string;
}

type SortKey = 'newest' | 'oldest' | 'highest' | 'lowest';

const PAGE_SIZE = 10;

/** page numbers to show: always the first and last, the current one and its
 *  neighbours, with gaps marked as null (rendered as an ellipsis) */
const pageList = (current: number, total: number): (number | null)[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const keep = new Set([1, total, current - 1, current, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((n) => keep.add(n));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((n) => keep.add(n));
  const nums = [...keep].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | null)[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push(null);
    out.push(n);
  });
  return out;
};

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/** e.g. 2026년 10월 4일 (일) 11:10 */
const dateLabel = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]}) ${hm}`;
};

export const HouseDetailView: React.FC<HouseDetailViewProps> = ({
  records,
  initialHouseId = 'all',
  initialSearch = '',
}) => {
  const [selectedHouse, setSelectedHouse] = useState<HouseId | 'all'>(initialHouseId);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<PointCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortKey>('newest');

  const [page, setPage] = useState(1);
  const ledgerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setSelectedHouse(initialHouseId), [initialHouseId]);
  useEffect(() => setSearchQuery(initialSearch), [initialSearch]);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return records
      .filter((rec) => {
        if (selectedHouse !== 'all' && rec.houseId !== selectedHouse) return false;
        if (selectedCategory !== 'all' && rec.category !== selectedCategory) return false;
        if (q) {
          const hay = [rec.characterName, rec.activity, rec.awardedBy, rec.notes ?? ''].join(' ').toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        if (sortBy === 'oldest') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        if (sortBy === 'highest') return b.points - a.points;
        return a.points - b.points;
      });
  }, [records, selectedHouse, selectedCategory, searchQuery, sortBy]);

  const stats = useMemo(() => {
    let plus = 0;
    let minus = 0;
    filteredRecords.forEach((r) => {
      if (r.points > 0) plus += r.points;
      else minus += Math.abs(r.points);
    });
    return { count: filteredRecords.length, plus, minus, net: plus - minus };
  }, [filteredRecords]);

  const counts = useMemo(() => {
    const c: Partial<Record<HouseId | 'all', number>> = { all: records.length };
    HOUSE_ORDER.forEach((id) => (c[id] = records.filter((r) => r.houseId === id).length));
    return c;
  }, [records]);

  // a new search or filter starts again from the first page
  useEffect(() => setPage(1), [selectedHouse, selectedCategory, searchQuery, sortBy]);

  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageRecords = filteredRecords.slice(pageStart, pageStart + PAGE_SIZE);

  const goToPage = (n: number) => {
    setPage(Math.min(Math.max(1, n), pageCount));
    const top = ledgerRef.current?.getBoundingClientRect().top;
    if (top !== undefined && top < 80) {
      window.scrollBy({ top: top - 96, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  };

  const filtersActive = searchQuery.trim() !== '' || selectedCategory !== 'all' || sortBy !== 'newest';

  const resetAll = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('newest');
    setSelectedHouse('all');
  };

  return (
    <GothicPage className="gp-ledger-page">
      <PageHeading
        title="Activity Ledger"
        lede={
          <>
            어떤 학생이 어떤 활동으로 점수를 얻거나 잃었는지,
            <br />
            교수진의 서명과 함께 남겨진 기록입니다.
          </>
        }
      />

      <HouseTabs
        value={selectedHouse}
        onChange={setSelectedHouse}
        allLabel="전체 기숙사"
        counts={counts}
        label="기숙사별 기록 보기"
      />

      <div className="gp-toolbar">
        <label className="gp-field gp-field-search">
          <Search aria-hidden="true" strokeWidth={1.5} />
          <span className="sr-only">기록 검색</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="학생 이름, 활동 내용, 수여자 검색"
          />
          {searchQuery && (
            <button type="button" className="gp-field-clear" onClick={() => setSearchQuery('')} aria-label="검색어 지우기">
              <X aria-hidden="true" strokeWidth={1.5} />
            </button>
          )}
        </label>

        <label className="gp-field gp-field-select">
          <span className="sr-only">활동 분류</span>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value as PointCategory | 'all')}>
            <option value="all">모든 활동 분류</option>
            {Object.entries(CATEGORY_LABELS).map(([key, info]) => (
              <option key={key} value={key}>
                {info.label}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden="true" strokeWidth={1.5} />
        </label>

        <label className="gp-field gp-field-select">
          <span className="sr-only">정렬</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}>
            <option value="newest">최근 기록부터</option>
            <option value="oldest">오래된 기록부터</option>
            <option value="highest">높은 점수부터</option>
            <option value="lowest">감점 큰 순서</option>
          </select>
          <ChevronDown aria-hidden="true" strokeWidth={1.5} />
        </label>

        <button
          type="button"
          className="gp-text-btn"
          onClick={() => {
            setSearchQuery('');
            setSelectedCategory('all');
            setSortBy('newest');
          }}
          disabled={!filtersActive}
        >
          필터 초기화
        </button>
      </div>

      <section className="gp-strip" aria-label="조회된 기록 요약">
        <div>
          <span>조회된 기록</span>
          <strong>
            {stats.count.toLocaleString()}
            <small>건</small>
          </strong>
        </div>
        <div>
          <span>수여된 점수</span>
          <strong className="is-up">
            <Triangle />
            {stats.plus.toLocaleString()}
          </strong>
        </div>
        <div>
          <span>감점된 점수</span>
          <strong className="is-down">
            <Triangle down />
            {stats.minus.toLocaleString()}
          </strong>
        </div>
        <div>
          <span>순 합계</span>
          <strong>
            {signed(stats.net)}
            <small>pts</small>
          </strong>
        </div>
      </section>

      {filteredRecords.length === 0 ? (
        <div className="gp-frame gp-empty">
          <StarRule />
          <h2>이 조건에 맞는 기록이 없습니다</h2>
          <p>검색어나 분류를 바꾸거나, 모든 필터를 풀고 전체 기록을 다시 펼쳐 보세요.</p>
          <FrameButton onClick={resetAll}>모든 필터 해제</FrameButton>
        </div>
      ) : (
        <>
        <div className="gp-frame gp-ledger" ref={ledgerRef}>
          <ol className="gp-entries" aria-label="활동 기록">
                {pageRecords.map((record) => {
                  const house = HOUSES[record.houseId];
                  const positive = record.points >= 0;
                  const category = CATEGORY_LABELS[record.category] ?? { label: record.category, description: '' };
                  return (
                    <li key={record.id} className="gp-entry" data-house={record.houseId}>
                      <img className="gp-entry-crest" src={MINI_CREST[record.houseId]} alt={house.nameKo} />
                      <div className="gp-entry-body">
                        <p className="gp-entry-who">
                          <strong>{record.characterName}</strong>
                          <span>{record.characterGrade}학년</span>
                          <span className="gp-entry-house">{house.nameKo}</span>
                          <span className="gp-entry-cat">{category.label}</span>
                        </p>
                        <p className="gp-entry-what">{record.activity}</p>
                        {record.notes && <p className="gp-entry-note">“{record.notes}”</p>}
                        <p className="gp-entry-meta">
                          <time dateTime={record.timestamp}>{dateLabel(record.timestamp)}</time>
                        </p>
                      </div>
                      <div className={`gp-entry-points ${positive ? 'is-up' : 'is-down'}`}>
                        <strong>
                          <Triangle down={!positive} />
                          {signed(record.points)}
                        </strong>
                        <span>{positive ? '가산' : '감점'}</span>
                      </div>
                    </li>
                  );
                })}
          </ol>
        </div>

        {pageCount > 1 && (
          <nav className="gp-pager" aria-label="기록 페이지">
            <p className="gp-pager-range">
              {(pageStart + 1).toLocaleString()}–{Math.min(pageStart + PAGE_SIZE, filteredRecords.length).toLocaleString()}
              <span> / 총 {filteredRecords.length.toLocaleString()}건</span>
            </p>
            <div className="gp-pager-pages">
              <button
                type="button"
                className="gp-pager-step"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="이전 페이지"
              >
                <ChevronLeft aria-hidden="true" strokeWidth={1.5} />
              </button>
              {pageList(currentPage, pageCount).map((n, i) =>
                n === null ? (
                  <span key={`gap-${i}`} className="gp-pager-gap" aria-hidden="true">
                    …
                  </span>
                ) : (
                  <button
                    key={n}
                    type="button"
                    className="gp-pager-num"
                    onClick={() => goToPage(n)}
                    aria-current={n === currentPage ? 'page' : undefined}
                    aria-label={`${n}페이지`}
                  >
                    {n}
                  </button>
                ),
              )}
              <button
                type="button"
                className="gp-pager-step"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === pageCount}
                aria-label="다음 페이지"
              >
                <ChevronRight aria-hidden="true" strokeWidth={1.5} />
              </button>
            </div>
          </nav>
        )}
        </>
      )}
    </GothicPage>
  );
};
