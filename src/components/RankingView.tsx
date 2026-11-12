import React, { useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { HouseId, PointRecord } from '../types';
import { HOUSES } from '../data/houseData';
import { BANNER_IMG, MINI_CREST } from '../data/hallAssets';
import { GothicPage, HouseTabs, PageHeading, signed } from './GothicKit';

interface RankingViewProps {
  records: PointRecord[];
  onSelectCharacterFilter?: (characterName: string) => void;
}

interface CharacterScore {
  characterName: string;
  characterGrade: number;
  houseId: HouseId;
  totalPoints: number;
  activityCount: number;
  highestPointRecord: PointRecord | null;
}

/* Lancet arch: two arcs meeting at a point, the shape of the hall windows. */
const Arch: React.FC = () => (
  <svg className="gp-arch" viewBox="0 0 200 320" preserveAspectRatio="none" aria-hidden="true">
    <path className="gp-arch-fill" d="M2 318V128A150 150 0 0 1 100 2a150 150 0 0 1 98 126v190Z" />
    <path className="gp-arch-line" d="M2 318V128A150 150 0 0 1 100 2a150 150 0 0 1 98 126v190" />
    <path className="gp-arch-line gp-arch-inner" d="M12 318V132A140 140 0 0 1 100 16a140 140 0 0 1 88 116v186" />
  </svg>
);

const ORDINAL = ['First', 'Second', 'Third'];

export const RankingView: React.FC<RankingViewProps> = ({ records, onSelectCharacterFilter }) => {
  const [selectedHouse, setSelectedHouse] = useState<HouseId | 'all'>('all');

  const rankings = useMemo(() => {
    const map = new Map<string, CharacterScore>();
    records.forEach((rec) => {
      const key = `${rec.characterName}_${rec.houseId}`;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          characterName: rec.characterName,
          characterGrade: rec.characterGrade,
          houseId: rec.houseId,
          totalPoints: rec.points,
          activityCount: 1,
          highestPointRecord: rec,
        });
      } else {
        existing.totalPoints += rec.points;
        existing.activityCount += 1;
        if (!existing.highestPointRecord || rec.points > existing.highestPointRecord.points) {
          existing.highestPointRecord = rec;
        }
      }
    });
    const list = Array.from(map.values());
    const filtered = selectedHouse === 'all' ? list : list.filter((c) => c.houseId === selectedHouse);
    return filtered.sort((a, b) => b.totalPoints - a.totalPoints);
  }, [records, selectedHouse]);

  const podium = rankings.slice(0, 3);
  // visual order on wide screens: second, first, third
  const podiumOrder = podium.length === 3 ? [1, 0, 2] : podium.map((_, i) => i);

  return (
    <GothicPage className="gp-honors-page">
      <PageHeading
        title="Hall of Fame"
        lede={
          <>
            기숙사에 가장 많은 영광을 안긴 학생들의 이름이
            <br />
            대연회장의 깃발 아래 새겨집니다.
          </>
        }
      />

      <HouseTabs value={selectedHouse} onChange={setSelectedHouse} allLabel="전체 기숙사" label="기숙사별 순위 보기" />

      {podium.length > 0 && (
        <section className="gp-podium" aria-label="상위 3명">
          {podiumOrder.map((i) => {
            const c = podium[i];
            const house = HOUSES[c.houseId];
            return (
              <article key={`${c.characterName}_${c.houseId}`} className={`gp-niche is-rank-${i + 1}`} data-house={c.houseId}>
                <Arch />
                <p className="gp-niche-rank" lang="en">
                  <span>{i + 1}</span>
                  {ORDINAL[i]}
                </p>
                <div className="gp-niche-banner" style={{ backgroundImage: `url(${BANNER_IMG[c.houseId]})` }}>
                  <strong className="gp-niche-name">{c.characterName}</strong>
                  <span className="gp-niche-points">
                    {signed(c.totalPoints)} <small>pts</small>
                  </span>
                  <span className="gp-niche-sub">
                    {c.characterGrade}학년 · {house.nameKo}
                  </span>
                </div>
                {c.highestPointRecord && (
                  <p className="gp-niche-deed">
                    <span>대표 업적</span>
                    {c.highestPointRecord.activity}
                  </p>
                )}
              </article>
            );
          })}
        </section>
      )}

      <section className="gp-frame gp-roll" aria-labelledby="gp-roll-title">
        <header className="gp-roll-head">
          <h2 id="gp-roll-title">학생 기여도 전체 순위</h2>
          <span>{rankings.length.toLocaleString()}명</span>
        </header>

        {rankings.length === 0 ? (
          <p className="gp-roll-empty">아직 이 기숙사에 기록된 학생이 없습니다.</p>
        ) : (
          <ol className="gp-roll-list">
            {rankings.map((c, index) => {
              const house = HOUSES[c.houseId];
              return (
                <li key={`${c.characterName}_${c.houseId}`}>
                  <button
                    type="button"
                    className="gp-roll-row"
                    onClick={() => onSelectCharacterFilter?.(c.characterName)}
                    aria-label={`${index + 1}위 ${c.characterName}, ${signed(c.totalPoints)}점. 활동 기록 보기`}
                  >
                    <span className="gp-roll-no">{index + 1}</span>
                    <img src={MINI_CREST[c.houseId]} alt="" />
                    <span className="gp-roll-who">
                      <strong>{c.characterName}</strong>
                      <small>
                        {c.characterGrade}학년 · <span data-house={c.houseId}>{house.nameKo}</span>
                      </small>
                    </span>
                    <span className="gp-roll-deed">
                      {c.highestPointRecord ? `${c.highestPointRecord.activity} (${signed(c.highestPointRecord.points)})` : ''}
                    </span>
                    <span className="gp-roll-count">활동 {c.activityCount}회</span>
                    <span className={`gp-roll-points ${c.totalPoints < 0 ? 'is-down' : ''}`}>
                      {signed(c.totalPoints)} <small>pts</small>
                    </span>
                    <ChevronRight className="gp-roll-go" aria-hidden="true" strokeWidth={1.4} />
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </GothicPage>
  );
};
