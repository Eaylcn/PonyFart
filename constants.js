// Oyun sabitleri
export const GameState = {
    MENU: 'menu',
    CHARACTER_SELECT: 'character_select',
    PLAYING: 'playing',
    PAUSED: 'paused'
};

// Oyun modları
export const GameMode = {
    PEACEFUL: 'peaceful',
    CHALLENGE: 'challenge'
};

// Fizik sabitleri
export const GRAVITY = 0.03;
export const FLAP_SPEED = -2;
export const MAX_VELOCITY = 1.5;
export const FORWARD_SPEED = 0.7;

// Pony varyantları
export const PONY_VARIANTS = [
    'pony',          // Pembe (varsayılan)
    'pony-white',    // Beyaz
    'pony-black',    // Siyah
    'pony-red',      // Kırmızı
    'pony-blue',     // Mavi
    'pony-green',    // Yeşil
    'pony-yellow',   // Sarı
    'pony-purple'    // Mor
];

// Pony isimleri
export const PONY_NAMES = {
    'pony': 'PEMBE',
    'pony-white': 'BEYAZ',
    'pony-black': 'SİYAH',
    'pony-red': 'KIRMIZI',
    'pony-blue': 'MAVİ',
    'pony-green': 'YEŞİL',
    'pony-yellow': 'SARI',
    'pony-purple': 'MOR'
};

// Renk sabitleri
export const RAINBOW_COLORS = [
    '#FF0000', // Kırmızı
    '#FFFF00', // Sarı
    '#00FF00', // Yeşil
    '#0000FF', // Mavi
    '#4B0082', // Indigo
    '#8F00FF'  // Mor
];

export const FART_COLORS = [
    { r: 255, g: 105, b: 180 }, // Hot Pink
    { r: 255, g: 20, b: 147 },  // Deep Pink
    { r: 219, g: 112, b: 147 }, // Pale Violet Red
    { r: 199, g: 21, b: 133 },  // Medium Violet Red
    { r: 218, g: 112, b: 214 }, // Orchid
    { r: 186, g: 85, b: 211 }   // Medium Orchid
];

// Yıldız katmanları
export const STAR_LAYERS = [
    { count: 25, size: 3, speed: 1.0, brightness: 0.9 },
    { count: 35, size: 2, speed: 0.7, brightness: 0.7 },
    { count: 50, size: 1, speed: 0.4, brightness: 0.5 }
];

// Diğer sabitler
export const AURORA_POINTS = 4;
export const PARTICLE_COUNT = 15;
export const PARTICLE_SIZE = 2;
export const PARTICLE_LIFETIME = 20;
export const HEART_SPAWN_CHANCE = 0.001;
export const BLACK_HOLE_SPAWN_CHANCE = 0.00008; 