import { USOSActivity } from '@/lib/usos/types';
import { parseDate } from '@/lib/utils/date';

export interface CampusBuildingInfo {
  code: string;
  name: string;
  fullName: string;
  address: string;
  lat: number;
  lng: number;
}

export const PRZ_BUILDINGS: Record<string, CampusBuildingInfo> = {
  V: {
    code: 'V',
    name: 'Budynek V',
    fullName: 'Centrum Dydaktyczno-Konferencyjne (WEiI)',
    address: 'al. Powstańców Warszawy 12, Rzeszów',
    lat: 50.019044,
    lng: 21.989185,
  },
  L: {
    code: 'L',
    name: 'Budynek L',
    fullName: 'Wydział Budowy Maszyn i Lotnictwa',
    address: 'al. Powstańców Warszawy 8 / ul. W. Pola, Rzeszów',
    lat: 50.0215,
    lng: 21.9922,
  },
  Ł: {
    code: 'Ł',
    name: 'Budynek Ł',
    fullName: 'Centrum Sportu Akademickiego',
    address: 'ul. Mazowiecka 4d, Rzeszów',
    lat: 50.018317,
    lng: 21.980238,
  },
  A: {
    code: 'A',
    name: 'Budynek A',
    fullName: 'Gmach Główny Politechniki Rzeszowskiej (Rektorat)',
    address: 'al. Powstańców Warszawy 12, Rzeszów',
    lat: 50.02687,
    lng: 21.98532,
  },
  B: {
    code: 'B',
    name: 'Budynek B',
    fullName: 'Wydział Elektrotechniki i Informatyki',
    address: 'al. Powstańców Warszawy 12, Rzeszów',
    lat: 50.0168,
    lng: 21.9862,
  },
  C: {
    code: 'C',
    name: 'Budynek C',
    fullName: 'Wydział Chemiczny',
    address: 'al. Powstańców Warszawy 6, Rzeszów',
    lat: 50.0175,
    lng: 21.9875,
  },
  D: {
    code: 'D',
    name: 'Budynek D',
    fullName: 'Wydział Chemiczny / Elektrotechnika',
    address: 'al. Powstańców Warszawy 6, Rzeszów',
    lat: 50.02596,
    lng: 21.98364,
  },
  P: {
    code: 'P',
    name: 'Budynek P',
    fullName: 'Wydział Zarządzania',
    address: 'al. Powstańców Warszawy 10, Rzeszów',
    lat: 50.0158,
    lng: 21.9885,
  },
  S: {
    code: 'S',
    name: 'Budynek S',
    fullName: 'Centrum Sportu Akademickiego (Hala)',
    address: 'ul. Poznańska 2a, Rzeszów',
    lat: 50.019336,
    lng: 21.987342,
  },
  O: {
    code: 'O',
    name: 'Budynek O',
    fullName: 'Ośrodek Sportu i Rekreacji',
    address: 'ul. Poznańska, Rzeszów',
    lat: 50.0135,
    lng: 21.9825,
  },
  K: {
    code: 'K',
    name: 'Budynek K',
    fullName: 'Katedra Inżynierii Lotniczej i Kosmicznej',
    address: 'ul. Poznańska, Rzeszów',
    lat: 50.0148,
    lng: 21.9832,
  },
  F: {
    code: 'F',
    name: 'Budynek F',
    fullName: 'Wydział Elektrotechniki i Informatyki',
    address: 'ul. B. Prusa 12, Rzeszów',
    lat: 50.02606,
    lng: 21.98345,
  },
};

const DISTANCE_MATRIX: Record<string, Record<string, number>> = {
  V: { L: 850, A: 280, B: 340, C: 420, D: 490, P: 250, S: 720, O: 790, K: 680 },
  L: { V: 850, A: 820, B: 760, C: 690, D: 620, P: 890, S: 1350, O: 1420, K: 1280 },
  A: { V: 280, L: 820, B: 90, C: 180, D: 260, P: 210, S: 520, O: 590, K: 480 },
  B: { V: 340, L: 760, A: 90, C: 120, D: 200, P: 180, S: 580, O: 650, K: 540 },
  C: { V: 420, L: 690, A: 180, B: 120, D: 110, P: 260, S: 670, O: 740, K: 630 },
  D: { V: 490, L: 620, A: 260, B: 200, C: 110, P: 320, S: 750, O: 820, K: 710 },
  P: { V: 250, L: 890, A: 210, B: 180, C: 260, D: 320, S: 650, O: 720, K: 610 },
  S: { V: 720, L: 1350, A: 520, B: 580, C: 670, D: 750, P: 650, O: 110, K: 160 },
};

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
