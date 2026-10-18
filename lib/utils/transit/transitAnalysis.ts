import { USOSActivity } from '@/lib/usos/types';
import { parseDate } from '@/lib/utils/date';
import { CampusBuildingInfo, PRZ_BUILDINGS, DISTANCE_MATRIX } from './campusBuildings';

export function extractBuildingCode(activity: USOSActivity): string {
  const room = (activity.room_number || '').trim().toUpperCase();
  const buildingName = (
    typeof activity.building_name === 'object'
      ? activity.building_name?.pl || ''
      : activity.building_name || ''
  ).toUpperCase();

  // Pattern like V-104, L-29, B-201, A-12
  const roomMatch = room.match(/^([A-Z]{1,2})[-\s]/);
  if (roomMatch && PRZ_BUILDINGS[roomMatch[1]]) {
    return roomMatch[1];
  }

  // Check building name for code e.g. "Budynek V", "Centrum Dydaktyczno-Konferencyjne V"
  for (const code of Object.keys(PRZ_BUILDINGS)) {
    const regex = new RegExp(`\\b(BUDYNEK|BUD\\.?|CENTRUM)?\\s*${code}\\b`, 'i');
    if (regex.test(buildingName)) {
      return code;
    }
  }

  if (roomMatch) {
    return roomMatch[1];
  }

  return 'V'; // Default to main PRz teaching center V
}

export interface TransitAnalysis {
  fromActivity: USOSActivity;
  toActivity: USOSActivity;
  fromBuildingCode: string;
  toBuildingCode: string;
  fromBuilding: CampusBuildingInfo;
  toBuilding: CampusBuildingInfo;
  fromRoom: string;
  toRoom: string;
  isSameBuilding: boolean;
  isSameRoom: boolean;
  distanceMeters: number;
  walkingMinutes: number;
  breakMinutes: number;
  marginMinutes: number;
  urgency: 'critical' | 'tight' | 'comfortable';
  note: string;
  googleMapsWalkUrl: string;
  appleMapsWalkUrl: string;
}

export function analyzeCampusTransit(
  currentAct: USOSActivity,
  nextAct: USOSActivity
): TransitAnalysis | null {
  if (!currentAct || !nextAct) return null;

  const currentEnd = parseDate(currentAct.end_time);
  const nextStart = parseDate(nextAct.start_time);

  // If different days or next starts before current ends, transit not applicable
  const breakMs = nextStart.getTime() - currentEnd.getTime();
  if (breakMs < 0 || breakMs > 1000 * 60 * 60 * 6) {
    return null;
  }

  const breakMinutes = Math.max(0, Math.round(breakMs / (1000 * 60)));

  const fromCode = extractBuildingCode(currentAct);
  const toCode = extractBuildingCode(nextAct);

  const fromBuilding = PRZ_BUILDINGS[fromCode] || {
    code: fromCode,
    name: `Budynek ${fromCode}`,
    fullName: `Budynek ${fromCode} PRz`,
    address: 'Politechnika Rzeszowska',
    lat: 50.016,
    lng: 21.986,
  };

  const toBuilding = PRZ_BUILDINGS[toCode] || {
    code: toCode,
    name: `Budynek ${toCode}`,
    fullName: `Budynek ${toCode} PRz`,
    address: 'Politechnika Rzeszowska',
    lat: 50.016,
    lng: 21.986,
  };

  const fromRoom = currentAct.room_number || 'sala niepodana';
  const toRoom = nextAct.room_number || 'sala niepodana';
  const isSameBuilding = fromCode === toCode;
  const isSameRoom = isSameBuilding && fromRoom !== 'sala niepodana' && fromRoom === toRoom;

  let distanceMeters = 0;
  let walkingMinutes = 2; // default within same building (stairs / elevator)

  if (isSameRoom) {
    distanceMeters = 0;
    walkingMinutes = 0;
  } else if (isSameBuilding) {
    distanceMeters = 40;
    walkingMinutes = 2; // change room in same building
  } else {
    // lookup matrix
    const matrixDist = DISTANCE_MATRIX[fromCode]?.[toCode] || DISTANCE_MATRIX[toCode]?.[fromCode];
    if (matrixDist) {
      distanceMeters = matrixDist;
    } else {
      distanceMeters = 400; // estimated fallback
    }

    // Walking speed ~4.5 km/h = 75 m/min + 1.5 min crossing buffer
    walkingMinutes = Math.max(3, Math.ceil(distanceMeters / 75) + 1);
  }

  const marginMinutes = breakMinutes - walkingMinutes;

  let urgency: 'critical' | 'tight' | 'comfortable' = 'comfortable';
  let note = '';

  if (isSameRoom) {
    urgency = 'comfortable';
    note = `Kolejne zajęcia w tej samej sali (${toRoom}). Nie musisz się przemieszczać.`;
  } else if (isSameBuilding) {
    urgency = 'comfortable';
    note = `Ten sam budynek (${fromBuilding.name}): zmiana sali z ${fromRoom} na ${toRoom} (~${walkingMinutes} min).`;
  } else {
    if (marginMinutes < 3) {
      urgency = 'critical';
      note = `⚠️ Bardzo mało czasu! Przejście ${fromBuilding.name} ➔ ${toBuilding.name} zajmie ~${walkingMinutes} min (przerwa: ${breakMinutes} min). Pośpiesz się!`;
    } else if (marginMinutes <= 7) {
      urgency = 'tight';
      note = `Przejście ${fromBuilding.name} ➔ ${toBuilding.name}: ${distanceMeters}m (~${walkingMinutes} min). Masz ${marginMinutes} min zapasu.`;
    } else {
      urgency = 'comfortable';
      note = `Spokojna przerwa (${breakMinutes} min). Spacer ${fromBuilding.name} ➔ ${toBuilding.name} zajmie ~${walkingMinutes} min (${distanceMeters}m).`;
    }
  }

  const originQuery = `${fromBuilding.name}, Politechnika Rzeszowska, Rzeszów`;
  const destQuery = `${toBuilding.name}, Politechnika Rzeszowska, Rzeszów`;

  const googleMapsWalkUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    originQuery
  )}&destination=${encodeURIComponent(destQuery)}&travelmode=walking`;

  const appleMapsWalkUrl = `https://maps.apple.com/?saddr=${encodeURIComponent(
    originQuery
  )}&daddr=${encodeURIComponent(destQuery)}&dirflg=w`;

  return {
    fromActivity: currentAct,
    toActivity: nextAct,
    fromBuildingCode: fromCode,
    toBuildingCode: toCode,
    fromBuilding,
    toBuilding,
    fromRoom,
    toRoom,
    isSameBuilding,
    isSameRoom,
    distanceMeters,
    walkingMinutes,
    breakMinutes,
    marginMinutes,
    urgency,
    note,
    googleMapsWalkUrl,
    appleMapsWalkUrl,
  };
}
