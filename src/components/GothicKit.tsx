import React, { useRef } from 'react';
import { HouseId } from '../types';
import { HOUSES, HOUSE_ORDER } from '../data/houseData';
import { MINI_CREST } from '../data/hallAssets';
import { magicAudio } from '../utils/audio';
import { useHallAmbience } from './HallAmbience';

export const Triangle = ({ down = false }: { down?: boolean }) => (
  <svg className="ov-tri" viewBox="0 0 10 9" aria-hidden="true">
    <path d={down ? 'M0 0h10L5 9Z' : 'M5 0l5 9H0Z'} />
  </svg>
);

export const signed = (n: number) => (n > 0 ? `+${n.toLocaleString()}` : n.toLocaleString());

/** Hairline rule with a four-point star, as under "House Status". */
export const StarRule: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span className={`gp-star-rule ${className}`} aria-hidden="true">
    <svg viewBox="0 0 16 16">
      <path d="M8 0 9.3 6.7 16 8 9.3 9.3 8 16 6.7 9.3 0 8 6.7 6.7Z" />
    </svg>
  </span>
);

/**
 * Page shell for the inner pages: the hall sinks into shadow behind the
 * heading, dust keeps drifting, and the content sits on dark stone below.
 */
export const GothicPage: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => {
  const skyRef = useRef<HTMLDivElement>(null);
  const dustRef = useRef<HTMLCanvasElement>(null);
  useHallAmbience(skyRef, dustRef);

  return (
    <div className={`gp-page ${className}`}>
      <div className="gp-sky" ref={skyRef} aria-hidden="true">
        <div className="gp-sky-img" />
        <canvas className="gp-dust" ref={dustRef} />
      </div>
      <div className="gp-inner">{children}</div>
    </div>
  );
};

interface PageHeadingProps {
  title: string;
  lede: React.ReactNode;
  actions?: React.ReactNode;
}

export const PageHeading: React.FC<PageHeadingProps> = ({ title, lede, actions }) => (
  <header className="gp-heading">
    <h1 className="gp-title" lang="en">{title}</h1>
    <StarRule className="gp-heading-rule" />
    <p className="gp-lede">{lede}</p>
    {actions && <div className="gp-heading-actions">{actions}</div>}
  </header>
);

interface HouseTabsProps {
  value: HouseId | 'all';
  onChange: (value: HouseId | 'all') => void;
  allLabel: string;
  counts?: Partial<Record<HouseId | 'all', number>>;
  label: string;
}

/** House filter drawn like the main navigation: crest, name, underline ornament. */
export const HouseTabs: React.FC<HouseTabsProps> = ({ value, onChange, allLabel, counts, label }) => {
  const items: (HouseId | 'all')[] = ['all', ...HOUSE_ORDER];
  return (
    <div className="gp-tabs" role="group" aria-label={label}>
      {items.map((id) => {
        const active = value === id;
        const count = counts?.[id];
        return (
          <button
            key={id}
            type="button"
            className="gp-tab"
            data-house={id}
            aria-pressed={active}
            onClick={() => {
              magicAudio.playGemClink();
              onChange(id);
            }}
          >
            {id === 'all' ? (
              <svg className="gp-tab-all" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 0 9.3 6.7 16 8 9.3 9.3 8 16 6.7 9.3 0 8 6.7 6.7Z" />
              </svg>
            ) : (
              <img src={MINI_CREST[id]} alt="" />
            )}
            <span>{id === 'all' ? allLabel : HOUSES[id].nameKo}</span>
            {count !== undefined && <small>{count}</small>}
          </button>
        );
      })}
    </div>
  );
};

/** Text button wearing the ornate brass frame from the main page. */
export const FrameButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', children, ...rest }) => (
  <button type="button" className={`gp-frame-btn ${className}`} {...rest}>
    {children}
  </button>
);
