'use client';

import React from 'react';
import { MapPin, Building2, ExternalLink, Navigation, Compass } from 'lucide-react';
import { USOSActivity } from '@/lib/usos/types';
import { extractBuildingCode, KNOWN_PRZ_BUILDINGS } from '@/lib/usos/geo';

interface ClassDetailLocationProps {
  activity: USOSActivity;
  isAppleDevice: boolean;
}

export const ClassDetailLocation: React.FC<ClassDetailLocationProps> = ({
  activity,
  isAppleDevice,
}) => {
  const room = activity.room_number || '';
  const rawBuildingName =
    typeof activity.building_name === 'string'
      ? activity.building_name
      : activity.building_name?.pl || 'Politechnika Rzeszowska';

  const buildingCode = extractBuildingCode(activity.building_id, rawBuildingName, room);
  const knownGeo = buildingCode ? KNOWN_PRZ_BUILDINGS[buildingCode] : undefined;

  const buildingTitle =
    activity.building_name && activity.building_name !== 'Politechnika Rzeszowska'
      ? (typeof activity.building_name === 'string' ? activity.building_name : activity.building_name.pl)
      : knownGeo?.name || (buildingCode ? `Budynek ${buildingCode}` : 'Politechnika Rzeszowska');

  const buildingShortName = knownGeo?.shortName || (buildingCode ? `Budynek ${buildingCode}` : 'Politechnika Rzeszowska');
  const location =
    activity.building_location ||
    knownGeo?.location ||
    { lat: 50.019044, long: 21.989185 };

  const googleMapsUrl = `https://www.google.com/maps?q=${location.lat},${location.long}`;
  const appleMapsUrl = `https://maps.apple.com/?ll=${location.lat},${location.long}&q=${encodeURIComponent(buildingShortName)}`;
  const navDirectionsUrl = isAppleDevice
    ? `https://maps.apple.com/?daddr=${location.lat},${location.long}&q=${encodeURIComponent(buildingShortName)}`
    : `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.long}`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => window.open(navDirectionsUrl, '_blank', 'noopener,noreferrer')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.open(navDirectionsUrl, '_blank', 'noopener,noreferrer');
        }
      }}
      title={`Kliknij, aby nawigować w ${isAppleDevice ? 'Apple Maps' : 'Google Maps'}: ${buildingShortName}`}
      className="group/map flex flex-col justify-between p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] border border-black/[0.03] dark:border-white/[0.04] hover:border-[#fa243c]/30 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-xs gap-3"
    >
      <div className="flex items-start space-x-3.5 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-[#fa243c]/10 text-[#fa243c] flex items-center justify-center shrink-0 group-hover/map:bg-[#fa243c] group-hover/map:text-white transition-all shadow-xs">
          <MapPin className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-1.5 flex-wrap">
            <h4 className="text-[11px] font-medium text-[#86868b]">
              Miejsce zajęć
            </h4>
            <span className="text-[10px] text-[#fa243c] font-medium flex items-center space-x-1">
              <span>• Nawiguj GPS</span>
              <Navigation className="w-2.5 h-2.5 inline" />
            </span>
          </div>
          <p className="font-semibold text-sm text-[#1d1d1f] dark:text-[#f5f5f7] mt-0.5 group-hover/map:text-[#fa243c] transition-colors">
            {room ? `Sala: ${room}` : 'Sala niepodana'}
          </p>
          <p className="text-xs text-[#1d1d1f] dark:text-[#f5f5f7] font-medium mt-1 flex items-start">
            <Building2 className="w-3.5 h-3.5 mr-1.5 inline opacity-70 shrink-0 mt-0.5 text-[#fa243c]" />
            <span className="leading-snug">{buildingTitle}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
          }}
          title="Otwórz w Google Maps"
          className="flex-1 cursor-pointer flex items-center justify-center space-x-1.5 px-3 py-2 sm:py-1.5 min-h-[38px] sm:min-h-0 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-[#4285F4]/15 hover:text-[#4285F4] text-[#86868b] text-[11px] font-medium transition-all active:scale-95"
        >
          <span>Google Maps</span>
          <ExternalLink className="w-3 h-3 opacity-70" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            window.open(appleMapsUrl, '_blank', 'noopener,noreferrer');
          }}
          title="Otwórz w Apple Maps"
          className="flex-1 cursor-pointer flex items-center justify-center space-x-1.5 px-3 py-2 sm:py-1.5 min-h-[38px] sm:min-h-0 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-[#fa243c]/15 hover:text-[#fa243c] text-[#86868b] text-[11px] font-medium transition-all active:scale-95"
        >
          <span>Apple Maps</span>
          <Compass className="w-3 h-3 opacity-70" />
        </button>
      </div>
    </div>
  );
};
