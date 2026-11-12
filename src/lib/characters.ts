/**
 * The community's characters, read live from the character archive site
 * (Once Upon a time... 캐릭터 도감). Used by the admin page to pick a name and
 * fill in house and grade. Read-only; nothing is copied into our database.
 *
 * The archive allows other sites to read this list (its vercel.json sends
 * Access-Control-Allow-Origin for /api/characters), so we fetch it directly.
 */
import type { HouseId } from '../types';

export interface CommunityCharacter {
  id: string;
  nameKo: string;
  nameEn: string;
  house: HouseId | null;
  /** 1–7, or null when the archive has none */
  year: number | null;
  thumbnail: string | null;
}

export const CHARACTERS_API_URL =
  (import.meta.env.VITE_CHARACTERS_API_URL as string | undefined) || 'https://my-website-seven-eta-82.vercel.app/api/characters';

const HOUSES: HouseId[] = ['gryffindor', 'slytherin', 'ravenclaw', 'hufflepuff'];
const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * The archive's server sometimes answers 5xx for a moment (waking up after a
 * quiet spell), so a server error is tried again twice before giving up.
 */
async function fetchWithRetry(): Promise<Response> {
  const delays = [800, 2000];
  for (let attempt = 0; ; attempt++) {
    let res: Response;
    try {
      res = await fetch(CHARACTERS_API_URL);
    } catch {
      if (attempt < delays.length) {
        await wait(delays[attempt]);
        continue;
      }
      // a CORS refusal looks exactly like a network failure from here
      throw new Error('캐릭터 도감에 연결하지 못했습니다. 인터넷 연결과 도감 사이트의 접근 허용 설정을 확인해 주세요.');
    }
    if (res.status >= 500 && attempt < delays.length) {
      await wait(delays[attempt]);
      continue;
    }
    return res;
  }
}

export async function fetchCommunityCharacters(): Promise<CommunityCharacter[]> {
  const res = await fetchWithRetry();
  if (!res.ok) {
    throw new Error(
      res.status >= 500
        ? `캐릭터 도감 서버가 잠시 응답하지 않습니다 (HTTP ${res.status}). 잠시 후 "목록 새로고침"을 눌러 주세요.`
        : `캐릭터 도감이 응답하지 않았습니다 (HTTP ${res.status}).`,
    );
  }
  if (!(res.headers.get('content-type') ?? '').includes('json')) {
    throw new Error('캐릭터 도감 주소가 목록 대신 다른 페이지를 돌려줬습니다. VITE_CHARACTERS_API_URL을 확인해 주세요.');
  }
  const data: unknown = await res.json();
  const list = Array.isArray(data) ? data : [];
  return list
    .map((raw): CommunityCharacter | null => {
      if (!raw || typeof raw !== 'object') return null;
      const c = raw as Record<string, unknown>;
      const nameKo = str(c.nameKo) || str(c.nameEn);
      if (!nameKo) return null;
      const house = HOUSES.includes(c.house as HouseId) ? (c.house as HouseId) : null;
      const year = typeof c.year === 'number' && c.year >= 1 && c.year <= 7 ? c.year : null;
      return {
        id: str(c.id) || nameKo,
        nameKo,
        nameEn: str(c.nameEn),
        house,
        year,
        thumbnail: str(c.imageThumbnail) || str(c.image) || null,
      };
    })
    .filter((c): c is CommunityCharacter => c !== null)
    .sort((a, b) => a.nameKo.localeCompare(b.nameKo, 'ko'));
}
