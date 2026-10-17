import { GeoLocation } from './types';

export interface PRZBuildingData {
  id: string;
  name: string;
  shortName: string;
  address: string;
  location: GeoLocation | null;
}

// Complete map of known buildings on Politechnika Rzeszowska campus
// Locations verified against USOS API services/geo/buildings2 and official PRz campus plans
export const KNOWN_PRZ_BUILDINGS: Record<string, PRZBuildingData> = {
  A: {
    id: 'A',
    name: 'Budynek A – Wydział Elektrotechniki i Informatyki',
    shortName: 'Budynek A',
    address: 'al. Powstańców Warszawy 12, 35-959 Rzeszów',
    location: { lat: 50.026866, long: 21.985322 },
  },
  B: {
    id: 'B',
    name: 'Budynek B – Wydział Elektrotechniki i Informatyki',
    shortName: 'Budynek B',
    address: 'al. Powstańców Warszawy 12, 35-959 Rzeszów',
    location: { lat: 50.026789, long: 21.984394 },
  },
  C: {
    id: 'C',
    name: 'Budynek C – Wydział Budowy Maszyn i Lotnictwa',
    shortName: 'Budynek C',
    address: 'al. Powstańców Warszawy 12, 35-959 Rzeszów',
    location: { lat: 50.026322, long: 21.983800 },
  },
  D: {
    id: 'D',
    name: 'Budynek D – Wydział Elektrotechniki i Informatyki',
    shortName: 'Budynek D',
    address: 'ul. Poznańska 2, 35-084 Rzeszów',
    location: { lat: 50.025959, long: 21.983640 },
  },
  E: {
    id: 'E',
    name: 'Budynek E – Wydział Elektrotechniki i Informatyki / WBMiL',
    shortName: 'Budynek E',
    address: 'ul. Poznańska 2, 35-084 Rzeszów',
    location: { lat: 50.026381, long: 21.984667 },
  },
  F: {
    id: 'F',
    name: 'Budynek F – Wydział Elektrotechniki i Informatyki',
    shortName: 'Budynek F',
    address: 'ul. Poznańska 2, 35-084 Rzeszów',
    location: { lat: 50.026057, long: 21.983454 },
  },
  G: {
    id: 'G',
    name: 'Budynek G – Wydział Budowy Maszyn i Lotnictwa',
    shortName: 'Budynek G',
    address: 'al. Powstańców Warszawy 12, 35-959 Rzeszów',
    location: { lat: 50.025985, long: 21.984167 },
  },
  H: {
    id: 'H',
    name: 'Budynek H – Wydział Chemiczny',
    shortName: 'Budynek H',
    address: 'al. Powstańców Warszawy 6, 35-959 Rzeszów',
    location: { lat: 50.019772, long: 21.985801 },
  },
  J: {
    id: 'J',
    name: 'Budynek J – Studium Języków Obcych',
    shortName: 'Budynek J',
    address: 'ul. Poznańska 2, 35-084 Rzeszów',
    location: { lat: 50.019638, long: 21.980477 },
  },
  K: {
    id: 'K',
    name: 'Budynek K – Wydział Budownictwa, Inżynierii Środowiska i Architektury',
    shortName: 'Budynek K',
    address: 'ul. Poznańska 2, 35-084 Rzeszów',
    location: { lat: 50.019448, long: 21.985624 },
  },
  L: {
    id: 'L',
    name: 'Budynek L – Wydział Budowy Maszyn i Lotnictwa',
    shortName: 'Budynek L',
    address: 'al. Powstańców Warszawy 8, 35-959 Rzeszów',
    location: { lat: 50.020120, long: 21.986850 },
  },
  M: {
    id: 'M',
    name: 'Budynek M – Główna Stacja Rozdzielcza',
    shortName: 'Budynek M',
    address: 'ul. Poznańska 2, 35-084 Rzeszów',
    location: { lat: 50.017684, long: 21.979780 },
  },
  O: {
    id: 'O',
    name: 'Budynek O – Centrum Sportu Akademickiego / Stołówka',
    shortName: 'Budynek O',
    address: 'ul. Poznańska 2a, 35-084 Rzeszów',
    location: { lat: 50.020553, long: 21.983440 },
  },
  P: {
    id: 'P',
    name: 'Budynek P – Wydział Budownictwa, Inżynierii Środowiska i Architektury',
    shortName: 'Budynek P',
    address: 'ul. Poznańska 2, 35-084 Rzeszów',
    location: { lat: 50.019206, long: 21.981729 },
  },
  S: {
    id: 'S',
    name: 'Budynek S – Zespół Sal Wykładowych',
    shortName: 'Budynek S',
    address: 'al. Powstańców Warszawy 10, 35-959 Rzeszów',
    location: { lat: 50.019336, long: 21.987342 },
  },
  V: {
    id: 'V',
    name: 'Budynek V – Regionalne Centrum Dydaktyczno-Konferencyjne i Biblioteczno-Administracyjne',
    shortName: 'Budynek V',
    address: 'al. Powstańców Warszawy 12, 35-959 Rzeszów',
    location: { lat: 50.019044, long: 21.989185 },
  },
  W: {
    id: 'W',
    name: 'Budynek W – Zespół Laboratoriów WBIŚiA',
    shortName: 'Budynek W',
    address: 'ul. Poznańska 2, 35-084 Rzeszów',
    location: { lat: 50.017077, long: 21.982176 },
  },
  Z: {
    id: 'Z',
    name: 'Budynek Z – Wydział Zarządzania',
    shortName: 'Budynek Z',
    address: 'al. Powstańców Warszawy 10, 35-959 Rzeszów',
    location: { lat: 50.026100, long: 21.984000 },
  },
};

const przBuildingCache = new Map<string, PRZBuildingData>();

// Initialize cache with known buildings
for (const [code, bData] of Object.entries(KNOWN_PRZ_BUILDINGS)) {
  przBuildingCache.set(code.toUpperCase(), bData);
}

/**
 * Extracts standard single or multi-letter building code from building_id, room_number, or building_name
 * e.g. "V-18" -> "V", "L-28" -> "L", "Budynek V" -> "V", "P-01" -> "P"
 */
export function extractBuildingCode(
  buildingId?: string | null,
  buildingName?: string | null,
  roomNumber?: string | null
): string | null {
  if (buildingId) {
    const trimmed = buildingId.trim().toUpperCase();
    if (trimmed.length > 0 && trimmed.length <= 4) {
      return trimmed;
    }
  }

  if (roomNumber) {
    const match = roomNumber.trim().match(/^([A-Za-z]+)[-\s]?\d*/);
    if (match && match[1]) {
      const code = match[1].toUpperCase();
      if (KNOWN_PRZ_BUILDINGS[code] || code.length <= 3) {
        return code;
      }
    }
  }

  if (buildingName) {
    const match = buildingName.match(/budynek\s+([A-Za-z0-9]+)/i);
    if (match && match[1]) {
      return match[1].toUpperCase();
    }
  }

  return null;
}

/**
 * Fetches and resolves building geo data from PRz USOS API services/geo/buildings2
 */
export async function resolvePRZBuildings(
  buildingCodes: (string | null | undefined)[]
): Promise<Map<string, PRZBuildingData>> {
  const result = new Map<string, PRZBuildingData>();
  const toFetch: string[] = [];

  for (const rawCode of buildingCodes) {
    if (!rawCode) continue;
    const code = rawCode.trim().toUpperCase();
    if (!code) continue;

    if (przBuildingCache.has(code)) {
      result.set(code, przBuildingCache.get(code)!);
    } else {
      toFetch.push(code);
    }
  }

  if (toFetch.length === 0) {
    return result;
  }

  const uniqueToFetch = Array.from(new Set(toFetch));

  try {
    const url = `https://usosapps.prz.edu.pl/services/geo/buildings2?building_ids=${encodeURIComponent(
      uniqueToFetch.join('|')
    )}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        for (const [code, bObj] of Object.entries(data)) {
          const upperCode = code.toUpperCase();
          if (bObj && typeof bObj === 'object') {
            const known = KNOWN_PRZ_BUILDINGS[upperCode];
            const nameObj = (bObj as any).name;
            const officialName =
              (typeof nameObj === 'object' ? nameObj?.pl || nameObj?.en : nameObj) ||
              known?.name ||
              `Budynek ${upperCode}`;

            const loc = (bObj as any).location;
            const validLoc: GeoLocation | null =
              loc && typeof loc.lat === 'number' && typeof loc.long === 'number'
                ? { lat: loc.lat, long: loc.long }
                : known?.location || null;

            const bData: PRZBuildingData = {
              id: upperCode,
              name: officialName,
              shortName: known?.shortName || `Budynek ${upperCode}`,
              address: known?.address || 'al. Powstańców Warszawy 12, 35-959 Rzeszów',
              location: validLoc,
            };

            przBuildingCache.set(upperCode, bData);
            result.set(upperCode, bData);
          }
        }
      }
    }
  } catch (err) {
    console.warn('Failed to fetch geo buildings from USOS API:', err);
  }

  // Fallback for any requested codes that were not returned by API
  for (const code of uniqueToFetch) {
    if (!result.has(code)) {
      const known = KNOWN_PRZ_BUILDINGS[code];
      if (known) {
        result.set(code, known);
      } else {
        const fallback: PRZBuildingData = {
          id: code,
          name: `Budynek ${code}`,
          shortName: `Budynek ${code}`,
          address: 'al. Powstańców Warszawy 12, 35-959 Rzeszów',
          location: { lat: 50.019044, long: 21.989185 }, // Main PRz campus
        };
        przBuildingCache.set(code, fallback);
        result.set(code, fallback);
      }
    }
  }

  return result;
}
