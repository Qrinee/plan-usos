import { GeoLocation } from './types';

export interface PRZBuildingData {
  id: string;
  name: string;
  shortName: string;
  address: string;
  location: GeoLocation | null;
}

export const DEFAULT_PRZ_LOCATION: GeoLocation = { lat: 50.019044, long: 21.989185 };

// Verified GPS coordinates for PRz campus buildings (used as fallback when USOS API location is null)
export const KNOWN_PRZ_COORDS: Record<string, GeoLocation> = {
  A: { lat: 50.026866, long: 21.985322 },
  B: { lat: 50.026789, long: 21.984394 },
  C: { lat: 50.026322, long: 21.983800 },
  D: { lat: 50.025959, long: 21.983640 },
  E: { lat: 50.026381, long: 21.984667 },
  F: { lat: 50.026057, long: 21.983454 },
  G: { lat: 50.025985, long: 21.984167 },
  H: { lat: 50.019772, long: 21.985801 },
  J: { lat: 50.019638, long: 21.980477 },
  K: { lat: 50.019448, long: 21.985624 },
  L: { lat: 50.020120, long: 21.986850 },
  M: { lat: 50.017684, long: 21.979780 },
  O: { lat: 50.020553, long: 21.983440 },
  P: { lat: 50.019206, long: 21.981729 },
  S: { lat: 50.019336, long: 21.987342 },
  V: { lat: 50.019044, long: 21.989185 },
  W: { lat: 50.017077, long: 21.982176 },
  Z: { lat: 50.026100, long: 21.984000 },
};

export function getBuildingAddress(code: string): string {
  const upper = code.toUpperCase();
  if (['D', 'E', 'F', 'J', 'K', 'M', 'O', 'P', 'W'].includes(upper)) {
    return upper === 'O' ? 'ul. Poznańska 2a, 35-084 Rzeszów' : 'ul. Poznańska 2, 35-084 Rzeszów';
  }
  if (upper === 'H') return 'al. Powstańców Warszawy 6, 35-959 Rzeszów';
  if (upper === 'L') return 'al. Powstańców Warszawy 8, 35-959 Rzeszów';
  if (upper === 'S' || upper === 'Z') return 'al. Powstańców Warszawy 10, 35-959 Rzeszów';
  return 'al. Powstańców Warszawy 12, 35-959 Rzeszów';
}

export const KNOWN_PRZ_BUILDINGS: Record<string, PRZBuildingData> = Object.fromEntries(
  Object.entries(KNOWN_PRZ_COORDS).map(([code, location]) => [
    code,
    {
      id: code,
      name: `Budynek ${code}`,
      shortName: `Budynek ${code}`,
      address: getBuildingAddress(code),
      location,
    },
  ])
);

const przBuildingCache = new Map<string, PRZBuildingData>();

/**
 * Extracts standard single or multi-letter building code from building_id, room_number, or building_name
 * e.g. "V-18" -> "V", "s. V-18" -> "V", "L-28" -> "L", "Budynek V" -> "V", "101 (B)" -> "B"
 */
export function extractBuildingCode(
  buildingId?: string | null,
  buildingName?: any,
  roomNumber?: string | null
): string | null {
  if (buildingId) {
    const trimmed = String(buildingId).trim().toUpperCase();
    if (trimmed.length > 0 && trimmed.length <= 4) return trimmed;
  }

  const parseCode = (val: any): string | null => {
    if (!val) return null;
    const str = typeof val === 'object' ? val.pl || val.en || '' : String(val);
    const m =
      str.match(/\(([A-Z0-9]+)\)/i) ||
      str.match(/bud(?:ynek|\.)?\s*([A-Z0-9]+)/i) ||
      str.match(/^([A-Z0-9]+)\s*[-–]/i) ||
      str.match(/(?:^|[\s,;]|s\.|sala\s*)([A-Z])[-\s]?\d+/i) ||
      str.match(/\d+[-\s]?([A-Z])(?:\s|$)/i);
    return m ? m[1].toUpperCase() : null;
  };

  return parseCode(roomNumber) || parseCode(buildingName);
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

  const uniqueToFetch = Array.from(new Set(toFetch));

  if (uniqueToFetch.length > 0) {
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
              const nameObj = (bObj as any).name;
              const officialName =
                (typeof nameObj === 'object' ? nameObj?.pl || nameObj?.en : nameObj) ||
                `Budynek ${upperCode}`;

              const loc = (bObj as any).location;
              const validLoc: GeoLocation | null =
                loc && typeof loc.lat === 'number' && typeof loc.long === 'number'
                  ? { lat: loc.lat, long: loc.long }
                  : KNOWN_PRZ_COORDS[upperCode] || null;

              const bData: PRZBuildingData = {
                id: upperCode,
                name: officialName,
                shortName: `Budynek ${upperCode}`,
                address: getBuildingAddress(upperCode),
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
  }

  // Fallback for any codes not returned by API or failed
  for (const rawCode of buildingCodes) {
    if (!rawCode) continue;
    const code = rawCode.trim().toUpperCase();
    if (!result.has(code)) {
      const fallback: PRZBuildingData = {
        id: code,
        name: `Budynek ${code}`,
        shortName: `Budynek ${code}`,
        address: getBuildingAddress(code),
        location: KNOWN_PRZ_COORDS[code] || DEFAULT_PRZ_LOCATION,
      };
      przBuildingCache.set(code, fallback);
      result.set(code, fallback);
    }
  }

  return result;
}
