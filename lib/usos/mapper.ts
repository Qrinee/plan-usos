import { ClassType, USOSActivity, USOSLecturer } from '@/lib/usos/types';
import { extractBuildingCode, PRZBuildingData } from '@/lib/usos/geo';
import { USOSLecturerInfo } from './lecturers';

export function assignCategoryAndColor(item: any): { category: ClassType; color: string } {
  const typeStr = (
    typeof item.classtype_name === 'object'
      ? item.classtype_name?.pl || ''
      : item.classtype_name || ''
  ).toLowerCase();

  const nameStr = (
    typeof item.name === 'object'
      ? item.name?.pl || ''
      : item.name || ''
  ).toLowerCase();

  if (typeStr.includes('wyk') || nameStr.includes('wykład')) {
    return { category: 'wykład', color: '#3b82f6' };
  }
  if (typeStr.includes('lab') || nameStr.includes('laboratorium')) {
    return { category: 'laboratorium', color: '#8b5cf6' };
  }
  if (typeStr.includes('ćwi') || typeStr.includes('cwi') || nameStr.includes('ćwiczenia')) {
    return { category: 'ćwiczenia', color: '#10b981' };
  }
  if (typeStr.includes('proj') || nameStr.includes('projekt')) {
    return { category: 'projekt', color: '#f59e0b' };
  }
  if (typeStr.includes('sem') || nameStr.includes('seminarium')) {
    return { category: 'seminarium', color: '#ec4899' };
  }
  if (typeStr.includes('lek') || nameStr.includes('angielski') || nameStr.includes('lektorat')) {
    return { category: 'lektorat', color: '#06b6d4' };
  }

  return { category: 'inne', color: '#64748b' };
}

export function normalizeDateStr(d: string): string {
  if (!d) return '';
  return d.includes('T') ? d : d.replace(' ', 'T');
}

export function mapRawActivity(
  act: any,
  index: number,
  lecturerMap?: Map<string, USOSLecturerInfo>,
  buildingMap?: Map<string, PRZBuildingData>
): USOSActivity {
  const { category, color } = assignCategoryAndColor(act);

  const rawBuildingName =
    typeof act.building_name === 'object'
      ? act.building_name?.pl || act.building_name?.en
      : act.building_name;
  const buildingCode = extractBuildingCode(act.building_id, rawBuildingName, act.room_number);
  const buildingInfo = buildingCode ? buildingMap?.get(buildingCode) : undefined;

  const resolvedBuildingName =
    buildingInfo?.name ||
    act.building_name ||
    (buildingCode ? `Budynek ${buildingCode}` : 'Politechnika Rzeszowska');

  const resolvedBuildingAddress = buildingInfo?.address;
  const resolvedBuildingLocation = buildingInfo?.location;

  const activityLecturers: USOSLecturer[] = [];
  const activityLecturerNames: string[] = [];

  const candidateIds = [
    ...(Array.isArray(act.lecturer_ids) ? act.lecturer_ids : []),
    ...(Array.isArray(act.lecturers) ? act.lecturers.map((l: any) => l?.id) : []),
  ].filter(Boolean);

  const seenLecIds = new Set<string>();
  for (const cid of candidateIds) {
    const idStr = String(cid);
    if (!seenLecIds.has(idStr)) {
      seenLecIds.add(idStr);
      const resolved = lecturerMap?.get(idStr);
      if (resolved) {
        activityLecturers.push(resolved);
        activityLecturerNames.push(resolved.formatted_name);
      }
    }
  }

  // Fallback to basic act.lecturers if lecturerMap didn't have titles
  if (activityLecturerNames.length === 0 && Array.isArray(act.lecturers) && act.lecturers.length > 0) {
    for (const l of act.lecturers) {
      const basicName = `${l.first_name || ''} ${l.last_name || ''}`.trim();
      if (basicName) {
        activityLecturerNames.push(basicName);
        activityLecturers.push({
          id: l.id || '',
          first_name: l.first_name || '',
          last_name: l.last_name || '',
          formatted_name: basicName,
        });
      }
    }
  }

  return {
    id: act.id || `live-act-${index}-${act.course_id || 'course'}`,
    type: act.type || 'classgroup',
    start_time: normalizeDateStr(act.start_time),
    end_time: normalizeDateStr(act.end_time),
    name: act.name || 'Zajęcia',
    course_name: act.course_name || act.name || 'Przedmiot',
    course_id: act.course_id,
    classtype_name: act.classtype_name || act.classtype || category,
    room_number: act.room_number,
    room_id: act.room_id,
    building_id: act.building_id || buildingCode || undefined,
    building_name: resolvedBuildingName,
    building_address: resolvedBuildingAddress,
    building_location: resolvedBuildingLocation,
    lecturer_ids: act.lecturer_ids,
    lecturer_names: activityLecturerNames.length > 0 ? activityLecturerNames : undefined,
    lecturers: activityLecturers.length > 0 ? activityLecturers : undefined,
    group_number: act.group_number,
    category,
    color,
  };
}
