interface Props {
  status: 'AVAILABLE' | 'PLAYING' | 'PAUSED'
  timerText?: string
  amountText?: string
  foodText?: string
}

const feltColor = {
  AVAILABLE: '#166534',
  PLAYING: '#14532d',
  PAUSED: '#3b3000',
}

const feltGlow = {
  AVAILABLE: '#15803d',
  PLAYING: '#16a34a',
  PAUSED: '#ca8a04',
}

export function BilliardTableSVG({ status, timerText, amountText, foodText }: Props) {
  const felt = feltColor[status]
  const glow = feltGlow[status]

  return (
    <svg
      viewBox="0 0 220 148"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full drop-shadow-xl"
    >
      <defs>
        <radialGradient id={`felt-${status}`} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={glow} stopOpacity="0.5" />
          <stop offset="100%" stopColor={felt} stopOpacity="1" />
        </radialGradient>
        <filter id="pocket-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.8" />
        </filter>
        <filter id="glow-filter">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer shadow */}
      <rect x="2" y="2" width="216" height="144" rx="10" fill="#000" opacity="0.4" />

      {/* Wood outer frame */}
      <rect x="0" y="0" width="216" height="144" rx="10" fill="#7c3f1e" />

      {/* Wood grain highlight */}
      <rect x="0" y="0" width="216" height="144" rx="10"
        fill="url(#wood-grain)" opacity="0.15" />

      {/* Inner rail */}
      <rect x="6" y="6" width="204" height="132" rx="7" fill="#5c2d0e" />

      {/* Felt surface */}
      <rect x="20" y="20" width="176" height="108" fill={`url(#felt-${status})`} />

      {/* Felt border highlight (cushion) */}
      <rect x="20" y="20" width="176" height="108"
        fill="none" stroke={glow} strokeWidth="1.5" opacity="0.4" />

      {/* Center line (decorative) */}
      <line x1="108" y1="26" x2="108" y2="122"
        stroke={glow} strokeWidth="0.5" opacity="0.25" strokeDasharray="3,4" />
      <line x1="26" y1="74" x2="190" y2="74"
        stroke={glow} strokeWidth="0.5" opacity="0.25" strokeDasharray="3,4" />

      {/* Center spot */}
      <circle cx="108" cy="74" r="2.5" fill={glow} opacity="0.5" />

      {/* Diamond rail markers - top */}
      <polygon points="63,20 66,16 69,20" fill={glow} opacity="0.6" />
      <polygon points="149,20 152,16 155,20" fill={glow} opacity="0.6" />
      {/* Diamond rail markers - bottom */}
      <polygon points="63,128 66,132 69,128" fill={glow} opacity="0.6" />
      <polygon points="149,128 152,132 155,128" fill={glow} opacity="0.6" />
      {/* Diamond rail markers - left */}
      <polygon points="20,47 16,50 20,53" fill={glow} opacity="0.6" />
      <polygon points="20,95 16,98 20,101" fill={glow} opacity="0.6" />
      {/* Diamond rail markers - right */}
      <polygon points="196,47 200,50 196,53" fill={glow} opacity="0.6" />
      <polygon points="196,95 200,98 196,101" fill={glow} opacity="0.6" />

      {/* 6 Pockets */}
      {/* Corner TL */}
      <circle cx="20" cy="20" r="8" fill="#0a0a0a" filter="url(#pocket-shadow)" />
      <circle cx="20" cy="20" r="5.5" fill="#111827" />
      <circle cx="18" cy="18" r="1.5" fill="#374151" opacity="0.6" />

      {/* Corner TR */}
      <circle cx="196" cy="20" r="8" fill="#0a0a0a" filter="url(#pocket-shadow)" />
      <circle cx="196" cy="20" r="5.5" fill="#111827" />
      <circle cx="194" cy="18" r="1.5" fill="#374151" opacity="0.6" />

      {/* Corner BL */}
      <circle cx="20" cy="128" r="8" fill="#0a0a0a" filter="url(#pocket-shadow)" />
      <circle cx="20" cy="128" r="5.5" fill="#111827" />
      <circle cx="18" cy="126" r="1.5" fill="#374151" opacity="0.6" />

      {/* Corner BR */}
      <circle cx="196" cy="128" r="8" fill="#0a0a0a" filter="url(#pocket-shadow)" />
      <circle cx="196" cy="128" r="5.5" fill="#111827" />
      <circle cx="194" cy="126" r="1.5" fill="#374151" opacity="0.6" />

      {/* Middle Left */}
      <circle cx="13" cy="74" r="7" fill="#0a0a0a" filter="url(#pocket-shadow)" />
      <circle cx="13" cy="74" r="5" fill="#111827" />
      <circle cx="12" cy="72.5" r="1.2" fill="#374151" opacity="0.6" />

      {/* Middle Right */}
      <circle cx="203" cy="74" r="7" fill="#0a0a0a" filter="url(#pocket-shadow)" />
      <circle cx="203" cy="74" r="5" fill="#111827" />
      <circle cx="202" cy="72.5" r="1.2" fill="#374151" opacity="0.6" />

      {/* Content overlay */}
      {status === 'AVAILABLE' && (
        <g>
          <text x="108" y="70" textAnchor="middle" fill={glow}
            fontSize="11" fontFamily="monospace" fontWeight="bold" opacity="0.7">
            TRỐNG
          </text>
          <text x="108" y="84" textAnchor="middle" fill={glow}
            fontSize="8" fontFamily="sans-serif" opacity="0.5">
            Nhấn để mở bàn
          </text>
        </g>
      )}

      {(status === 'PLAYING' || status === 'PAUSED') && timerText && (
        <g>
          {/* Timer bg pill */}
          <rect x="62" y="55" width="92" height="38" rx="6"
            fill="#000" opacity="0.45" />
          <text x="108" y="73" textAnchor="middle"
            fill={status === 'PLAYING' ? '#4ade80' : '#fbbf24'}
            fontSize="16" fontFamily="monospace" fontWeight="bold"
            letterSpacing="2"
            filter="url(#glow-filter)">
            {timerText}
          </text>
          {amountText && (
            <text x="108" y="86" textAnchor="middle"
              fill="#fde68a" fontSize="9" fontFamily="monospace" fontWeight="600">
              {amountText}
            </text>
          )}
        </g>
      )}

      {foodText && (
        <text x="108" y="116" textAnchor="middle"
          fill="#94a3b8" fontSize="7.5" fontFamily="sans-serif">
          {foodText}
        </text>
      )}

      {/* Status glow indicator (top-right of frame) */}
      <circle cx="203" cy="11"
        r="4"
        fill={status === 'PLAYING' ? '#22c55e' : status === 'PAUSED' ? '#eab308' : '#6b7280'}
        filter="url(#glow-filter)"
        opacity="0.9"
      />
    </svg>
  )
}
