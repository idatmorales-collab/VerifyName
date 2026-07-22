export interface AvatarOption {
  id: string;
  name: string;
  category: string;
  url: string;
}

// Helper function to safely convert SVG string with raw # hex colors into a valid Data URI
export function svgToDataUrl(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
}

// 1. Pizza Kawaii
const pizzaSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="bg-pizza" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#4c1d95"/>
    </linearGradient>
    <linearGradient id="crust" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <linearGradient id="cheese" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="50" fill="url(#bg-pizza)"/>
  <!-- Pizza Slice Crust -->
  <path d="M20 30 C35 18 65 18 80 30 L50 82 Z" fill="url(#crust)"/>
  <!-- Crust Top Rim -->
  <path d="M18 28 C35 15 65 15 82 28 C80 34 20 34 18 28 Z" fill="#b45309"/>
  <!-- Melted Cheese -->
  <path d="M22 34 C36 24 64 24 78 34 L50 78 Z" fill="url(#cheese)"/>
  <path d="M30 45 C32 50 36 50 38 45 M62 45 C64 50 68 50 70 45" stroke="#d97706" stroke-width="2" stroke-linecap="round" fill="none"/>
  <!-- Pepperoni Slices -->
  <circle cx="38" cy="42" r="6" fill="#ef4444"/>
  <circle cx="62" cy="42" r="6" fill="#ef4444"/>
  <circle cx="50" cy="58" r="7" fill="#dc2626"/>
  <!-- Cute Kawaii Face -->
  <circle cx="44" cy="48" r="2.5" fill="#18181b"/>
  <circle cx="56" cy="48" r="2.5" fill="#18181b"/>
  <circle cx="45" cy="47" r="0.8" fill="#ffffff"/>
  <circle cx="57" cy="47" r="0.8" fill="#ffffff"/>
  <!-- Pink Cheeks -->
  <circle cx="40" cy="51" r="3" fill="#fda4af" opacity="0.8"/>
  <circle cx="60" cy="51" r="3" fill="#fda4af" opacity="0.8"/>
  <!-- Smile -->
  <path d="M47 51 Q50 55 53 51" stroke="#18181b" stroke-width="2" stroke-linecap="round" fill="none"/>
  <!-- Sparkles -->
  <path d="M22 60 L24 62 L22 64 L20 62 Z M78 65 L80 67 L78 69 L76 67 Z" fill="#ffffff" opacity="0.9"/>
</svg>`;

// 2. Happy Dog (Bulldog Francés / Labrador)
const dogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="bg-dog" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#9a3412"/>
    </linearGradient>
    <linearGradient id="dog-fur" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fef3c7"/>
      <stop offset="100%" stop-color="#fde68a"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="50" fill="url(#bg-dog)"/>
  <!-- Dog Ears -->
  <path d="M22 28 C15 15 32 18 36 32 Z" fill="#d97706"/>
  <path d="M78 28 C85 15 68 18 64 32 Z" fill="#d97706"/>
  <path d="M25 28 C20 18 30 20 33 30 Z" fill="#fce7f3"/>
  <path d="M75 28 C80 18 70 20 67 30 Z" fill="#fce7f3"/>
  <!-- Head -->
  <ellipse cx="50" cy="52" rx="28" ry="24" fill="url(#dog-fur)"/>
  <ellipse cx="50" cy="60" rx="18" ry="14" fill="#ffffff"/>
  <!-- Eye Patches & Eyes -->
  <circle cx="38" cy="46" r="8" fill="#d97706" opacity="0.3"/>
  <circle cx="38" cy="46" r="4" fill="#0f172a"/>
  <circle cx="40" cy="44" r="1.5" fill="#ffffff"/>
  <circle cx="62" cy="46" r="4" fill="#0f172a"/>
  <circle cx="64" cy="44" r="1.5" fill="#ffffff"/>
  <!-- Cute Nose -->
  <path d="M45 54 C45 52 55 52 55 54 C55 58 45 58 45 54 Z" fill="#1e293b"/>
  <!-- Tongue sticking out -->
  <path d="M47 62 C47 70 53 70 53 62 Z" fill="#f43f5e"/>
  <!-- Mouth Smile -->
  <path d="M42 58 Q50 64 58 58" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  <!-- Collar -->
  <path d="M30 72 Q50 78 70 72" stroke="#3b82f6" stroke-width="5" stroke-linecap="round" fill="none"/>
  <circle cx="50" cy="76" r="3.5" fill="#fbbf24"/>
</svg>`;

// 3. Curious Cat
const catSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="bg-cat" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#06b6d4"/>
      <stop offset="100%" stop-color="#0e7490"/>
    </linearGradient>
    <linearGradient id="cat-fur" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="50" fill="url(#bg-cat)"/>
  <!-- Cat Pointy Ears -->
  <polygon points="22,42 28,16 44,32" fill="url(#cat-fur)"/>
  <polygon points="78,42 72,16 56,32" fill="url(#cat-fur)"/>
  <polygon points="26,38 30,22 40,32" fill="#fda4af"/>
  <polygon points="74,38 70,22 60,32" fill="#fda4af"/>
  <!-- Cat Head -->
  <ellipse cx="50" cy="52" rx="28" ry="22" fill="url(#cat-fur)"/>
  <!-- Big Lime Eyes -->
  <ellipse cx="36" cy="48" rx="7" ry="9" fill="#a3e635"/>
  <ellipse cx="64" cy="48" rx="7" ry="9" fill="#a3e635"/>
  <ellipse cx="36" cy="48" rx="3" ry="7" fill="#0f172a"/>
  <ellipse cx="64" cy="48" rx="3" ry="7" fill="#0f172a"/>
  <circle cx="38" cy="44" r="2" fill="#ffffff"/>
  <circle cx="66" cy="44" r="2" fill="#ffffff"/>
  <!-- Pink Nose & Whiskers -->
  <polygon points="47,56 53,56 50,60" fill="#f43f5e"/>
  <path d="M47 62 Q50 65 53 62" stroke="#f1f5f9" stroke-width="2" stroke-linecap="round" fill="none"/>
  <path d="M20 52 L32 54 M18 60 L31 58 M80 52 L68 54 M82 60 L69 58" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
  <!-- Cute paws -->
  <ellipse cx="38" cy="74" rx="7" ry="5" fill="#475569"/>
  <ellipse cx="62" cy="74" rx="7" ry="5" fill="#475569"/>
</svg>`;

// 4. Steaming Coffee Cup (Latte Art)
const coffeeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="bg-coffee" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#451a03"/>
    </linearGradient>
    <linearGradient id="cup-body" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="50" fill="url(#bg-coffee)"/>
  <!-- Vapor Steam -->
  <path d="M40 28 C36 22 44 18 40 12" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.7"/>
  <path d="M50 26 C46 20 54 16 50 10" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" fill="none" opacity="0.9"/>
  <path d="M60 28 C56 22 64 18 60 12" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.7"/>
  <!-- Saucer -->
  <ellipse cx="50" cy="78" rx="32" ry="8" fill="#e0f2fe"/>
  <!-- Cup Handle -->
  <path d="M68 44 C82 44 82 66 68 66" stroke="#0284c7" stroke-width="6" stroke-linecap="round" fill="none"/>
  <!-- Cup Body -->
  <path d="M26 38 L32 72 C33 76 67 76 68 72 L74 38 Z" fill="url(#cup-body)"/>
  <!-- Cup Rim Oval -->
  <ellipse cx="50" cy="38" rx="24" ry="7" fill="#e0f2fe"/>
  <!-- Coffee Liquid -->
  <ellipse cx="50" cy="38" rx="21" ry="5.5" fill="#78350f"/>
  <!-- Heart Latte Art -->
  <path d="M50 40 C46 35 40 37 42 41 C44 44 50 46 50 46 C50 46 56 44 58 41 C60 37 54 35 50 40 Z" fill="#fef3c7"/>
</svg>`;

// 5. Modern Comfortable Sofa
const sofaSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="bg-sofa" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
    <linearGradient id="velvet" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2dd4bf"/>
      <stop offset="100%" stop-color="#0f766e"/>
    </linearGradient>
    <linearGradient id="cushion" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#5eead4"/>
      <stop offset="100%" stop-color="#14b8a6"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="50" fill="url(#bg-sofa)"/>
  <!-- Wooden Legs -->
  <polygon points="26,72 22,86 27,86 31,72" fill="#d97706"/>
  <polygon points="74,72 78,86 73,86 69,72" fill="#d97706"/>
  <!-- Sofa Backrest -->
  <rect x="18" y="28" width="64" height="36" rx="10" fill="url(#velvet)"/>
  <!-- Tufted Buttons -->
  <circle cx="30" cy="38" r="2" fill="#0f766e"/>
  <circle cx="50" cy="38" r="2" fill="#0f766e"/>
  <circle cx="70" cy="38" r="2" fill="#0f766e"/>
  <!-- Armrests -->
  <rect x="12" y="42" width="14" height="30" rx="7" fill="#14b8a6"/>
  <rect x="74" y="42" width="14" height="30" rx="7" fill="#14b8a6"/>
  <!-- Seat Cushions -->
  <rect x="24" y="52" width="25" height="20" rx="5" fill="url(#cushion)"/>
  <rect x="51" y="52" width="25" height="20" rx="5" fill="url(#cushion)"/>
  <!-- Throw Pillow -->
  <rect x="28" y="44" width="14" height="14" rx="3" transform="rotate(-12 35 51)" fill="#f43f5e"/>
  <path d="M30 46 L38 54" stroke="#fb7185" stroke-width="2"/>
</svg>`;

// 6. Design Computer Monitor
const monitorSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="bg-mon" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3f3f46"/>
      <stop offset="100%" stop-color="#18181b"/>
    </linearGradient>
    <linearGradient id="screen-art" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#8b5cf6"/>
      <stop offset="50%" stop-color="#ec4899"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="50" fill="url(#bg-mon)"/>
  <!-- Outer Gold Glowing Ring -->
  <circle cx="50" cy="50" r="47" fill="none" stroke="#f59e0b" stroke-width="2.5" opacity="0.9"/>
  <!-- Monitor Stand Base -->
  <ellipse cx="50" cy="82" rx="18" ry="5" fill="#a1a1aa"/>
  <polygon points="46,66 54,66 52,82 48,82" fill="#71717a"/>
  <!-- Monitor Outer Frame -->
  <rect x="14" y="18" width="72" height="50" rx="6" fill="#18181b" stroke="#d4d4d8" stroke-width="2.5"/>
  <!-- Monitor Screen Display -->
  <rect x="18" y="22" width="64" height="42" rx="3" fill="url(#screen-art)"/>
  <!-- UI Design Elements on Screen -->
  <circle cx="34" cy="36" r="8" fill="#fef08a" opacity="0.9"/>
  <path d="M22 52 C35 32 50 60 62 38 L78 58 L18 58 Z" fill="#10b981" opacity="0.8"/>
  <!-- Color Palette Swatches -->
  <rect x="64" y="26" width="5" height="5" rx="1" fill="#ffffff"/>
  <rect x="64" y="33" width="5" height="5" rx="1" fill="#f59e0b"/>
  <rect x="64" y="40" width="5" height="5" rx="1" fill="#06b6d4"/>
  <!-- Power LED -->
  <circle cx="50" cy="65.5" r="1.2" fill="#10b981"/>
</svg>`;

export const PRESET_AVATARS: AvatarOption[] = [
  {
    id: 'pizza-kawaii',
    name: 'Rebanada Pizza Kawaii',
    category: 'Ilustrados',
    url: svgToDataUrl(pizzaSvg)
  },
  {
    id: 'happy-dog',
    name: 'Perro Feliz',
    category: 'Ilustrados',
    url: svgToDataUrl(dogSvg)
  },
  {
    id: 'curious-cat',
    name: 'Gato Curioso',
    category: 'Ilustrados',
    url: svgToDataUrl(catSvg)
  },
  {
    id: 'steaming-coffee',
    name: 'Café Latte Art',
    category: 'Ilustrados',
    url: svgToDataUrl(coffeeSvg)
  },
  {
    id: 'modern-sofa',
    name: 'Sofá Moderno',
    category: 'Ilustrados',
    url: svgToDataUrl(sofaSvg)
  },
  {
    id: 'design-monitor',
    name: 'Monitor de Diseño',
    category: 'Ilustrados',
    url: svgToDataUrl(monitorSvg)
  }
];

// Helper to get an avatar by index or fallback
export function getAvatarByIndex(index: number): string {
  return PRESET_AVATARS[index % PRESET_AVATARS.length].url;
}

// Map user names or usernames to distinct avatars from the illustrated collection
export function getUserAvatarByUsername(username: string, customAvatarUrl?: string): string {
  if (customAvatarUrl && customAvatarUrl.trim() !== '') {
    return customAvatarUrl;
  }
  const clean = (username || '').toLowerCase();
  if (clean.includes('renzo')) return PRESET_AVATARS[5].url; // Monitor de Diseño
  if (clean.includes('elena')) return PRESET_AVATARS[4].url; // Sofá Moderno
  if (clean.includes('diseno') || clean.includes('diseño')) return PRESET_AVATARS[0].url; // Pizza Kawaii
  if (clean.includes('carlos')) return PRESET_AVATARS[1].url; // Perro Feliz
  if (clean.includes('sofia') || clean.includes('valdes')) return PRESET_AVATARS[2].url; // Gato Curioso
  if (clean.includes('admin')) return PRESET_AVATARS[3].url; // Café Latte Art

  // Hash-based pick
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % PRESET_AVATARS.length;
  return PRESET_AVATARS[idx].url;
}
