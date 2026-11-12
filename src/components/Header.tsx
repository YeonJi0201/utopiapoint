import React from 'react';
import { Search, UserRound } from 'lucide-react';
import { TabType } from '../types';
import { magicAudio } from '../utils/audio';
import logoImg from '../assets/hall/logo.webp';
import { TracedLogo } from './TracedLogo';
import { CREST_TRACE } from '../data/logoTrace';

interface HeaderProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  soundEnabled: boolean;
  /** 메인 현황 화면에서는 대연회장 배경 위에 겹쳐 놓인다 */
  overlay?: boolean;
}

const NAV_ITEMS: { id: TabType; label: string; short: string }[] = [
  { id: 'overview', label: '기숙사 현황', short: '기숙사 현황' },
  { id: 'details', label: '활동 상세 내역', short: '활동 내역' },
  { id: 'ranking', label: '명예의 전당', short: '명예의 전당' },
  { id: 'guide', label: '점수 기준표', short: '점수 기준표' },
];

const ActiveOrnament = () => (
  <svg className="gh-active-ornament" viewBox="0 0 150 20" aria-hidden="true" preserveAspectRatio="none">
    <path d="M2 5H70M80 5H148" />
    <path className="gh-fill" d="M75 1.5 77.4 5 75 8.5 72.6 5Z" />
    <path className="gh-fill" d="M2 5 4 3.6 6 5 4 6.4Z M144 5 146 3.6 148 5 146 6.4Z" />
    <path className="gh-fill" d="M75 13 78 17.5 75 22 72 17.5Z" />
  </svg>
);

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  soundEnabled,
  overlay = false,
}) => {
  const go = (tab: TabType) => {
    onTabChange(tab);
    if (soundEnabled) magicAudio.playGemClink();
  };

  return (
    <header className={`gh-header ${overlay ? 'is-overlay' : ''}`}>
      <div className="gh-bar">
        <button type="button" className="gh-brand" onClick={() => go('overview')} aria-label="기숙사 현황으로 이동">
          <TracedLogo className="gh-logo" src={logoImg} alt="" width={82} height={84} trace={CREST_TRACE} />
          <span className="gh-wordmark">Once Upon a time...</span>
        </button>

        <nav className="gh-nav" aria-label="주요 메뉴">
          {NAV_ITEMS.map((item, i) => (
            <React.Fragment key={item.id}>
              {i > 0 && <span className={`gh-sep gh-sep-${i}`} aria-hidden="true" />}
              <button
                type="button"
                className={`gh-nav-item gh-nav-${i}`}
                aria-current={currentTab === item.id ? 'page' : undefined}
                onClick={() => go(item.id)}
              >
                <span className="gh-nav-long">{item.label}</span>
                <span className="gh-nav-short">{item.short}</span>
                {currentTab === item.id && <ActiveOrnament />}
              </button>
            </React.Fragment>
          ))}
        </nav>

        <div className="gh-actions">
          <button
            type="button"
            className="gh-icon gh-icon-search"
            onClick={() => go('details')}
            aria-label="활동 기록 검색"
            title="활동 기록 검색"
          >
            <Search aria-hidden="true" strokeWidth={1.4} />
          </button>
          <span className="gh-icon-sep" aria-hidden="true" />
          {/* part of the original design; the admin room is only reachable at /admin */}
          <span className="gh-icon gh-icon-user" aria-hidden="true">
            <UserRound strokeWidth={1.4} />
          </span>
        </div>
      </div>
    </header>
  );
};
