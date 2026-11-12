export type HouseId = 'gryffindor' | 'slytherin' | 'ravenclaw' | 'hufflepuff';

export type PointCategory =
  | 'class'       // 마법 수업 & 과제
  | 'quidditch'   // 퀴디치 경기 & 훈련
  | 'duel'        // 결투 클럽 & 마법 대련
  | 'event'       // 호그와트 축제 & 연회
  | 'exploration' // 모험 & 비밀 통로 탐색
  | 'exemplary'   // 모범 행위 & 기숙사 공헌
  | 'violation'   // 교칙 위반 & 감점
  | 'other';      // 기타 활동

export interface HouseInfo {
  id: HouseId;
  nameKo: string;
  nameEn: string;
  animalKo: string;
  animalEn: string;
  crestImg: string;
  primaryColor: string;
  secondaryColor: string;
  borderColor: string;
  accentColor: string;
  gemName: string;
  gemColorClass: string;
  gemGlow: string;
  motto: string;
  founder: string;
  element: string;
}

export interface PointRecord {
  id: string;
  houseId: HouseId;
  characterName: string;       // 자캐 이름
  characterGrade: number;      // 1 ~ 7학년
  activity: string;            // 활동 사유 및 내용
  points: number;              // 부여 점수 (+ or -)
  category: PointCategory;     // 카테고리
  awardedBy: string;           // 수여자 (교수/반장)
  timestamp: string;           // ISO 일시
  notes?: string;              // 세부 비고
}

export type TabType = 'overview' | 'details' | 'ranking' | 'guide';
