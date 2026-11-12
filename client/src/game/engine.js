
import { WIDTH, HEIGHT } from "./levels.js";

export const WORM_SIZE = { width: 70, height: 35 };

const SPEED = 3.5;
const GRAVITY = 0.45;
const JUMP_POWER = -10;
const APPLE_RADIUS = 17;
const PLATFORM_HEIGHT = 35;
const SPIKE_HEIGHT = 22;
const EPS = 0.01;

const isSolid = (platform) => !platform.move;

// Save the last safe game state for REVIVE
function saveCheckpoint(game) {
  game.checkpoint = {
    t: game.t,
    score: game.score,

    worm: {
      x: game.worm.x,
      y: game.worm.y,
      velocityX: game.worm.velocityX,
      velocityY: game.worm.velocityY,
      onGround: game.worm.onGround,
      standingOn: game.worm.standingOn
        ? game.platforms.indexOf(game.worm.standingOn)
        : null,
    },

    platforms: game.platforms.map((platform) => ({
      x: platform.x,
      y: platform.y,
      dx: platform.dx,
      dy: platform.dy,
    })),

    hazards: game.hazards.map((hazard) => ({
      x: hazard.x,
      y: hazard.y,
      dx: hazard.dx,
      dy: hazard.dy,
    })),

    apples: game.apples.map((apple) => apple.collected),
  };
}

// Restore the last safe state after death
export function reviveGame(game) {
  if (!game || game.status !== "dead" || !game.checkpoint) {
    return false;
  }

  const checkpoint = game.checkpoint;

  game.t = checkpoint.t;
  game.score = checkpoint.score;

  Object.assign(game.worm, {
    x: checkpoint.worm.x,
    y: checkpoint.worm.y,
    velocityX: checkpoint.worm.velocityX,
    velocityY: checkpoint.worm.velocityY,
    onGround: checkpoint.worm.onGround,
    standingOn:
      checkpoint.worm.standingOn === null
        ? null
        : game.platforms[checkpoint.worm.standingOn] || null,
  });

  game.platforms.forEach((platform, index) => {
    Object.assign(platform, checkpoint.platforms[index]);
  });

  game.hazards.forEach((hazard, index) => {
    Object.assign(hazard, checkpoint.hazards[index]);
  });

  game.apples.forEach((apple, index) => {
    apple.collected = checkpoint.apples[index];
  });

  game.status = "playing";

  // Clear any held controls before play resumes
  game.worm.velocityX = 0;
  game.worm.velocityY = 0;

  saveCheckpoint(game);

  return true;
}

export function createGame(level) {
  const game = {
    t: 0,
    status: "playing",
    score: 0,

    worm: {
      x: level.worm.x,
      y: level.worm.y,
      ...WORM_SIZE,
      velocityX: 0,
      velocityY: 0,
      onGround: false,
      standingOn: null,
    },

    platforms: level.platforms.map((p) => ({
      ...p,
      height: p.height ?? PLATFORM_HEIGHT,
      baseX: p.x,
      baseY: p.y,
      dx: 0,
      dy: 0,
    })),

    apples: level.apples.map((a) => ({
      ...a,
      collected: false,
    })),

    hazards: level.hazards.map((h) => ({
      ...h,
      baseX: h.x,
      baseY: h.y,
      dx: 0,
      dy: 0,
    })),

    spikes: (level.spikes || []).map((s) => ({
      height: SPIKE_HEIGHT,
      ...s,
    })),

    goal: { ...level.goal },
  };

  // Initial safe checkpoint
  saveCheckpoint(game);

  return game;
}

const wave = (move, t) =>
  Math.sin(t * move.speed + (move.phase || 0)) * move.range;

const applyMotion = (item, t) => {
  if (!item.move) return;

  const nextX =
    item.baseX + (item.move.axis === "x" ? wave(item.move, t) : 0);

  const nextY =
    item.baseY + (item.move.axis === "y" ? wave(item.move, t) : 0);

  item.dx = nextX - item.x;
  item.dy = nextY - item.y;
  item.x = nextX;
  item.y = nextY;
};

const overlapsBlock = (worm, p) =>
  worm.x < p.x + p.width &&
  worm.x + worm.width > p.x &&
  worm.y < p.y + p.height - EPS &&
  worm.y + worm.height > p.y + EPS;

// input = { left, right, jump }
export function stepGame(game, input) {
  if (game.status !== "playing") return;

  game.t += 1;

  game.platforms.forEach((p) => applyMotion(p, game.t));
  game.hazards.forEach((h) => applyMotion(h, game.t));

  const worm = game.worm;

  if (worm.standingOn) {
    worm.x += worm.standingOn.dx;
    worm.y += worm.standingOn.dy;
  }

  if (input.left) {
    worm.velocityX = -SPEED;
  } else if (input.right) {
    worm.velocityX = SPEED;
  } else {
    worm.velocityX = 0;
  }

  if (input.jump && worm.onGround) {
    worm.velocityY = JUMP_POWER;
    worm.onGround = false;
  }

  worm.x += worm.velocityX;

  for (const platform of game.platforms) {
    if (!isSolid(platform) || !overlapsBlock(worm, platform)) continue;

    if (worm.velocityX > 0) {
      worm.x = platform.x - worm.width;
    } else if (worm.velocityX < 0) {
      worm.x = platform.x + platform.width;
    }
  }

  const previousY = worm.y;

  worm.velocityY += GRAVITY;
  worm.y += worm.velocityY;

  worm.onGround = false;
  worm.standingOn = null;

  for (const platform of game.platforms) {
    const overlapsX =
      worm.x + worm.width > platform.x &&
      worm.x < platform.x + platform.width;

    if (!overlapsX) continue;

    const previousBottom = previousY + worm.height;
    const currentBottom = worm.y + worm.height;
    const slack = isSolid(platform) ? 0.5 : 4;

    if (
      worm.velocityY >= 0 &&
      previousBottom <= platform.y + slack &&
      currentBottom >= platform.y
    ) {
      worm.y = platform.y - worm.height;
      worm.velocityY = 0;
      worm.onGround = true;
      worm.standingOn = platform;
    } else if (
      isSolid(platform) &&
      worm.velocityY < 0 &&
      previousY >= platform.y + platform.height - 0.5 &&
      worm.y < platform.y + platform.height
    ) {
      worm.y = platform.y + platform.height;
      worm.velocityY = 0;
    }
  }

  // World boundaries
  if (worm.x < 0) worm.x = 0;

  if (worm.x + worm.width > WIDTH) {
    worm.x = WIDTH - worm.width;
  }

  // Fell off the world
  if (worm.y > HEIGHT) {
    game.status = "dead";
    return;
  }

  // Spikes
  for (const spike of game.spikes) {
    const touching =
      worm.x + worm.width - 6 > spike.x + 4 &&
      worm.x + 6 < spike.x + spike.width - 4 &&
      worm.y + worm.height > spike.y + 8 &&
      worm.y < spike.y + spike.height;

    if (touching) {
      game.status = "dead";
      return;
    }
  }

  // Apple collection
  game.apples.forEach((apple) => {
    if (apple.collected) return;

    const touching =
      worm.x < apple.x + APPLE_RADIUS &&
      worm.x + worm.width > apple.x - APPLE_RADIUS &&
      worm.y < apple.y + APPLE_RADIUS &&
      worm.y + worm.height > apple.y - APPLE_RADIUS;

    if (touching) {
      apple.collected = true;
      game.score += 10;
    }
  });

  // Hazard collision
  const wormCenterX = worm.x + worm.width / 2;
  const wormCenterY = worm.y + worm.height / 2;

  for (const hazard of game.hazards) {
    const distance = Math.hypot(
      wormCenterX - hazard.x,
      wormCenterY - hazard.y
    );

    if (distance < hazard.radius + 15) {
      game.status = "dead";
      return;
    }
  }

  // Goal validation
  const goal = game.goal;
  const allApplesCollected = game.apples.every(
    (apple) => apple.collected
  );

  if (
    allApplesCollected &&
    worm.x + worm.width > goal.x &&
    worm.x < goal.x + goal.width &&
    worm.y + worm.height > goal.y &&
    worm.y < goal.y + goal.height
  ) {
    game.status = "won";
  }

  // Save state only after surviving the current movement
  saveCheckpoint(game);
}
