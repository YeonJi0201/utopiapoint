-- Sample records (the same 20 the site started with). Optional: run after schema.sql.
-- Safe to re-run: existing ids are left alone.
insert into public.point_records
  (id, house_id, character_name, character_grade, activity, points, category, awarded_by, notes, created_at)
values
  ('rec-gryffindor-1', 'gryffindor', '레오 몽고메리', 5, '어둠의 마법 방어술 대련에서 실체형 패트로누스(은빛 수사슴) 성공적 소환', 30, 'duel', '미네르바 맥고나걸 교수', '전체 학년 중 최단 시간 실체화 달성', '2026-10-03T16:40:00Z'),
  ('rec-gryffindor-2', 'gryffindor', '이소벨 윈체스터', 4, '슬리데린과의 퀴디치 경기에서 급강하하며 골든 스니치 포획 극적 성공', 50, 'quidditch', '미네르바 맥고나걸 교수', '경기 140분 만의 결정적 역전 승리', '2026-10-02T18:20:00Z'),
  ('rec-gryffindor-3', 'gryffindor', '카엘 바실리', 2, '야간 통금 시간 이후 5층 복도에서 도깨비 폭탄 터뜨리다 순찰에 적발', -15, 'violation', '아르고스 필치 관리인', '일주일간 트로피 진열실 청소 벌칙 병과', '2026-10-01T23:15:00Z'),
  ('rec-gryffindor-4', 'gryffindor', '아서 펜드래곤', 6, '변신술 심화 실습에서 책상을 거대한 은빛 사자로 완벽 변형 및 원상복구', 20, 'class', '미네르바 맥고나걸 교수', null, '2026-09-29T14:30:00Z'),
  ('rec-gryffindor-5', 'gryffindor', '아멜리아 로즈', 3, '비밀 통로 붕괴 위기에서 후배 저학년 학생 3명을 안전하게 대피 유도', 35, 'exemplary', '알버스 덤블도어 교장', '탁월한 위기 대처와 기사도 정신 표창', '2026-09-27T11:00:00Z'),
  ('rec-slytherin-1', 'slytherin', '빅토리아 블랙우드', 6, '고난도 마법약 "살아있는 죽음의 약" 한 방울의 오차도 없이 완벽 조제', 30, 'class', '세베루스 스네이프 교수', '교과서 오류를 스스로 교정하여 은빛 증기 발생', '2026-10-04T02:10:00Z'),
  ('rec-slytherin-2', 'slytherin', '데미안 말로이', 5, '결투 클럽 공식 대전에서 무언 마법(Non-verbal Spell)으로 래번클로 대표 제압', 25, 'duel', '세베루스 스네이프 교수', null, '2026-10-03T19:00:00Z'),
  ('rec-slytherin-3', 'slytherin', '엘리시아 보르진', 3, '금지된 숲 경계 구역에서 맹독성 아코나이트 무단 채취 시도 적발', -10, 'violation', '루비우스 해그리드 사냥터지기', null, '2026-10-01T21:40:00Z'),
  ('rec-slytherin-4', 'slytherin', '세바스찬 로시에', 7, '기숙사 후배들의 O.W.L. 마법약 및 어둠의 마법 방어술 스터디 전담 지도', 25, 'exemplary', '기숙사 반장단 (Prefects)', null, '2026-09-30T17:15:00Z'),
  ('rec-slytherin-5', 'slytherin', '녹턴 에버그린', 4, '후플푸프와의 퀴디치 경기에서 몰이꾼으로서 상대 수색꾼 완벽 블록 4회 기록', 35, 'quidditch', '세베루스 스네이프 교수', null, '2026-09-28T16:00:00Z'),
  ('rec-ravenclaw-1', 'ravenclaw', '알리스테어 팽', 4, '고대 룬 문자 경시대회에서 14세기 고대 봉인 마법 해독문 복원 성공', 35, 'class', '필리우스 플리트윅 교수', '호그와트 도서관 학술 아카이브 영구 등재', '2026-10-03T14:20:00Z'),
  ('rec-ravenclaw-2', 'ravenclaw', '클로에 헤이븐', 3, '도서관 제한구역 마법 서적 보수 자원봉사 및 마법 목록화 작업 20시간 완수', 20, 'exemplary', '필리우스 플리트윅 교수', null, '2026-10-02T11:50:00Z'),
  ('rec-ravenclaw-3', 'ravenclaw', '줄리안 반스', 5, '천문학 타워에서 야간 관측 중 고정밀 황동 망원경 조작 부주의로 렌즈 파손', -15, 'violation', '아르고스 필치 관리인', null, '2026-09-30T22:30:00Z'),
  ('rec-ravenclaw-4', 'ravenclaw', '셀린 에델바이스', 6, '마법의 역사 토론회에서 1692년 국제 비밀 법령 제정의 의의 명쾌하게 논증', 25, 'class', '필리우스 플리트윅 교수', null, '2026-09-28T15:00:00Z'),
  ('rec-ravenclaw-5', 'ravenclaw', '아이작 핀치', 4, '그리핀도르와의 퀴디치 경기에서 추적수로서 90야드 장거리 골 3연속 성공', 30, 'quidditch', '학생회장 (Head Boy/Girl)', null, '2026-09-26T17:30:00Z'),
  ('rec-hufflepuff-1', 'hufflepuff', '에밀리 호손', 4, '온실 제3구역 성체 맨드레이크 분갈이 작업에서 반원 전원 안전하게 통솔', 30, 'class', '포모나 스프라우트 교수', '단 한 명의 부상자 없이 온실 정비 완료', '2026-10-03T11:00:00Z'),
  ('rec-hufflepuff-2', 'hufflepuff', '노아 브라운', 3, '신비한 동물 돌보기 수업 중 흥분한 히포그리프를 온화한 태도로 진정시킴', 25, 'exploration', '루비우스 해그리드 사냥터지기', null, '2026-10-02T15:40:00Z'),
  ('rec-hufflepuff-3', 'hufflepuff', '필립 워커', 2, '통금 시간 직후 주방 배회 및 집요정에게 버터맥주 요구하다 적발', -10, 'violation', '아르고스 필치 관리인', null, '2026-10-01T22:50:00Z'),
  ('rec-hufflepuff-4', 'hufflepuff', '로즈마리 벨', 5, '호그와트 가을 추수 수확 연회 장식 및 허브 화분 100개 기숙사별 배포 총괄', 25, 'event', '포모나 스프라우트 교수', null, '2026-09-29T13:20:00Z'),
  ('rec-hufflepuff-5', 'hufflepuff', '테오도르 크레인', 5, '래번클로와의 퀴디치 경기에서 파수꾼으로 상대 슛 8개 선방 철벽 방어', 30, 'quidditch', '기숙사 반장단 (Prefects)', null, '2026-09-27T16:50:00Z')
on conflict (id) do nothing;
