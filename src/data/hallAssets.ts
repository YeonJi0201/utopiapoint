import { HouseId } from '../types';

import bannerGryffindor from '../assets/hall/banner-gryffindor.webp';
import bannerSlytherin from '../assets/hall/banner-slytherin.webp';
import bannerRavenclaw from '../assets/hall/banner-ravenclaw.webp';
import bannerHufflepuff from '../assets/hall/banner-hufflepuff.webp';
import miniGryffindor from '../assets/hall/mini-gryffindor.webp';
import miniSlytherin from '../assets/hall/mini-slytherin.webp';
import miniRavenclaw from '../assets/hall/mini-ravenclaw.webp';
import miniHufflepuff from '../assets/hall/mini-hufflepuff.webp';

/** Embroidered house banners lifted from the Great Hall plate. */
export const BANNER_IMG: Record<HouseId, string> = {
  gryffindor: bannerGryffindor,
  slytherin: bannerSlytherin,
  ravenclaw: bannerRavenclaw,
  hufflepuff: bannerHufflepuff,
};

/** Small shield crests used beside names and in house filters. */
export const MINI_CREST: Record<HouseId, string> = {
  gryffindor: miniGryffindor,
  slytherin: miniSlytherin,
  ravenclaw: miniRavenclaw,
  hufflepuff: miniHufflepuff,
};
