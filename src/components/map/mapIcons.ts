import L from 'leaflet';
import { SeverityLevel, InterventionStatus } from '../../types';

export const createAlertIcon = (severity: SeverityLevel, isSelected = false): L.DivIcon => {
  const isCritical = severity === 'Critical';
  const isHigh = severity === 'High';

  const bgColor = isCritical ? '#dc2626' : isHigh ? '#d97706' : '#2563eb';
  const pulseClass = isCritical ? 'animate-ping' : '';
  const ringColor = isCritical ? 'rgba(239, 68, 68, 0.4)' : isHigh ? 'rgba(245, 158, 11, 0.4)' : 'rgba(59, 130, 246, 0.4)';
  const selectedRing = isSelected ? 'ring-4 ring-slate-900 ring-offset-2' : 'ring-2 ring-white';

  const html = `
    <div class="relative flex items-center justify-center cursor-pointer select-none group" style="width: 32px; height: 32px;">
      ${
        isCritical
          ? `<span class="absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseClass}" style="background-color: ${ringColor};"></span>`
          : ''
      }
      <div class="relative w-7 h-7 rounded-full flex items-center justify-center text-white shadow-lg ${selectedRing} transition-transform duration-200 group-hover:scale-110" style="background-color: ${bgColor};">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div class="absolute -bottom-1 w-2 h-2 rotate-45" style="background-color: ${bgColor};"></div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-alert-marker',
    html,
    iconSize: [32, 36],
    iconAnchor: [16, 34],
    popupAnchor: [0, -32]
  });
};

export const createInterventionIcon = (status: InterventionStatus, isSelected = false): L.DivIcon => {
  const isCompleted = status === 'Completed';
  // Blue for Active (Assigned or In Progress), Green for Completed
  const bgColor = isCompleted ? '#059669' : '#2563eb';
  const pulseClass = status === 'In Progress' ? 'animate-pulse' : '';
  const selectedRing = isSelected ? 'ring-4 ring-slate-900 ring-offset-2' : 'ring-2 ring-white';

  const iconSvg = isCompleted
    ? `<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 stroke-current stroke-[2.5] fill-none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>`;

  const html = `
    <div class="relative flex items-center justify-center cursor-pointer select-none group" style="width: 30px; height: 30px;">
      <div class="relative w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-md ${selectedRing} ${pulseClass} transition-transform duration-200 group-hover:scale-110" style="background-color: ${bgColor};">
        ${iconSvg}
      </div>
      <div class="absolute -bottom-1 w-1.5 h-1.5 rotate-45" style="background-color: ${bgColor};"></div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-intervention-marker',
    html,
    iconSize: [30, 34],
    iconAnchor: [15, 32],
    popupAnchor: [0, -30]
  });
};
