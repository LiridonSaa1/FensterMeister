import React from 'react';

interface WindowSvgProps {
  className?: string;
  frameColor?: string;
  glassColor?: string;
  width?: number | string;
  height?: number | string;
}

export const CasementWindowSvg: React.FC<WindowSvgProps> = ({
  className = 'w-full h-full',
  frameColor = '#334155',
  glassColor = '#e0f2fe',
}) => (
  <svg viewBox="0 0 160 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Wall & outer masonry opening */}
    <rect x="10" y="10" width="140" height="180" rx="4" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2" />
    {/* Outer Window Frame */}
    <rect x="20" y="20" width="120" height="155" rx="2" fill={frameColor} />
    {/* Inner rebate */}
    <rect x="28" y="28" width="104" height="139" rx="1" fill="#FFFFFF" />
    {/* Sash frame */}
    <rect x="34" y="34" width="92" height="127" rx="2" fill={frameColor} />
    {/* Glass Pane */}
    <rect x="42" y="42" width="76" height="111" fill={glassColor} />
    {/* Glass Reflection highlight */}
    <path d="M42 42 L80 42 L42 120 Z" fill="#FFFFFF" opacity="0.45" />
    <path d="M70 42 L110 42 L42 153 L42 135 Z" fill="#FFFFFF" opacity="0.25" />
    {/* Glazing bars / Muntins */}
    <line x1="80" y1="42" x2="80" y2="153" stroke={frameColor} strokeWidth="3" />
    <line x1="42" y1="97" x2="118" y2="97" stroke={frameColor} strokeWidth="3" />
    {/* Crank handle / Lever */}
    <circle cx="112" cy="100" r="3.5" fill="#94A3B8" stroke="#1E293B" strokeWidth="1.5" />
    <rect x="110" y="102" width="9" height="3" rx="1" fill="#475569" />
    {/* Side hinges */}
    <rect x="31" y="48" width="3" height="12" rx="1" fill="#64748B" />
    <rect x="31" y="130" width="3" height="12" rx="1" fill="#64748B" />
    {/* Swing arc indicator (dashed) */}
    <path d="M42 42 L118 97 L42 153" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
    {/* External Window Sill (cill) */}
    <path d="M12 175 L148 175 L144 185 L16 185 Z" fill="#94A3B8" stroke="#64748B" strokeWidth="1.5" />
  </svg>
);

export const DoubleHungWindowSvg: React.FC<WindowSvgProps> = ({
  className = 'w-full h-full',
  frameColor = '#334155',
  glassColor = '#e0f2fe',
}) => (
  <svg viewBox="0 0 160 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Wall & outer frame */}
    <rect x="15" y="15" width="130" height="165" rx="3" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
    {/* Master Frame */}
    <rect x="22" y="20" width="116" height="155" fill={frameColor} rx="2" />
    
    {/* TOP SASH (Fixed or Slides Down) */}
    <rect x="30" y="28" width="100" height="70" fill="#FFFFFF" stroke={frameColor} strokeWidth="5" />
    <rect x="35" y="33" width="90" height="60" fill={glassColor} />
    {/* Top Sash Muntins 2x2 */}
    <line x1="80" y1="33" x2="80" y2="93" stroke={frameColor} strokeWidth="2.5" />
    <line x1="35" y1="63" x2="125" y2="63" stroke={frameColor} strokeWidth="2.5" />
    <path d="M35 33 L65 33 L35 75 Z" fill="#FFFFFF" opacity="0.4" />
    
    {/* MEETING RAIL (Overlapping horizontal bar) */}
    <rect x="26" y="96" width="108" height="7" fill={frameColor} />
    <rect x="76" y="97" width="8" height="5" rx="1" fill="#E2E8F0" stroke="#475569" strokeWidth="1" />

    {/* BOTTOM SASH (Slides Up) */}
    <rect x="32" y="101" width="96" height="68" fill="#FFFFFF" stroke={frameColor} strokeWidth="5" />
    <rect x="37" y="106" width="86" height="58" fill={glassColor} />
    {/* Bottom Sash Muntins 2x2 */}
    <line x1="80" y1="106" x2="80" y2="164" stroke={frameColor} strokeWidth="2.5" />
    <line x1="37" y1="135" x2="123" y2="135" stroke={frameColor} strokeWidth="2.5" />
    <path d="M37 106 L75 106 L37 155 Z" fill="#FFFFFF" opacity="0.35" />
    
    {/* Vertical Slide Arrows */}
    <path d="M48 85 L48 45 M45 50 L48 45 L51 50" stroke="#3B82F6" strokeWidth="1.5" />
    <path d="M112 115 L112 155 M109 150 L112 155 L115 150" stroke="#3B82F6" strokeWidth="1.5" />
    
    {/* Bottom Sill */}
    <path d="M15 174 L145 174 L140 184 L20 184 Z" fill="#94A3B8" stroke="#64748B" strokeWidth="1.5" />
  </svg>
);

export const SingleHungWindowSvg: React.FC<WindowSvgProps> = ({
  className = 'w-full h-full',
  frameColor = '#334155',
  glassColor = '#e0f2fe',
}) => (
  <svg viewBox="0 0 160 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="15" width="130" height="165" rx="3" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
    <rect x="22" y="20" width="116" height="155" fill={frameColor} rx="2" />
    
    {/* TOP SASH (Fixed with decorative grids) */}
    <rect x="30" y="28" width="100" height="70" fill={glassColor} stroke={frameColor} strokeWidth="5" />
    <line x1="63" y1="31" x2="63" y2="95" stroke={frameColor} strokeWidth="2" />
    <line x1="97" y1="31" x2="97" y2="95" stroke={frameColor} strokeWidth="2" />
    <line x1="31" y1="63" x2="129" y2="63" stroke={frameColor} strokeWidth="2" />
    <rect x="31" y="28" width="22" height="16" fill="#F1F5F9" opacity="0.3" />

    {/* MEETING RAIL */}
    <rect x="25" y="96" width="110" height="7" fill={frameColor} />
    
    {/* BOTTOM SASH (Operable, slides up) */}
    <rect x="32" y="101" width="96" height="68" fill={glassColor} stroke={frameColor} strokeWidth="5" />
    <line x1="63" y1="104" x2="63" y2="166" stroke={frameColor} strokeWidth="2" />
    <line x1="97" y1="104" x2="97" y2="166" stroke={frameColor} strokeWidth="2" />
    <line x1="34" y1="135" x2="126" y2="135" stroke={frameColor} strokeWidth="2" />
    {/* Lift rail handle */}
    <rect x="70" y="158" width="20" height="3" rx="1" fill="#475569" />
    <path d="M80 150 L80 115 M77 120 L80 115 L83 120" stroke="#3B82F6" strokeWidth="1.5" />
    
    {/* Sill */}
    <path d="M15 174 L145 174 L140 184 L20 184 Z" fill="#94A3B8" stroke="#64748B" strokeWidth="1.5" />
  </svg>
);

export const SlidingWindowSvg: React.FC<WindowSvgProps> = ({
  className = 'w-full h-full',
  frameColor = '#334155',
  glassColor = '#e0f2fe',
}) => (
  <svg viewBox="0 0 200 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="15" width="180" height="130" rx="3" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
    <rect x="18" y="22" width="164" height="114" fill={frameColor} rx="2" />
    
    {/* LEFT SASH */}
    <rect x="26" y="29" width="75" height="100" fill={glassColor} stroke={frameColor} strokeWidth="5" />
    <line x1="63" y1="32" x2="63" y2="126" stroke={frameColor} strokeWidth="2" />
    <line x1="28" y1="79" x2="99" y2="79" stroke={frameColor} strokeWidth="2" />
    <path d="M28 32 L58 32 L28 72 Z" fill="#FFFFFF" opacity="0.4" />
    {/* Horizontal Arrow */}
    <path d="M45 80 L80 80 M75 76 L80 80 L75 84" stroke="#3B82F6" strokeWidth="1.5" />
    
    {/* CENTER VERTICAL MEETING STILE */}
    <rect x="97" y="24" width="7" height="110" fill={frameColor} />
    <rect x="99" y="70" width="3" height="18" rx="1" fill="#94A3B8" />

    {/* RIGHT SASH */}
    <rect x="101" y="29" width="73" height="100" fill={glassColor} stroke={frameColor} strokeWidth="5" />
    <line x1="137" y1="32" x2="137" y2="126" stroke={frameColor} strokeWidth="2" />
    <line x1="103" y1="79" x2="172" y2="79" stroke={frameColor} strokeWidth="2" />
    <path d="M103 32 L133 32 L103 72 Z" fill="#FFFFFF" opacity="0.4" />
    {/* Horizontal Arrow */}
    <path d="M155 80 L120 80 M125 76 L120 80 L125 84" stroke="#3B82F6" strokeWidth="1.5" />

    {/* Sill */}
    <path d="M10 135 L190 135 L185 145 L15 145 Z" fill="#94A3B8" stroke="#64748B" strokeWidth="1.5" />
  </svg>
);

export const BayWindowSvg: React.FC<WindowSvgProps> = ({
  className = 'w-full h-full',
  frameColor = '#334155',
  glassColor = '#e0f2fe',
}) => (
  <svg viewBox="0 0 220 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Wall & Projection Roof */}
    <polygon points="20,40 60,20 160,20 200,40 180,44 40,44" fill="#64748B" stroke="#475569" strokeWidth="1.5" />
    
    {/* LEFT ANGLED FLANK (30 or 45 degree casement) */}
    <polygon points="25,45 65,35 65,135 25,125" fill={frameColor} />
    <polygon points="30,50 60,42 60,128 30,120" fill={glassColor} />
    <line x1="45" y1="46" x2="45" y2="124" stroke={frameColor} strokeWidth="2" />
    <line x1="30" y1="85" x2="60" y2="85" stroke={frameColor} strokeWidth="2" />

    {/* CENTER PICTURE WINDOW (Large panoramic pane) */}
    <rect x="68" y="32" width="84" height="106" fill={frameColor} rx="1" />
    <rect x="74" y="38" width="72" height="94" fill={glassColor} />
    <line x1="110" y1="38" x2="110" y2="132" stroke={frameColor} strokeWidth="2.5" />
    <line x1="74" y1="85" x2="146" y2="85" stroke={frameColor} strokeWidth="2.5" />
    <path d="M74 38 L114 38 L74 90 Z" fill="#FFFFFF" opacity="0.4" />

    {/* RIGHT ANGLED FLANK (Casement) */}
    <polygon points="155,35 195,45 195,125 155,135" fill={frameColor} />
    <polygon points="160,42 190,50 190,120 160,128" fill={glassColor} />
    <line x1="175" y1="46" x2="175" y2="124" stroke={frameColor} strokeWidth="2" />
    <line x1="160" y1="85" x2="190" y2="85" stroke={frameColor} strokeWidth="2" />

    {/* Angled Mullion Posts */}
    <line x1="66" y1="30" x2="66" y2="138" stroke="#1E293B" strokeWidth="4" />
    <line x1="154" y1="30" x2="154" y2="138" stroke="#1E293B" strokeWidth="4" />

    {/* Base Projection Platform & Sill */}
    <polygon points="20,127 65,137 155,137 200,127 190,143 30,143" fill="#94A3B8" stroke="#64748B" strokeWidth="1.5" />
  </svg>
);

export const BowWindowSvg: React.FC<WindowSvgProps> = ({
  className = 'w-full h-full',
  frameColor = '#334155',
  glassColor = '#e0f2fe',
}) => (
  <svg viewBox="0 0 220 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Curved Bow Roof Canopy */}
    <path d="M20 40 Q110 18 200 40 L190 46 Q110 26 30 46 Z" fill="#64748B" stroke="#475569" strokeWidth="1.5" />
    
    {/* 4 Gently Curved Panels */}
    {/* Panel 1 */}
    <polygon points="25,48 64,40 64,130 25,124" fill={frameColor} />
    <polygon points="30,52 59,45 59,125 30,120" fill={glassColor} />
    <line x1="30" y1="85" x2="59" y2="85" stroke={frameColor} strokeWidth="1.5" />

    {/* Panel 2 */}
    <polygon points="66,40 108,35 108,133 66,130" fill={frameColor} />
    <polygon points="71,44 103,39 103,129 71,126" fill={glassColor} />
    <line x1="71" y1="84" x2="103" y2="84" stroke={frameColor} strokeWidth="1.5" />

    {/* Panel 3 */}
    <polygon points="112,35 154,40 154,130 112,133" fill={frameColor} />
    <polygon points="117,39 149,44 149,126 117,129" fill={glassColor} />
    <line x1="117" y1="84" x2="149" y2="84" stroke={frameColor} strokeWidth="1.5" />

    {/* Panel 4 */}
    <polygon points="156,40 195,48 195,124 156,130" fill={frameColor} />
    <polygon points="161,45 190,52 190,120 161,125" fill={glassColor} />
    <line x1="161" y1="85" x2="190" y2="85" stroke={frameColor} strokeWidth="1.5" />

    {/* Curved Bottom Sill */}
    <path d="M20 126 Q110 144 200 126 L190 144 Q110 158 30 144 Z" fill="#94A3B8" stroke="#64748B" strokeWidth="1.5" />
  </svg>
);

export const AwningWindowSvg: React.FC<WindowSvgProps> = ({
  className = 'w-full h-full',
  frameColor = '#334155',
  glassColor = '#e0f2fe',
}) => (
  <svg viewBox="0 0 160 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="15" width="130" height="130" rx="3" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
    <rect x="22" y="22" width="116" height="114" fill={frameColor} rx="2" />
    
    {/* Inner Sash */}
    <rect x="30" y="30" width="100" height="98" fill={glassColor} stroke={frameColor} strokeWidth="6" />
    {/* Top Continuous Piano Hinge */}
    <rect x="28" y="27" width="104" height="5" rx="1" fill="#64748B" />
    
    {/* Muntin bars */}
    <line x1="80" y1="33" x2="80" y2="125" stroke={frameColor} strokeWidth="3" />
    <line x1="33" y1="79" x2="127" y2="79" stroke={frameColor} strokeWidth="3" />
    
    {/* Glass Reflection */}
    <path d="M33 33 L73 33 L33 83 Z" fill="#FFFFFF" opacity="0.4" />
    
    {/* Top-Hinged Opening Outward Indicator Triangle */}
    <path d="M30 30 L80 128 L130 30" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="3 3" />
    
    {/* Bottom Crank Handle */}
    <rect x="74" y="122" width="12" height="4" rx="1" fill="#94A3B8" stroke="#334155" strokeWidth="1" />

    {/* Sill */}
    <path d="M15 135 L145 135 L140 145 L20 145 Z" fill="#94A3B8" stroke="#64748B" strokeWidth="1.5" />
  </svg>
);

export const HopperWindowSvg: React.FC<WindowSvgProps> = ({
  className = 'w-full h-full',
  frameColor = '#334155',
  glassColor = '#e0f2fe',
}) => (
  <svg viewBox="0 0 160 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="15" width="130" height="130" rx="3" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
    <rect x="22" y="22" width="116" height="114" fill={frameColor} rx="2" />
    
    {/* Inner Sash */}
    <rect x="30" y="30" width="100" height="98" fill={glassColor} stroke={frameColor} strokeWidth="6" />
    {/* Bottom Continuous Hinge */}
    <rect x="28" y="125" width="104" height="5" rx="1" fill="#64748B" />
    
    {/* Muntins */}
    <line x1="80" y1="33" x2="80" y2="125" stroke={frameColor} strokeWidth="3" />
    
    {/* Top-inward Tilting Indicator (V-shape opening downwards) */}
    <path d="M30 128 L80 30 L130 128" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="3 3" />
    
    {/* Top Center Catch Lock */}
    <rect x="75" y="32" width="10" height="6" rx="1" fill="#94A3B8" stroke="#334155" strokeWidth="1" />

    {/* Sill */}
    <path d="M15 135 L145 135 L140 145 L20 145 Z" fill="#94A3B8" stroke="#64748B" strokeWidth="1.5" />
  </svg>
);

export const PictureWindowSvg: React.FC<WindowSvgProps> = ({
  className = 'w-full h-full',
  frameColor = '#334155',
  glassColor = '#e0f2fe',
}) => (
  <svg viewBox="0 0 180 180" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="15" width="150" height="150" rx="3" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
    {/* Low-profile heavy duty frame */}
    <rect x="22" y="22" width="136" height="136" fill={frameColor} rx="2" />
    {/* Massive single monolithic glass pane (no dividers for pure panoramic view) */}
    <rect x="30" y="30" width="120" height="120" fill={glassColor} />
    
    {/* High-fidelity glass reflections */}
    <path d="M30 30 L90 30 L30 110 Z" fill="#FFFFFF" opacity="0.45" />
    <path d="M85 30 L145 30 L30 150 L30 130 Z" fill="#FFFFFF" opacity="0.3" />
    
    {/* Subtle landscape silhouette inside reflection */}
    <path d="M50 120 Q80 100 110 115 T150 110 L150 150 L50 150 Z" fill="#93C5FD" opacity="0.25" />
    
    {/* Sill */}
    <path d="M15 158 L165 158 L160 168 L20 168 Z" fill="#94A3B8" stroke="#64748B" strokeWidth="1.5" />
  </svg>
);

export const ArchedWindowSvg: React.FC<WindowSvgProps> = ({
  className = 'w-full h-full',
  frameColor = '#334155',
  glassColor = '#e0f2fe',
}) => (
  <svg viewBox="0 0 160 210" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Wall & Arch cutout */}
    <path d="M20 90 A60 60 0 0 1 140 90 L140 180 L20 180 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
    
    {/* Master Frame */}
    <path d="M26 90 A54 54 0 0 1 134 90 L134 175 L26 175 Z" fill={frameColor} />
    
    {/* Inner Glass */}
    <path d="M34 90 A46 46 0 0 1 126 90 L126 167 L34 167 Z" fill={glassColor} />
    
    {/* Sunburst / Radial Spoke Muntins in Arch */}
    <line x1="80" y1="90" x2="80" y2="44" stroke={frameColor} strokeWidth="2.5" />
    <line x1="80" y1="90" x2="47" y2="57" stroke={frameColor} strokeWidth="2" />
    <line x1="80" y1="90" x2="113" y2="57" stroke={frameColor} strokeWidth="2" />
    <path d="M48 90 A32 32 0 0 1 112 90" stroke={frameColor} strokeWidth="2" fill="none" />
    
    {/* Springline Horizontal Divider */}
    <line x1="26" y1="90" x2="134" y2="90" stroke={frameColor} strokeWidth="4" />
    
    {/* Lower Body Muntins */}
    <line x1="80" y1="90" x2="80" y2="167" stroke={frameColor} strokeWidth="2.5" />
    <line x1="34" y1="128" x2="126" y2="128" stroke={frameColor} strokeWidth="2" />

    {/* Glass Reflection */}
    <path d="M34 90 L70 90 L34 140 Z" fill="#FFFFFF" opacity="0.4" />
    
    {/* Heavy Classical Sill */}
    <path d="M16 175 L144 175 L138 188 L22 188 Z" fill="#94A3B8" stroke="#64748B" strokeWidth="1.5" />
  </svg>
);

export const TiltAndTurnWindowSvg: React.FC<WindowSvgProps> = ({
  className = 'w-full h-full',
  frameColor = '#334155',
  glassColor = '#e0f2fe',
}) => (
  <svg viewBox="0 0 160 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="15" width="130" height="170" rx="3" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
    <rect x="22" y="22" width="116" height="156" fill={frameColor} rx="2" />
    
    {/* Multi-point European Heavy Sash */}
    <rect x="30" y="30" width="100" height="140" fill={glassColor} stroke={frameColor} strokeWidth="6" />
    
    {/* Dual Action Graphic Overlay:
        1. Turn (Side swing dashed triangle)
        2. Tilt (Top inward dashed triangle) */}
    <path d="M30 30 L130 100 L30 170" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="3 3" />
    <path d="M30 170 L80 30 L130 170" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.85" />
    
    {/* Multi-action Ergonomic European Lever Handle */}
    <rect x="120" y="94" width="4" height="18" rx="2" fill="#94A3B8" stroke="#1E293B" strokeWidth="1" />
    <circle cx="122" cy="100" r="3" fill="#475569" />

    {/* Glass Reflection */}
    <path d="M33 33 L80 33 L33 110 Z" fill="#FFFFFF" opacity="0.4" />
    
    {/* Sill */}
    <path d="M15 178 L145 178 L140 188 L20 188 Z" fill="#94A3B8" stroke="#64748B" strokeWidth="1.5" />
  </svg>
);

export const SkylightWindowSvg: React.FC<WindowSvgProps> = ({
  className = 'w-full h-full',
  frameColor = '#334155',
  glassColor = '#e0f2fe',
}) => (
  <svg viewBox="0 0 180 180" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Pitched Roof Shingle Base */}
    <polygon points="10,140 40,40 140,40 170,140" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.5" />
    <line x1="20" y1="115" x2="160" y2="115" stroke="#94A3B8" strokeDasharray="4 4" />
    <line x1="30" y1="90" x2="150" y2="90" stroke="#94A3B8" strokeDasharray="4 4" />
    <line x1="35" y1="65" x2="145" y2="65" stroke="#94A3B8" strokeDasharray="4 4" />
    
    {/* Raised Flashing Curb */}
    <polygon points="35,130 60,50 120,50 145,130" fill="#64748B" />
    
    {/* Skylight Sash Frame (Angled perspective) */}
    <polygon points="40,125 64,55 116,55 140,125" fill={frameColor} />
    
    {/* Heavy Tempered Safety Glass */}
    <polygon points="46,120 68,60 112,60 134,120" fill={glassColor} />
    
    {/* Skylight Sky/Sun Rays Reflection */}
    <polygon points="68,60 90,60 60,120 46,120" fill="#FFFFFF" opacity="0.6" />
    <circle cx="100" cy="80" r="12" fill="#FDE047" opacity="0.5" />
    
    {/* Telescopic Extension Rod / Motor Hinge */}
    <circle cx="90" cy="116" r="3" fill="#0F172A" />
  </svg>
);

export const JalousieWindowSvg: React.FC<WindowSvgProps> = ({
  className = 'w-full h-full',
  frameColor = '#334155',
  glassColor = '#e0f2fe',
}) => (
  <svg viewBox="0 0 160 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="15" width="130" height="170" rx="3" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
    <rect x="22" y="22" width="116" height="156" fill={frameColor} rx="2" />
    
    {/* 8 Parallel Louver Slats (Angled Glass Blades) */}
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
      const y = 30 + i * 18;
      return (
        <g key={i}>
          {/* Glass slat with angled shadow */}
          <polygon
            points={`30,${y} 130,${y} 130,${y + 14} 30,${y + 14}`}
            fill={glassColor}
            stroke="#93C5FD"
            strokeWidth="1"
          />
          {/* Slat bottom highlight bevel */}
          <line x1="30" y1={y + 14} x2="130" y2={y + 14} stroke="#60A5FA" strokeWidth="1.5" />
          {/* Side clip pivot holders */}
          <rect x="27" y={y + 4} width="5" height="7" rx="1" fill="#64748B" />
          <rect x="128" y={y + 4} width="5" height="7" rx="1" fill="#64748B" />
        </g>
      );
    })}
    
    {/* Rotary Louver Crank Handle */}
    <circle cx="128" cy="155" r="4" fill="#94A3B8" stroke="#334155" strokeWidth="1.5" />
    <rect x="125" y="158" width="8" height="3" rx="1" fill="#475569" />

    {/* Sill */}
    <path d="M15 178 L145 178 L140 188 L20 188 Z" fill="#94A3B8" stroke="#64748B" strokeWidth="1.5" />
  </svg>
);

export const TransomWindowSvg: React.FC<WindowSvgProps> = ({
  className = 'w-full h-full',
  frameColor = '#334155',
  glassColor = '#e0f2fe',
}) => (
  <svg viewBox="0 0 200 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Doorway Header / Transom Over Door */}
    <rect x="10" y="15" width="180" height="70" rx="2" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
    {/* Transom Frame */}
    <rect x="18" y="22" width="164" height="56" fill={frameColor} rx="2" />
    
    {/* Glass Pane with Decorative Craftsman/Fanlight Bars */}
    <rect x="26" y="30" width="148" height="40" fill={glassColor} />
    <line x1="63" y1="30" x2="63" y2="70" stroke={frameColor} strokeWidth="3" />
    <line x1="100" y1="30" x2="100" y2="70" stroke={frameColor} strokeWidth="3" />
    <line x1="137" y1="30" x2="137" y2="70" stroke={frameColor} strokeWidth="3" />
    
    <path d="M26 30 L55 30 L26 65 Z" fill="#FFFFFF" opacity="0.4" />
    
    {/* Transom Bar (Heavy intermediate beam between window & door below) */}
    <rect x="10" y="80" width="180" height="12" fill="#475569" stroke="#334155" strokeWidth="1.5" />
    
    {/* Top of Door below */}
    <rect x="20" y="92" width="160" height="38" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
    <rect x="30" y="98" width="65" height="32" fill="#CBD5E1" />
    <rect x="105" y="98" width="65" height="32" fill="#CBD5E1" />
  </svg>
);

export const GardenWindowSvg: React.FC<WindowSvgProps> = ({
  className = 'w-full h-full',
  frameColor = '#334155',
  glassColor = '#e0f2fe',
}) => (
  <svg viewBox="0 0 200 180" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* 3D Greenhouse Protrusion Glass Roof */}
    <polygon points="30,55 65,25 135,25 170,55" fill="#BAE6FD" stroke={frameColor} strokeWidth="3" opacity="0.85" />
    
    {/* Left Glass Side Flank */}
    <polygon points="30,55 65,30 65,135 30,145" fill="#E0F2FE" stroke={frameColor} strokeWidth="2.5" />
    
    {/* Right Glass Side Flank */}
    <polygon points="170,55 135,30 135,135 170,145" fill="#E0F2FE" stroke={frameColor} strokeWidth="2.5" />
    
    {/* Center Front Glass */}
    <polygon points="30,55 170,55 170,145 30,145" fill={glassColor} stroke={frameColor} strokeWidth="4" />
    
    {/* Internal Plant Shelf (Tempered glass rack) */}
    <polygon points="35,100 165,100 165,103 35,103" fill="#60A5FA" opacity="0.7" />
    
    {/* Potted Herb Illustration */}
    <ellipse cx="80" cy="98" rx="7" ry="3" fill="#B45309" />
    <path d="M75 98 L77 88 L83 88 L85 98 Z" fill="#D97706" />
    <circle cx="80" cy="84" r="5" fill="#16A34A" />
    <circle cx="84" cy="82" r="4" fill="#22C55E" />
    <circle cx="76" cy="82" r="4" fill="#15803D" />

    <ellipse cx="120" cy="98" rx="8" ry="3.5" fill="#B45309" />
    <path d="M114 98 L116 86 L124 86 L126 98 Z" fill="#EA580C" />
    <circle cx="120" cy="80" r="6" fill="#16A34A" />

    {/* Heavy Insulated Base Sill */}
    <polygon points="25,145 175,145 165,160 35,160" fill="#94A3B8" stroke="#64748B" strokeWidth="1.5" />
  </svg>
);

export const FrenchCasementWindowSvg: React.FC<WindowSvgProps> = ({
  className = 'w-full h-full',
  frameColor = '#334155',
  glassColor = '#e0f2fe',
}) => (
  <svg viewBox="0 0 180 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="15" width="150" height="170" rx="3" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
    <rect x="22" y="22" width="136" height="156" fill={frameColor} rx="2" />
    
    {/* Dual Sashes that meet with NO center mullion (Floating Stile) */}
    {/* LEFT SASH */}
    <rect x="30" y="30" width="58" height="140" fill={glassColor} stroke={frameColor} strokeWidth="4" />
    <line x1="30" y1="76" x2="88" y2="76" stroke={frameColor} strokeWidth="2" />
    <line x1="30" y1="124" x2="88" y2="124" stroke={frameColor} strokeWidth="2" />
    {/* Left Swing Indicator */}
    <path d="M30 30 L88 100 L30 170" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="3 3" />
    
    {/* RIGHT SASH */}
    <rect x="92" y="30" width="58" height="140" fill={glassColor} stroke={frameColor} strokeWidth="4" />
    <line x1="92" y1="76" x2="150" y2="76" stroke={frameColor} strokeWidth="2" />
    <line x1="92" y1="124" x2="150" y2="124" stroke={frameColor} strokeWidth="2" />
    {/* Right Swing Indicator */}
    <path d="M150 30 L92 100 L150 170" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="3 3" />

    {/* Espagnolette Locking Rod & French Handle in Center */}
    <rect x="88.5" y="40" width="3" height="120" fill="#94A3B8" />
    <circle cx="90" cy="100" r="3.5" fill="#475569" stroke="#0F172A" strokeWidth="1" />
    <rect x="84" y="99" width="12" height="2" rx="1" fill="#334155" />

    {/* Sill */}
    <path d="M15 178 L165 178 L160 188 L20 188 Z" fill="#94A3B8" stroke="#64748B" strokeWidth="1.5" />
  </svg>
);

export const DormerWindowSvg: React.FC<WindowSvgProps> = ({
  className = 'w-full h-full',
  frameColor = '#334155',
  glassColor = '#e0f2fe',
}) => (
  <svg viewBox="0 0 180 190" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Sloping Roof background */}
    <polygon points="10,170 90,30 170,170" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.5" />
    
    {/* Dormer Gable Roof (Triangular Front Pediment) */}
    <polygon points="35,80 90,40 145,80" fill="#64748B" stroke="#334155" strokeWidth="2" />
    <polygon points="40,80 90,44 140,80" fill="#94A3B8" />
    
    {/* Dormer Vertical Cheeks (Side Walls) */}
    <rect x="42" y="80" width="96" height="85" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
    
    {/* Dormer Window Sash (Double hung / Casement) */}
    <rect x="52" y="88" width="76" height="70" fill={frameColor} rx="2" />
    <rect x="58" y="94" width="64" height="58" fill={glassColor} />
    <line x1="90" y1="94" x2="90" y2="152" stroke={frameColor} strokeWidth="2.5" />
    <line x1="58" y1="123" x2="122" y2="123" stroke={frameColor} strokeWidth="2.5" />
    
    {/* Window Sill */}
    <rect x="48" y="158" width="84" height="8" rx="1" fill="#64748B" />
  </svg>
);

export const ClerestoryWindowSvg: React.FC<WindowSvgProps> = ({
  className = 'w-full h-full',
  frameColor = '#334155',
  glassColor = '#e0f2fe',
}) => (
  <svg viewBox="0 0 220 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Roof overhang above */}
    <polygon points="10,20 210,10 205,25 15,35" fill="#475569" />
    
    {/* Clerestory Long Horizontal Ribbon Frame */}
    <rect x="15" y="32" width="190" height="56" rx="2" fill={frameColor} />
    
    {/* 4 Continuous Glass Panes for High-Level Natural Daylight */}
    {[0, 1, 2, 3].map((i) => {
      const x = 23 + i * 44;
      return (
        <g key={i}>
          <rect x={x} y="39" width="40" height="42" fill={glassColor} />
          <path d={`M${x} 39 L${x + 18} 39 L${x} 65 Z`} fill="#FFFFFF" opacity="0.4" />
        </g>
      );
    })}

    {/* Bottom Wall */}
    <rect x="15" y="88" width="190" height="20" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
  </svg>
);

export const RoundOculusWindowSvg: React.FC<WindowSvgProps> = ({
  className = 'w-full h-full',
  frameColor = '#334155',
  glassColor = '#e0f2fe',
}) => (
  <svg viewBox="0 0 160 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer Circular Masonry Surround */}
    <circle cx="80" cy="80" r="68" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
    {/* Circular Master Frame */}
    <circle cx="80" cy="80" r="60" fill={frameColor} />
    {/* Glass Pane */}
    <circle cx="80" cy="80" r="50" fill={glassColor} />
    
    {/* 4-spoke Cross Muntins (Wheel/Compass pattern) */}
    <line x1="80" y1="30" x2="80" y2="130" stroke={frameColor} strokeWidth="3" />
    <line x1="30" y1="80" x2="130" y2="80" stroke={frameColor} strokeWidth="3" />
    
    {/* Circular Concentric Inner Ring */}
    <circle cx="80" cy="80" r="24" fill="none" stroke={frameColor} strokeWidth="2" />
    
    {/* Glass reflections */}
    <path d="M45 45 A50 50 0 0 1 115 45 Z" fill="#FFFFFF" opacity="0.35" />
  </svg>
);

// 20. OCTAGON & POLYGON GEOMETRIC WINDOW
export const OctagonWindowSvg: React.FC<WindowSvgProps> = ({
  className = 'w-full h-full',
  frameColor = '#334155',
  glassColor = '#e0f2fe',
}) => (
  <svg viewBox="0 0 160 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="50,15 110,15 145,50 145,110 110,145 50,145 15,110 15,50" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
    <polygon points="52,22 108,22 138,52 138,108 108,138 52,138 22,108 22,52" fill={frameColor} />
    <polygon points="56,30 104,30 130,56 130,104 104,130 56,130 30,104 30,56" fill={glassColor} />
    
    {/* Octagonal spoke grids */}
    <line x1="80" y1="30" x2="80" y2="130" stroke={frameColor} strokeWidth="2.5" />
    <line x1="30" y1="80" x2="130" y2="80" stroke={frameColor} strokeWidth="2.5" />
    <line x1="45" y1="45" x2="115" y2="115" stroke={frameColor} strokeWidth="2" />
    <line x1="115" y1="45" x2="45" y2="115" stroke={frameColor} strokeWidth="2" />
    
    {/* Center diamond bevel */}
    <polygon points="80,60 100,80 80,100 60,80" fill="none" stroke={frameColor} strokeWidth="2" />
    <path d="M56 30 L80 30 L40 90 Z" fill="#FFFFFF" opacity="0.4" />
  </svg>
);

// 21. TRAPEZOID & RAKE WINDOW (Sloped Ceiling / Vaulted Roofline)
export const TrapezoidWindowSvg: React.FC<WindowSvgProps> = ({
  className = 'w-full h-full',
  frameColor = '#334155',
  glassColor = '#e0f2fe',
}) => (
  <svg viewBox="0 0 160 180" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Wall & outer rake */}
    <polygon points="15,160 145,160 145,30 15,90" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
    {/* Frame */}
    <polygon points="22,152 138,152 138,38 22,92" fill={frameColor} />
    {/* Glass */}
    <polygon points="30,144 130,144 130,48 30,96" fill={glassColor} />
    
    {/* Raked Vertical Muntins */}
    <line x1="63" y1="80" x2="63" y2="144" stroke={frameColor} strokeWidth="2.5" />
    <line x1="96" y1="64" x2="96" y2="144" stroke={frameColor} strokeWidth="2.5" />
    <line x1="30" y1="120" x2="130" y2="120" stroke={frameColor} strokeWidth="2.5" />
    
    {/* Highlight reflection */}
    <polygon points="30,96 70,76 30,140" fill="#FFFFFF" opacity="0.4" />
    {/* Bottom sill */}
    <polygon points="12,160 148,160 142,170 18,170" fill="#94A3B8" stroke="#64748B" strokeWidth="1.5" />
  </svg>
);

// 22. TRIANGLE & GABLE PEAK WINDOW (Cathedral Apex)
export const TriangleWindowSvg: React.FC<WindowSvgProps> = ({
  className = 'w-full h-full',
  frameColor = '#334155',
  glassColor = '#e0f2fe',
}) => (
  <svg viewBox="0 0 160 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="80,15 150,145 10,145" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
    <polygon points="80,25 142,138 18,138" fill={frameColor} />
    <polygon points="80,38 132,130 28,130" fill={glassColor} />
    
    {/* Cathedral spoke muntins */}
    <line x1="80" y1="38" x2="80" y2="130" stroke={frameColor} strokeWidth="2.5" />
    <line x1="45" y1="98" x2="115" y2="98" stroke={frameColor} strokeWidth="2" />
    <line x1="55" y1="80" x2="80" y2="130" stroke={frameColor} strokeWidth="2" />
    <line x1="105" y1="80" x2="80" y2="130" stroke={frameColor} strokeWidth="2" />
    
    <polygon points="80,38 100,75 50,130 35,130" fill="#FFFFFF" opacity="0.35" />
    <polygon points="6,145 154,145 148,154 12,154" fill="#94A3B8" stroke="#64748B" strokeWidth="1.5" />
  </svg>
);

// 23. GOTHIC POINTED LANCET ARCH WINDOW (Cathedral / Tudor revival)
export const GothicLancetWindowSvg: React.FC<WindowSvgProps> = ({
  className = 'w-full h-full',
  frameColor = '#334155',
  glassColor = '#e0f2fe',
}) => (
  <svg viewBox="0 0 160 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer Gothic Wall Arch */}
    <path d="M20 180 L20 80 Q20 20 80 15 Q140 20 140 80 L140 180 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
    {/* Frame */}
    <path d="M28 172 L28 82 Q28 28 80 24 Q132 28 132 82 L132 172 Z" fill={frameColor} />
    {/* Glass */}
    <path d="M36 164 L36 84 Q36 38 80 34 Q124 38 124 84 L124 164 Z" fill={glassColor} />
    
    {/* Twin inner lancet arches */}
    <path d="M36 164 L36 100 Q36 65 58 55 Q80 65 80 100 L80 164" stroke={frameColor} strokeWidth="3" fill="none" />
    <path d="M80 164 L80 100 Q80 65 102 55 Q124 65 124 100 L124 164" stroke={frameColor} strokeWidth="3" fill="none" />
    
    {/* Trefoil circle apex tracery */}
    <circle cx="80" cy="50" r="10" stroke={frameColor} strokeWidth="2" fill="none" />
    <line x1="36" y1="130" x2="124" y2="130" stroke={frameColor} strokeWidth="2" />
    
    <path d="M36 84 Q36 38 80 34 L80 164 L36 164 Z" fill="#FFFFFF" opacity="0.25" />
    <path d="M14 180 L146 180 L140 190 L20 190 Z" fill="#94A3B8" stroke="#64748B" strokeWidth="1.5" />
  </svg>
);

// 24. BI-FOLD & ACCORDION FOLDING WINDOW (Pass-through / Indoor-Outdoor Living)
export const BifoldWindowSvg: React.FC<WindowSvgProps> = ({
  className = 'w-full h-full',
  frameColor = '#334155',
  glassColor = '#e0f2fe',
}) => (
  <svg viewBox="0 0 200 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Master Opening */}
    <rect x="15" y="20" width="170" height="120" rx="3" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
    <rect x="22" y="26" width="156" height="108" rx="2" fill={frameColor} />
    
    {/* Top and Bottom track guide rails */}
    <rect x="24" y="28" width="152" height="6" fill="#94A3B8" />
    <rect x="24" y="126" width="152" height="6" fill="#94A3B8" />
    
    {/* 4 Accordion Folding Panels */}
    {[
      { x: 30, w: 32, skew: -3 },
      { x: 65, w: 32, skew: 3 },
      { x: 102, w: 32, skew: -3 },
      { x: 137, w: 32, skew: 3 },
    ].map((panel, i) => (
      <g key={i}>
        <rect x={panel.x} y="36" width={panel.w} height="88" fill="#FFFFFF" stroke={frameColor} strokeWidth="3" rx="1" />
        <rect x={panel.x + 4} y="42" width={panel.w - 8} height="76" fill={glassColor} />
        {/* Glass reflection */}
        <path d={`M${panel.x + 4} 42 L${panel.x + 16} 42 L${panel.x + 4} 80 Z`} fill="#FFFFFF" opacity="0.4" />
        {/* Hinge pins */}
        {i < 3 && <circle cx={panel.x + panel.w + 1.5} cy="80" r="2.5" fill="#475569" />}
      </g>
    ))}
    
    {/* Accordion concertina arrow indicators */}
    <path d="M48 142 L78 142 M55 139 L48 142 L55 145" stroke="#3B82F6" strokeWidth="1.5" />
    <path d="M152 142 L122 142 M145 139 L152 142 L145 145" stroke="#3B82F6" strokeWidth="1.5" />
  </svg>
);

// 25. CENTER PIVOT & HORIZONTAL SWIVEL WINDOW (360° Rotating Axle)
export const PivotWindowSvg: React.FC<WindowSvgProps> = ({
  className = 'w-full h-full',
  frameColor = '#334155',
  glassColor = '#e0f2fe',
}) => (
  <svg viewBox="0 0 160 180" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="15" width="130" height="150" rx="3" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
    <rect x="22" y="22" width="116" height="136" rx="2" fill={frameColor} />
    
    {/* Pivoting Sash in Mid-Rotation 3D Perspective */}
    <polygon points="34,36 126,28 126,144 34,152" fill="#FFFFFF" stroke={frameColor} strokeWidth="4" />
    <polygon points="40,42 120,35 120,137 40,144" fill={glassColor} />
    
    {/* Central Horizontal Axle Pins */}
    <circle cx="28" cy="90" r="4.5" fill="#3B82F6" stroke="#1E293B" strokeWidth="1.5" />
    <circle cx="132" cy="90" r="4.5" fill="#3B82F6" stroke="#1E293B" strokeWidth="1.5" />
    
    {/* Pivot Rotation Arc Indicator */}
    <path d="M70 45 A40 40 0 0 1 90 135" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
    <polygon points="88,130 92,136 84,136" fill="#3B82F6" />
    
    {/* Sill */}
    <polygon points="12,165 148,165 142,174 18,174" fill="#94A3B8" stroke="#64748B" strokeWidth="1.5" />
  </svg>
);

// 26. CORNER BUTT-GLAZED GLASS WINDOW (Seamless 90° View)
export const CornerButtWindowSvg: React.FC<WindowSvgProps> = ({
  className = 'w-full h-full',
  frameColor = '#334155',
  glassColor = '#e0f2fe',
}) => (
  <svg viewBox="0 0 180 180" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Left Wall Facet */}
    <polygon points="15,40 85,25 85,150 15,160" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.5" />
    {/* Right Wall Facet */}
    <polygon points="85,25 165,40 165,160 85,150" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.5" />
    
    {/* Left Glass Pane */}
    <polygon points="25,48 85,35 85,142 25,150" fill={glassColor} stroke={frameColor} strokeWidth="3" />
    {/* Right Glass Pane */}
    <polygon points="85,35 155,48 155,150 85,142" fill={glassColor} stroke={frameColor} strokeWidth="3" opacity="0.9" />
    
    {/* Center 90° Silicone Butt Joint (No Vertical Post!) */}
    <line x1="85" y1="35" x2="85" y2="142" stroke="#0284C7" strokeWidth="3.5" strokeDasharray="4 2" />
    
    {/* Floating View Corner Callout Badge */}
    <circle cx="85" cy="88" r="8" fill="#0284C7" opacity="0.2" />
    <circle cx="85" cy="88" r="3" fill="#0284C7" />
    
    {/* Glass reflections */}
    <polygon points="25,48 55,42 25,120" fill="#FFFFFF" opacity="0.4" />
    <polygon points="115,42 155,48 155,120" fill="#FFFFFF" opacity="0.3" />
  </svg>
);

// 27. GAS-STRUT SERVERY PASS-THROUGH WINDOW (Patio Bar / Kitchen Servery)
export const PassThroughWindowSvg: React.FC<WindowSvgProps> = ({
  className = 'w-full h-full',
  frameColor = '#334155',
  glassColor = '#e0f2fe',
}) => (
  <svg viewBox="0 0 180 180" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Wall & Counter Bar Opening */}
    <rect x="15" y="30" width="150" height="120" rx="2" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
    <rect x="22" y="36" width="136" height="98" fill={frameColor} rx="2" />
    
    {/* Servery Counter Top Bar Ledge */}
    <rect x="10" y="132" width="160" height="14" rx="2" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />
    
    {/* Sash Swung Upwards at 80° via Gas Struts */}
    <polygon points="22,36 158,36 150,15 30,15" fill={glassColor} stroke={frameColor} strokeWidth="4" />
    
    {/* Dual Gas Struts Supporting Sash */}
    <line x1="28" y1="90" x2="36" y2="24" stroke="#0284C7" strokeWidth="3" />
    <circle cx="28" cy="90" r="2.5" fill="#1E293B" />
    <circle cx="36" cy="24" r="2.5" fill="#1E293B" />
    
    <line x1="152" y1="90" x2="144" y2="24" stroke="#0284C7" strokeWidth="3" />
    <circle cx="152" cy="90" r="2.5" fill="#1E293B" />
    <circle cx="144" cy="24" r="2.5" fill="#1E293B" />
    
    {/* Wide Open Unobstructed Counter Passway */}
    <rect x="28" y="44" width="124" height="84" fill="#FEF3C7" opacity="0.3" stroke="#FDE68A" strokeWidth="1" />
    <text x="90" y="90" textAnchor="middle" fill="#B45309" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
      100% SERVERY OPENING
    </text>
  </svg>
);

// 28. EYEBROW / SEGMENTAL ELLIPTICAL ARCH WINDOW
export const EyebrowWindowSvg: React.FC<WindowSvgProps> = ({
  className = 'w-full h-full',
  frameColor = '#334155',
  glassColor = '#e0f2fe',
}) => (
  <svg viewBox="0 0 180 150" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Wall & Segmental Eyebrow Curve */}
    <path d="M15 130 L15 65 Q90 20 165 65 L165 130 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
    <path d="M22 124 L22 68 Q90 28 158 68 L158 124 Z" fill={frameColor} />
    <path d="M30 116 L30 72 Q90 36 150 72 L150 116 Z" fill={glassColor} />
    
    {/* Vertical and Eyebrow Radial Muntins */}
    <line x1="60" y1="62" x2="60" y2="116" stroke={frameColor} strokeWidth="2.5" />
    <line x1="90" y1="46" x2="90" y2="116" stroke={frameColor} strokeWidth="2.5" />
    <line x1="120" y1="62" x2="120" y2="116" stroke={frameColor} strokeWidth="2.5" />
    <path d="M30 92 Q90 56 150 92" stroke={frameColor} strokeWidth="2.5" fill="none" />
    
    <path d="M30 72 Q90 36 150 72 L150 85 Q90 50 30 85 Z" fill="#FFFFFF" opacity="0.35" />
    <polygon points="10,130 170,130 164,140 16,140" fill="#94A3B8" stroke="#64748B" strokeWidth="1.5" />
  </svg>
);

// 29. QUARTER-ROUND & FANLIGHT CORNER TRANSOM
export const QuarterRoundWindowSvg: React.FC<WindowSvgProps> = ({
  className = 'w-full h-full',
  frameColor = '#334155',
  glassColor = '#e0f2fe',
}) => (
  <svg viewBox="0 0 160 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer 90° Quadrant Wall */}
    <path d="M20 20 L20 140 L140 140 A120 120 0 0 0 20 20 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
    <path d="M26 28 L26 134 L134 134 A108 108 0 0 0 26 28 Z" fill={frameColor} />
    <path d="M34 38 L34 126 L126 126 A92 92 0 0 0 34 38 Z" fill={glassColor} />
    
    {/* Sunburst radial spoke ribs from bottom-left origin */}
    <line x1="34" y1="126" x2="65" y2="48" stroke={frameColor} strokeWidth="2.5" />
    <line x1="34" y1="126" x2="98" y2="65" stroke={frameColor} strokeWidth="2.5" />
    <line x1="34" y1="126" x2="120" y2="98" stroke={frameColor} strokeWidth="2.5" />
    <path d="M34 84 A42 42 0 0 1 76 126" stroke={frameColor} strokeWidth="2" fill="none" />
    
    <path d="M34 38 A92 92 0 0 1 126 126 L96 126 A62 62 0 0 0 34 68 Z" fill="#FFFFFF" opacity="0.3" />
  </svg>
);

// 30. STAINED & LEADED ART GLASS WINDOW (Cathedral Artisan Series)
export const StainedGlassWindowSvg: React.FC<WindowSvgProps> = ({
  className = 'w-full h-full',
  frameColor = '#78350F', // Wood frame default
  glassColor = '#e0f2fe',
}) => (
  <svg viewBox="0 0 160 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="15" width="130" height="170" rx="3" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
    <rect x="22" y="22" width="116" height="156" fill={frameColor} rx="2" />
    
    {/* Stained Glass Mosaic Panels */}
    <rect x="30" y="30" width="100" height="140" fill="#FEF3C7" />
    
    {/* Multicolored artisan stained glass segments */}
    <polygon points="80,30 130,80 80,130 30,80" fill="#38BDF8" opacity="0.8" />
    <polygon points="80,50 110,80 80,110 50,80" fill="#F43F5E" opacity="0.85" />
    <polygon points="80,65 95,80 80,95 65,80" fill="#FBBF24" opacity="0.9" />
    
    {/* Corner Emerald Accents */}
    <polygon points="30,30 60,30 30,60" fill="#10B981" opacity="0.85" />
    <polygon points="130,30 100,30 130,60" fill="#10B981" opacity="0.85" />
    <polygon points="30,170 60,170 30,140" fill="#8B5CF6" opacity="0.85" />
    <polygon points="130,170 100,170 130,140" fill="#8B5CF6" opacity="0.85" />
    
    {/* Leaded Zinc/Cames Grid (Black metal joints) */}
    <rect x="30" y="30" width="100" height="140" fill="none" stroke="#1E293B" strokeWidth="3" />
    <line x1="80" y1="30" x2="80" y2="170" stroke="#1E293B" strokeWidth="2.5" />
    <line x1="30" y1="80" x2="130" y2="80" stroke="#1E293B" strokeWidth="2.5" />
    <line x1="30" y1="130" x2="130" y2="130" stroke="#1E293B" strokeWidth="2.5" />
    
    {/* Glass Shimmer */}
    <path d="M30 30 L90 30 L30 120 Z" fill="#FFFFFF" opacity="0.4" />
    <path d="M12 185 L148 185 L142 195 L18 195 Z" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />
  </svg>
);

// Map of all window type keys to their SVG components (30 complete window forms)
export const WINDOW_SVG_COMPONENTS: Record<string, React.FC<WindowSvgProps>> = {
  casement: CasementWindowSvg,
  double_hung: DoubleHungWindowSvg,
  single_hung: SingleHungWindowSvg,
  sliding: SlidingWindowSvg,
  bay: BayWindowSvg,
  bow: BowWindowSvg,
  awning: AwningWindowSvg,
  hopper: HopperWindowSvg,
  picture: PictureWindowSvg,
  arched: ArchedWindowSvg,
  tilt_and_turn: TiltAndTurnWindowSvg,
  skylight: SkylightWindowSvg,
  jalousie: JalousieWindowSvg,
  transom: TransomWindowSvg,
  garden: GardenWindowSvg,
  french_casement: FrenchCasementWindowSvg,
  dormer: DormerWindowSvg,
  clerestory: ClerestoryWindowSvg,
  round_oculus: RoundOculusWindowSvg,
  octagon: OctagonWindowSvg,
  trapezoid: TrapezoidWindowSvg,
  triangle: TriangleWindowSvg,
  gothic_lancet: GothicLancetWindowSvg,
  bifold: BifoldWindowSvg,
  pivot: PivotWindowSvg,
  corner_butt: CornerButtWindowSvg,
  pass_through: PassThroughWindowSvg,
  eyebrow: EyebrowWindowSvg,
  quarter_round: QuarterRoundWindowSvg,
  stained_glass: StainedGlassWindowSvg,
};
