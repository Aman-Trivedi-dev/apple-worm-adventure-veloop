
export const WIDTH = 900;
export const HEIGHT = 520;

export const LEVELS = [
  {
    id: 1,
    name: "Zigzag Start",
    difficulty: "Easy",
    accent: "#2e8b3c",
    pattern: "A zigzag of two blocks with one spiral to jump over",
    worm: { x: 70, y: 295 },
    platforms: [
      { x: 50, y: 330, width: 280, height: 40 },
      { x: 290, y: 410, width: 580, height: 40 },
    ],
    apples: [
      { x: 290, y: 300 },
      { x: 480, y: 380 },
      { x: 620, y: 380 },
    ],
    spikes: [],
    hazards: [{ x: 730, y: 372, radius: 26 }],
    goal: { x: 830, y: 360, width: 35, height: 50 },
  },

  {
    id: 2,
    name: "Staircase",
    difficulty: "Easy",
    accent: "#2e8b3c",
    pattern: "Solid steps going up, then a drop past a spiral",
    worm: { x: 60, y: 405 },
    platforms: [
      { x: 40, y: 440, width: 120, height: 80 },
      { x: 160, y: 395, width: 120, height: 125 },
      { x: 280, y: 350, width: 120, height: 170 },
      { x: 400, y: 305, width: 120, height: 215 },
      { x: 520, y: 260, width: 120, height: 260 },
      { x: 690, y: 340, width: 200, height: 40 },
    ],
    apples: [
      { x: 100, y: 410 },
      { x: 220, y: 365 },
      { x: 340, y: 320 },
      { x: 460, y: 275 },
      { x: 580, y: 230 },
    ],
    spikes: [],
    hazards: [{ x: 770, y: 305, radius: 24 }],
    goal: { x: 850, y: 290, width: 35, height: 50 },
  },

  {
    id: 3,
    name: "Spike Alley",
    difficulty: "Medium",
    accent: "#d9902b",
    pattern: "A flat floor with spike traps and a raised block",
    worm: { x: 40, y: 405 },
    platforms: [
      { x: 0, y: 440, width: 900, height: 80 },
      { x: 520, y: 380, width: 110, height: 60 },
    ],
    apples: [
      { x: 230, y: 370 },
      { x: 385, y: 360 },
      { x: 575, y: 350 },
      { x: 745, y: 370 },
    ],
    spikes: [
      { x: 210, y: 418, width: 40 },
      { x: 360, y: 418, width: 50 },
      { x: 720, y: 418, width: 50 },
    ],
    hazards: [],
    goal: { x: 850, y: 390, width: 35, height: 50 },
  },

  {
    id: 4,
    name: "Under the Plank",
    difficulty: "Medium",
    accent: "#d9902b",
    pattern: "Apples hidden under an overhang, then climb a wall",
    worm: { x: 120, y: 295 },
    platforms: [
      { x: 60, y: 440, width: 560, height: 80 },
      { x: 100, y: 330, width: 300, height: 40 },
      { x: 620, y: 350, width: 90, height: 170 },
      { x: 710, y: 270, width: 180, height: 40 },
    ],
    apples: [
      { x: 330, y: 300 },
      { x: 200, y: 410 },
      { x: 300, y: 410 },
      { x: 665, y: 320 },
      { x: 800, y: 240 },
    ],
    spikes: [],
    hazards: [{ x: 520, y: 395, radius: 24 }],
    goal: { x: 850, y: 220, width: 35, height: 50 },
  },

  {
    id: 5,
    name: "Switchback",
    difficulty: "Hard",
    accent: "#d2552f",
    pattern: "Climb right, then turn back left along upper ledges",
    worm: { x: 50, y: 405 },
    platforms: [
      { x: 30, y: 440, width: 500, height: 80 },
      { x: 530, y: 390, width: 100, height: 130 },
      { x: 630, y: 340, width: 110, height: 180 },
      { x: 250, y: 250, width: 440, height: 40 },
      { x: 30, y: 180, width: 200, height: 40 },
    ],
    apples: [
      { x: 175, y: 380 },
      { x: 380, y: 380 },
      { x: 580, y: 360 },
      { x: 710, y: 310 },
      { x: 480, y: 220 },
      { x: 130, y: 150 },
    ],
    spikes: [
      { x: 150, y: 418, width: 50 },
      { x: 350, y: 418, width: 60 },
    ],
    hazards: [{ x: 470, y: 400, radius: 24 }],
    goal: { x: 60, y: 130, width: 35, height: 50 },
  },

  {
    id: 6,
    name: "Moving Bridge",
    difficulty: "Hard",
    accent: "#d2552f",
    pattern: "Platforms that slide sideways and lift up and down",
    worm: { x: 60, y: 385 },
    platforms: [
      { x: 30, y: 420, width: 170, height: 35 },
      { x: 330, y: 400, width: 120, height: 35, move: { axis: "x", range: 90, speed: 0.025 } },
      { x: 570, y: 350, width: 150, height: 35 },
      { x: 740, y: 300, width: 110, height: 35, move: { axis: "y", range: 60, speed: 0.03 } },
      { x: 790, y: 180, width: 100, height: 35 },
    ],
    apples: [
      { x: 150, y: 375 },
      { x: 390, y: 330 },
      { x: 620, y: 305 },
      { x: 770, y: 195 },
      { x: 810, y: 135 },
    ],
    spikes: [],
    hazards: [{ x: 640, y: 270, radius: 26 }],
    goal: { x: 850, y: 130, width: 35, height: 50 },
  },

  {
    id: 7,
    name: "Hazard Garden",
    difficulty: "Expert",
    accent: "#8a3fb0",
    pattern: "Moving platforms and moving spirals together",
    worm: { x: 50, y: 405 },
    platforms: [
      { x: 20, y: 440, width: 150, height: 35 },
      { x: 270, y: 400, width: 100, height: 35, move: { axis: "x", range: 70, speed: 0.025 } },
      { x: 480, y: 350, width: 100, height: 35 },
      { x: 630, y: 300, width: 90, height: 35 },
      { x: 790, y: 230, width: 100, height: 35, move: { axis: "y", range: 60, speed: 0.03 } },
      { x: 700, y: 110, width: 110, height: 35 },
    ],
    apples: [
      { x: 110, y: 395 },
      { x: 300, y: 340 },
      { x: 530, y: 305 },
      { x: 670, y: 255 },
      { x: 850, y: 140 },
      { x: 730, y: 65 },
    ],
    spikes: [],
    hazards: [
      { x: 590, y: 235, radius: 25, move: { axis: "x", range: 60, speed: 0.04 } },
      { x: 745, y: 200, radius: 22, move: { axis: "y", range: 50, speed: 0.045, phase: 1 } },
    ],
    goal: { x: 770, y: 60, width: 35, height: 50 },
  },
];

// Easier version of a level, used after the player's first game over on it:
// fewer and narrower spikes, one smaller and slower spiral, and wider and
// slower moving platforms. A level can set its own `easy` overrides instead.
export const getEasyLevel = (level) => {
  if (level.easy) return { ...level, ...level.easy };

  return {
    ...level,
    platforms: level.platforms.map((p) =>
      p.move
        ? {
            ...p,
            x: Math.max(0, p.x - 20),
            width: p.width + 40,
            move: { ...p.move, speed: p.move.speed * 0.6 },
          }
        : p,
    ),
    spikes: (level.spikes || [])
      .filter((_, index) => index % 2 === 0)
      .map((s) => {
        const width = Math.round(s.width * 0.75);
        return { ...s, x: s.x + Math.round((s.width - width) / 2), width };
      }),
    hazards: level.hazards.slice(0, 1).map((h) => ({
      ...h,
      radius: Math.round(h.radius * 0.8),
      move: h.move && { ...h.move, speed: h.move.speed * 0.55 },
    })),
  };
};

export const getLevel = (id) => {
  const number = parseInt(id, 10);
  const safe = Number.isFinite(number) ? number : 1;
  return LEVELS[Math.min(Math.max(safe, 1), LEVELS.length) - 1];
};