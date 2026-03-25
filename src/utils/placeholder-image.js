const ACCENTS = ["#dcd7cd", "#d5dbd1", "#e1d6d6", "#d6dae3"];

export function createPlaceholderImage({ label, index = 0 }) {
  const accent = ACCENTS[index % ACCENTS.length];
  const offset = 80 + index * 18;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" fill="none">
      <rect width="1200" height="900" fill="#ffffff"/>
      <rect x="28" y="28" width="1144" height="844" rx="20" stroke="#1A1A1A" stroke-opacity="0.22" stroke-width="2"/>
      <path d="M120 ${offset}H1080" stroke="#1A1A1A" stroke-opacity="0.12" stroke-width="2"/>
      <path d="M120 730L420 430L700 610L1010 250" stroke="#1A1A1A" stroke-width="3"/>
      <circle cx="420" cy="430" r="16" fill="${accent}" stroke="#1A1A1A" stroke-width="2"/>
      <circle cx="700" cy="610" r="16" fill="${accent}" stroke="#1A1A1A" stroke-width="2"/>
      <circle cx="1010" cy="250" r="16" fill="${accent}" stroke="#1A1A1A" stroke-width="2"/>
      <rect x="130" y="120" width="280" height="180" rx="14" fill="${accent}"/>
      <text x="130" y="806" fill="#1A1A1A" font-family="Inter, Arial, sans-serif" font-size="34" letter-spacing="2">
        PLACEHOLDER IMAGE
      </text>
      <text x="130" y="856" fill="#1A1A1A" font-family="Playfair Display, Georgia, serif" font-size="58">
        ${label}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
