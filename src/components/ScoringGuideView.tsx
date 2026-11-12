import React from 'react';
import { Flame, ShieldCheck, Skull, Trophy, WandSparkles } from 'lucide-react';
import { GothicPage, PageHeading } from './GothicKit';

const awardSections = [
  {
    id: 'classes',
    icon: WandSparkles,
    title: '마법 수업 및 학술 과제',
    range: '+5 ~ +30',
    description: '정규 마법 수업(마법약, 변신술, 어둠의 마법 방어술, 마법의 역사, 약초학 등)에서의 학업 성취와 뛰어난 마법 구현에 수여됩니다.',
    examples: [
      ['교수 질문에 정확한 답변 및 학술 이론 설명', '+5 ~ +10점'],
      ['고난도 마법약 완벽 조제 또는 마법 주문 1차 시도 성공', '+15 ~ +20점'],
      ['새로운 주문 변형 연구 또는 학술 경시대회 입상', '+25 ~ +30점'],
    ],
  },
  {
    id: 'quidditch',
    icon: Trophy,
    title: '퀴디치 경기 및 비행 시합',
    range: '+10 ~ +50',
    description: '호그와트 공식 퀴디치 리그전 및 기숙사 대항 친선 비행 훈련에서의 공헌도에 따라 차등 부여됩니다.',
    examples: [
      ['추적수의 득점 성공 (골 1회당)', '+10점'],
      ['파수꾼 및 몰이꾼의 결정적 블록/수비 플레이', '+15 ~ +25점'],
      ['수색꾼의 골든 스니치 포획 및 기숙사 시합 최종 승리', '+50점'],
    ],
  },
  {
    id: 'duelling',
    icon: Flame,
    title: '결투 클럽 및 마법 대련',
    range: '+10 ~ +30',
    description: '교수의 감독 하에 진행되는 신사적인 마법 결투 및 방어 마법 시연에 대한 공식 점수입니다.',
    examples: [
      ['상대 주문에 대한 완벽한 방어 마법(프로테고 등) 연계', '+10점'],
      ['무장해제(엑스펠리아르무스) 성공으로 공식 승리', '+20점'],
      ['실체형 패트로누스 발현 등 고등 마법 실연', '+25 ~ +30점'],
    ],
  },
  {
    id: 'contribution',
    icon: ShieldCheck,
    title: '모범 행동 및 호그와트 공헌',
    range: '+10 ~ +50',
    description: '동급생을 보호하거나 학교 내 위기 상황을 용기 있게 해결한 영예로운 행위에 부여됩니다.',
    examples: [
      ['신비한 동물 부상 간호 및 안전한 보호 조치', '+15 ~ +20점'],
      ['도서관 고서 복원 봉사 또는 후배 학업 지도', '+15 ~ +25점'],
      ['위험 상황에서 동료 구출 및 기사도적 희생', '+30 ~ +50점'],
    ],
  },
];

const deductionLevels = [
  ['가벼운 위반', '-5 ~ -10점', '복도 달리기, 수업 지각, 주방 무단 방문 및 간식 요구 등'],
  ['중대한 위반', '-15 ~ -25점', '야간 통금 위반(밤 10시 이후 복도 배회), 장난감 폭탄 폭발, 위험 마법 실험 등'],
  ['극심한 위반', '-30 ~ -50점', '금지된 숲 무단 진입, 도서관 제한구역 침입, 학생 간 비인가 불법 결투 등'],
];

export const ScoringGuideView: React.FC = () => (
  <GothicPage className="gp-rules-page">
    <PageHeading
      title="Rules of the Cup"
      lede={
        <>
          활동의 성격과 공헌도에 따라 점수를 수여하고,
          <br />
          교칙 위반은 사안에 맞게 감점합니다.
        </>
      }
    />

    <div className="gp-book">
      <nav className="gp-frame gp-contents" aria-label="점수 기준 목차">
        <h2>목차</h2>
        <ol>
          {awardSections.map(({ id, title, range }) => (
            <li key={id}>
              <a href={`#${id}`}>
                <span>{title}</span>
                <i aria-hidden="true" />
                <small>{range}</small>
              </a>
            </li>
          ))}
          <li className="is-deduction">
            <a href="#deductions">
              <span>교칙 위반 및 감점</span>
              <i aria-hidden="true" />
              <small>-5 ~ -50</small>
            </a>
          </li>
        </ol>
      </nav>

      <div className="gp-chapters">
        {awardSections.map(({ id, icon: Icon, title, range, description, examples }) => (
          <article className="gp-chapter" id={id} key={id}>
            <header className="gp-chapter-head">
              <span className="gp-lozenge" aria-hidden="true">
                <Icon strokeWidth={1.4} />
              </span>
              <h2>{title}</h2>
              <strong className="gp-chapter-range" lang="en">
                {range} <small>pts</small>
              </strong>
            </header>
            <p className="gp-chapter-desc">{description}</p>
            <ul className="gp-leaders">
              {examples.map(([activity, points]) => (
                <li key={activity}>
                  <span>{activity}</span>
                  <i aria-hidden="true" />
                  <strong>{points}</strong>
                </li>
              ))}
            </ul>
          </article>
        ))}

        <article className="gp-chapter is-deduction" id="deductions">
          <header className="gp-chapter-head">
            <span className="gp-lozenge" aria-hidden="true">
              <Skull strokeWidth={1.4} />
            </span>
            <h2>교칙 위반 및 감점</h2>
            <strong className="gp-chapter-range" lang="en">
              -5 ~ -50 <small>pts</small>
            </strong>
          </header>
          <p className="gp-chapter-desc">
            호그와트 마법학교의 평화와 안전을 위협하는 행위는 엄중한 감점과 함께 디텐션(벌칙)이 부과됩니다.
          </p>
          <ul className="gp-leaders">
            {deductionLevels.map(([level, points, examples]) => (
              <li key={level}>
                <span>
                  <b>{level}</b>
                  <small>{examples}</small>
                </span>
                <i aria-hidden="true" />
                <strong>{points}</strong>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  </GothicPage>
);
