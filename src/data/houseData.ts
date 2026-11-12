import { HouseId, HouseInfo, PointCategory } from '../types';

import gryffindorImg from '../assets/images/gryffindor_crest_1791109899048.jpg';
import slytherinImg from '../assets/images/slytherin_crest_1791109913205.jpg';
import ravenclawImg from '../assets/images/ravenclaw_crest_1791109924411.jpg';
import hufflepuffImg from '../assets/images/hufflepuff_crest_1791109934885.jpg';

export const HOUSES: Record<HouseId, HouseInfo> = {
  gryffindor: {
    id: 'gryffindor',
    nameKo: '그리핀도르',
    nameEn: 'Gryffindor',
    animalKo: '사자',
    animalEn: 'Lion',
    crestImg: gryffindorImg,
    primaryColor: '#740001',
    secondaryColor: '#D3A625',
    borderColor: 'border-amber-600/40',
    accentColor: 'text-amber-400',
    gemName: '루비 (Rubies)',
    gemColorClass: 'from-red-600 to-rose-900',
    gemGlow: 'shadow-[0_0_20px_rgba(239,68,68,0.35)]',
    motto: '용기, 기사도 정신, 대담함',
    founder: '고드릭 그리핀도르',
    element: '불 (Fire)',
  },
  slytherin: {
    id: 'slytherin',
    nameKo: '슬리데린',
    nameEn: 'Slytherin',
    animalKo: '뱀',
    animalEn: 'Serpent',
    crestImg: slytherinImg,
    primaryColor: '#1A472A',
    secondaryColor: '#AAAAAA',
    borderColor: 'border-emerald-600/40',
    accentColor: 'text-emerald-400',
    gemName: '에메랄드 (Emeralds)',
    gemColorClass: 'from-emerald-600 to-teal-900',
    gemGlow: 'shadow-[0_0_20px_rgba(16,185,129,0.35)]',
    motto: '야망, 지략, 교활함, 긍지',
    founder: '살라자르 슬리데린',
    element: '물 (Water)',
  },
  ravenclaw: {
    id: 'ravenclaw',
    nameKo: '래번클로',
    nameEn: 'Ravenclaw',
    animalKo: '독수리',
    animalEn: 'Eagle',
    crestImg: ravenclawImg,
    primaryColor: '#0E1A40',
    secondaryColor: '#946B2D',
    borderColor: 'border-sky-600/40',
    accentColor: 'text-sky-400',
    gemName: '사파이어 (Sapphires)',
    gemColorClass: 'from-blue-600 to-indigo-950',
    gemGlow: 'shadow-[0_0_20px_rgba(59,130,246,0.35)]',
    motto: '지혜, 총명함, 독창성, 학구열',
    founder: '로웨나 래번클로',
    element: '공기 (Air)',
  },
  hufflepuff: {
    id: 'hufflepuff',
    nameKo: '후플푸프',
    nameEn: 'Hufflepuff',
    animalKo: '오소리',
    animalEn: 'Badger',
    crestImg: hufflepuffImg,
    primaryColor: '#ECB939',
    secondaryColor: '#000000',
    borderColor: 'border-yellow-600/40',
    accentColor: 'text-yellow-400',
    gemName: '토파즈 / 다이아몬드 (Topaz)',
    gemColorClass: 'from-amber-400 to-yellow-700',
    gemGlow: 'shadow-[0_0_20px_rgba(245,158,11,0.35)]',
    motto: '근면, 정직, 인내, 충성심',
    founder: '헬가 후플푸프',
    element: '땅 (Earth)',
  },
};

export const HOUSE_ORDER: HouseId[] = ['gryffindor', 'slytherin', 'ravenclaw', 'hufflepuff'];

export const CATEGORY_LABELS: Record<PointCategory, { label: string; description: string }> = {
  class: { label: '마법 수업 & 과제', description: '수업 참여, 정답 답변, 뛰어난 실습 과제' },
  quidditch: { label: '퀴디치 경기 & 훈련', description: '골든 스니치 포획, 득점, 팀 훈련 공헌' },
  duel: { label: '결투 클럽 & 마법 대련', description: '공식 마법 결투 승리, 신사적인 대련' },
  event: { label: '이벤트 & 연회', description: '크리스마스 무도회, 기숙사 축제, 할로윈' },
  exploration: { label: '모험 & 비밀 탐색', description: '호그와트 미스터리 해결, 비밀 공간 탐사' },
  exemplary: { label: '모범 행동 & 기여', description: '동급생 조력, 기숙사 단합, 도서관 봉사' },
  violation: { label: '교칙 위반 & 감점', description: '야간 통금 위반, 제한구역 침입, 복도 결투' },
  other: { label: '기타 활동', description: '기타 자캐 커뮤니티 자유 로그 및 특별 승인' },
};

export const DEFAULT_AUTHORITIES = [
  '알버스 덤블도어 교장',
  '미네르바 맥고나걸 교수',
  '세베루스 스네이프 교수',
  '필리우스 플리트윅 교수',
  '포모나 스프라우트 교수',
  '루비우스 해그리드 사냥터지기',
  '아르고스 필치 관리인',
  '기숙사 반장단 (Prefects)',
  '학생회장 (Head Boy/Girl)',
];

/**
 * 기본 대회 종료 시각. 관리자 페이지(/admin › 대회 일정)에서 바꾸면 그 값이 우선합니다.
 */
export const CUP_END_DATE = '2026-12-03T00:00:00+09:00';
