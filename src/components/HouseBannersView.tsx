import React, { useEffect, useRef, useState } from 'react';
import { ChartColumnIncreasing, ChevronRight, Sparkle, Trophy } from 'lucide-react';
import { HouseId, PointRecord } from '../types';
import { HOUSES, HOUSE_ORDER } from '../data/houseData';
import { magicAudio } from '../utils/audio';
import { HallBackdrop, useHallAmbience } from './HallAmbience';

import titleImg from '../assets/hall/title.webp';
import { BANNER_IMG, MINI_CREST } from '../data/hallAssets';
import { StarRule, Triangle } from './GothicKit';
import rodsImg from '../assets/hall/banner-rods.webp';
import { TracedLogo } from './TracedLogo';
import { TITLE_TRACE } from '../data/logoTrace';
interface HouseBannersViewProps {
  records: PointRecord[];
  /** when the cup closes (ISO) */
  cupEnd: string;
  onSelectHouseDetail: (houseId: HouseId) => void;
  onOpenGuide: () => void;
  onOpenStats: () => void;
}

/** Time left until the cup closes (the end time the admin set), ticking every second. */
function useCountdown(target: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const diff = new Date(target).getTime() - now;
  if (!Number.isFinite(diff) || diff <= 0) return null;
  const totalSec = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  };
}

const pad2 = (n: number) => String(n).padStart(2, '0');

const formatChange = (n: number) => (n > 0 ? `+${n.toLocaleString()}` : n.toLocaleString());

export const HouseBannersView: React.FC<HouseBannersViewProps> = ({
  records,
  cupEnd,
  onSelectHouseDetail,
  onOpenGuide,
  onOpenStats,
}) => {
  const houseScores: Record<HouseId, number> = { gryffindor: 0, slytherin: 0, ravenclaw: 0, hufflepuff: 0 };
  const weeklyScores: Record<HouseId, number> = { gryffindor: 0, slytherin: 0, ravenclaw: 0, hufflepuff: 0 };
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  records.forEach((record) => {
    houseScores[record.houseId] += record.points;
    if (new Date(record.timestamp).getTime() >= weekAgo) {
      weeklyScores[record.houseId] += record.points;
    }
  });

  const sortedHouses = [...HOUSE_ORDER].sort((a, b) => houseScores[b] - houseScores[a]);
  const participantCount = new Set(records.map((r) => `${r.characterName}_${r.houseId}`)).size;
  const weeklyTotal = Object.values(weeklyScores).reduce((sum, v) => sum + v, 0);
  const countdown = useCountdown(cupEnd);
  const stageRef = useRef<HTMLDivElement>(null);
  const dustRef = useRef<HTMLCanvasElement>(null);
  const depthRef = useRef<HTMLCanvasElement>(null);
  useHallAmbience(stageRef, dustRef, depthRef);

  return (
    <div className="ov-stage" ref={stageRef}>
      {/* only the hall itself moves; everything below stays put */}
      <div className="ov-camera">
        <HallBackdrop ref={depthRef} />
      </div>

      <section className="ov-intro" aria-labelledby="ov-title">
        <p className="ov-eyebrow">Hogwarts House Cup</p>
        <h1 className="ov-title" id="ov-title">
          <TracedLogo src={titleImg} alt="House Status" width={408} height={82} trace={TITLE_TRACE} />
        </h1>
        <StarRule className="ov-divider" />
        <p className="ov-lede">
          네 개의 기숙사가, 지금 이 순간에도
          <br />
          호그와트를 빛내고 있습니다.
        </p>
        <button type="button" className="ov-guide-btn" onClick={onOpenGuide}>
          대회 안내 보기 <ChevronRight aria-hidden="true" strokeWidth={1.5} />
        </button>
      </section>

      <aside className="ov-ranking" aria-labelledby="ov-ranking-title">
        <svg className="ov-ranking-star" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 0 9.3 6.7 16 8 9.3 9.3 8 16 6.7 9.3 0 8 6.7 6.7Z" />
        </svg>
        <span className="ov-ranking-rule" aria-hidden="true" />
        <h2 className="ov-ranking-title" id="ov-ranking-title">Current Ranking</h2>
        <ol className="ov-ranking-list">
          {sortedHouses.map((houseId, index) => {
            const weekly = weeklyScores[houseId];
            return (
              <li className="ov-rank-row" key={houseId}>
                <span className="ov-rank-no">{index + 1}</span>
                <img className="ov-rank-crest" src={MINI_CREST[houseId]} alt="" />
                <span className="ov-rank-name">{HOUSES[houseId].nameEn}</span>
                <span className="ov-rank-score">
                  {houseScores[houseId].toLocaleString()} <small>pts</small>
                </span>
                <span className={`ov-rank-change ${weekly > 0 ? 'is-up' : weekly < 0 ? 'is-down' : 'is-flat'}`}>
                  {weekly === 0 ? (
                    <span aria-label="이번 주 변동 없음">— &nbsp;-</span>
                  ) : (
                    <>
                      <Triangle down={weekly < 0} />
                      <span>{formatChange(weekly)}</span>
                    </>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      </aside>

      <img className="ov-rods" src={rodsImg} alt="" aria-hidden="true" />
      <section className="ov-banners" aria-label="네 기숙사의 점수">
        {HOUSE_ORDER.map((houseId) => {
          const house = HOUSES[houseId];
          const weekly = weeklyScores[houseId];
          return (
            <div className={`ov-banner-slot ov-slot-${houseId}`} key={houseId}>
              <button
                type="button"
                className="ov-banner"
                data-house={houseId}
                style={{ backgroundImage: `url(${BANNER_IMG[houseId]})` }}
                onClick={() => {
                  magicAudio.playGemClink();
                  onSelectHouseDetail(houseId);
                }}
                aria-label={`${house.nameKo} ${houseScores[houseId].toLocaleString()}점, 이번 주 ${weekly === 0 ? '변동 없음' : formatChange(weekly)}. 활동 기록 보기`}
              >
                <span className="ov-banner-name" aria-hidden="true">{house.nameEn}</span>
                <span className="ov-banner-score" aria-hidden="true">
                  {houseScores[houseId].toLocaleString()} <small>pts</small>
                </span>
                <span className="ov-banner-change" aria-hidden="true">
                  {weekly === 0 ? (
                    '—'
                  ) : (
                    <>
                      <Triangle down={weekly < 0} />
                      {formatChange(weekly)}
                    </>
                  )}
                </span>
              </button>
            </div>
          );
        })}
      </section>

      <div className="ov-band" aria-hidden="true" />
      <section className="ov-stats" aria-label="대회 통계">
        <div className="ov-stat ov-stat-1">
          <Trophy className="ov-stat-icon" aria-hidden="true" strokeWidth={1.3} />
          <span className="ov-stat-label">대회 종료까지</span>
          <strong className="ov-stat-value ov-countdown">
            {countdown
              ? `${countdown.days}일 ${pad2(countdown.hours)}시간 ${pad2(countdown.minutes)}분 ${pad2(countdown.seconds)}초`
              : '대회 종료'}
          </strong>
        </div>
        <div className="ov-stat ov-stat-2">
          <ChartColumnIncreasing className="ov-stat-icon" aria-hidden="true" strokeWidth={1.3} />
          <span className="ov-stat-label">전체 참여 인원</span>
          <strong className="ov-stat-value">{participantCount.toLocaleString()}명</strong>
        </div>
        <div className="ov-stat ov-stat-3">
          <Sparkle className="ov-stat-icon" aria-hidden="true" strokeWidth={1.3} />
          <span className="ov-stat-label">이번 주 획득 점수</span>
          <strong className="ov-stat-value">
            {weeklyTotal.toLocaleString()} <small>pts</small>
          </strong>
        </div>
        <button type="button" className="ov-stats-btn" onClick={onOpenStats}>
          상세 통계 보기 <ChevronRight aria-hidden="true" strokeWidth={1.5} />
        </button>
      </section>

      <a className="ov-scroll" href="#site-footer">Scroll Down</a>
      <canvas className="ov-dust" ref={dustRef} aria-hidden="true" />
    </div>
  );
};
