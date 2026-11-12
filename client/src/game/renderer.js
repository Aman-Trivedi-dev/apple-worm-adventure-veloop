
import { WIDTH, HEIGHT } from "./levels";

// Draw clouds in the background
const drawCloud = (ctx, cx, cy, s) => {
  ctx.fillStyle = "rgba(255,255,255,.7)";
  ctx.beginPath();
  ctx.arc(cx, cy, 22 * s, 0, Math.PI * 2);
  ctx.arc(cx + 26 * s, cy - 10 * s, 28 * s, 0, Math.PI * 2);
  ctx.arc(cx + 56 * s, cy, 22 * s, 0, Math.PI * 2);
  ctx.rect(cx, cy, 56 * s, 22 * s);
  ctx.fill();
};

// Draw buildings in the background
const drawSkyline = (ctx, color, seed, minH, varH, baseY) => {
  ctx.fillStyle = color;

  for (let i = 0; i < Math.ceil(WIDTH / 22) + 2; i++) {
    const bw = 24 + ((i * seed) % 4) * 9;
    const bh = minH + ((i * seed * 31) % varH);
    const x = i * 24;

    ctx.fillRect(x, baseY - bh, bw, bh + (HEIGHT - baseY));
  }
};

// Draw the game background
const drawBackground = (ctx) => {
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, "#a8dcf0");
  sky.addColorStop(0.55, "#cdeef7");
  sky.addColorStop(1, "#e4f6f4");

  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  drawCloud(ctx, WIDTH * 0.2, HEIGHT * 0.38, 1.2);
  drawCloud(ctx, WIDTH * 0.62, HEIGHT * 0.46, 1);

  drawSkyline(ctx, "rgba(160,205,225,.45)", 7, 80, 150, HEIGHT - 10);
  drawSkyline(ctx, "rgba(140,190,215,.55)", 5, 40, 110, HEIGHT + 5);

  const haze = ctx.createLinearGradient(0, HEIGHT - 80, 0, HEIGHT);
  haze.addColorStop(0, "rgba(255,255,255,0)");
  haze.addColorStop(1, "rgba(255,255,255,.45)");

  ctx.fillStyle = haze;
  ctx.fillRect(0, HEIGHT - 80, WIDTH, 80);
};

// Draw platforms
const drawPlatform = (ctx, platform) => {
  const moving = Boolean(platform.move);
  const { x, y, width: w, height: h } = platform;

  const base = moving ? "#8fc0e0" : "#a8683a";
  const light = moving ? "#cfeaff" : "#c8884e";
  const dark = moving ? "#5b93b8" : "#7d4a28";
  const line = moving ? "#3f7698" : "#6a3d1f";

  const r = Math.min(8, h / 2, w / 2);
  const d = Math.min(9, h / 2);

  ctx.save();

  ctx.fillStyle = "rgba(40,70,95,.16)";
  ctx.beginPath();
  ctx.roundRect(x + 4, y + 6, w, h, r);
  ctx.fill();

  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();

  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.roundRect(
    x + d * 0.5,
    y + d * 0.5,
    w - d * 0.9,
    h - d * 0.9,
    Math.max(2, r - 2)
  );
  ctx.fill();

  ctx.fillStyle = light;
  ctx.beginPath();
  ctx.roundRect(
    x + d * 0.5,
    y + d * 0.5,
    w - d * 0.9,
    Math.min(d + 2, h * 0.35),
    Math.max(2, r - 2)
  );
  ctx.fill();

  ctx.strokeStyle = line;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(x + 1, y + 1, w - 2, h - 2, r);
  ctx.stroke();

  if (!moving) {
    ctx.strokeStyle = "rgba(90,48,22,.22)";
    ctx.lineWidth = 1.5;

    for (let gx = x + 28; gx < x + w - 12; gx += 56) {
      ctx.beginPath();
      ctx.moveTo(gx, y + d + 4);
      ctx.lineTo(gx, y + h - d);
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = "#2f5f80";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      platform.move.axis === "x" ? "↔" : "↕",
      x + w / 2,
      y + h - 6
    );
    ctx.textAlign = "start";
  }

  ctx.restore();
};

// Draw apples
const drawApple = (ctx, apple, t = 0) => {
  if (apple.collected) return;

  ctx.save();

  const bob = Math.sin(t * 0.08 + apple.x * 0.02) * 2;
  ctx.translate(apple.x, apple.y + bob);

  ctx.shadowColor = "rgba(120,35,20,.22)";
  ctx.shadowBlur = 7;
  ctx.shadowOffsetY = 3;

  const red = ctx.createRadialGradient(-6, -7, 2, 0, 0, 19);
  red.addColorStop(0, "#ff7770");
  red.addColorStop(0.55, "#f32935");
  red.addColorStop(1, "#bd1023");

  ctx.fillStyle = red;
  ctx.beginPath();
  ctx.arc(-7, 1, 12, 0, Math.PI * 2);
  ctx.arc(7, 1, 12, 0, Math.PI * 2);
  ctx.quadraticCurveTo(0, 22, -14, 8);
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "#6e3a20";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.quadraticCurveTo(1, -20, 5, -21);
  ctx.stroke();

  ctx.fillStyle = "#4caf50";
  ctx.beginPath();
  ctx.ellipse(9, -17, 8, 4, -0.55, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,.55)";
  ctx.beginPath();
  ctx.ellipse(-9, -5, 3, 6, -0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

// Draw the worm
const drawWorm = (ctx, worm) => {
  ctx.save();

  const { x, y, width: w, height: h } = worm;

  ctx.fillStyle = "rgba(43,104,22,.18)";
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h + 4, w * 0.48, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  const body = ctx.createLinearGradient(x, y, x, y + h);
  body.addColorStop(0, "#7fe03a");
  body.addColorStop(0.5, "#4cc41f");
  body.addColorStop(1, "#2f9f17");

  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.roundRect(x, y + 2, w, h - 3, h / 2);
  ctx.fill();

  ctx.strokeStyle = "#1f7a12";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  for (let i = 1; i < 5; i++) {
    const sx = x + i * 13;

    ctx.strokeStyle = "rgba(34,139,19,.42)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sx, y + h / 2, 9, -1.15, 1.15);
    ctx.stroke();
  }

  const hx = x + w - 7;
  const hy = y + h / 2;

  ctx.fillStyle = "#5fd62e";
  ctx.beginPath();
  ctx.ellipse(hx, hy, 16, 17, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#1f7a12";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.ellipse(hx + 5, hy - 5, 6, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#1f7a12";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "#18331a";
  ctx.beginPath();
  ctx.arc(hx + 7, hy - 4, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#1f7a12";
  ctx.beginPath();
  ctx.arc(hx + 7, hy + 6, 5, 0.15, 1.25);
  ctx.stroke();

  ctx.restore();
};

// Draw hazards
const drawHazard = (ctx, hazard) => {
  ctx.save();

  const r = hazard.radius;
  const gradient = ctx.createRadialGradient(
    hazard.x - r * 0.3,
    hazard.y - r * 0.35,
    2,
    hazard.x,
    hazard.y,
    r
  );

  gradient.addColorStop(0, "#56516f");
  gradient.addColorStop(0.6, "#28263e");
  gradient.addColorStop(1, "#11111e");

  ctx.shadowColor = "rgba(30,25,50,.28)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(hazard.x, hazard.y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(255,255,255,.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(hazard.x, hazard.y, r - 4, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
};

// Draw the goal portal
const drawGoal = (ctx, goal, unlocked, t = 0) => {
  const cx = goal.x + goal.width / 2;
  const cy = goal.y + goal.height / 2;
  const r = Math.max(goal.width, goal.height) / 2 + 2;

  ctx.save();

  ctx.globalAlpha = unlocked ? 1 : 0.5;
  ctx.shadowColor = unlocked
    ? "rgba(60,40,120,.45)"
    : "rgba(30,30,50,.2)";
  ctx.shadowBlur = unlocked ? 16 : 6;

  const g = ctx.createRadialGradient(
    cx - r * 0.25,
    cy - r * 0.25,
    2,
    cx,
    cy,
    r
  );

  g.addColorStop(0, "#3a3a52");
  g.addColorStop(1, "#14141f");

  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.translate(cx, cy);
  ctx.rotate(unlocked ? t * 0.04 : 0);

  ctx.strokeStyle = "rgba(190,190,215,.55)";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.beginPath();

  for (let a = 0; a < Math.PI * 5; a += 0.15) {
    const rad = (a / (Math.PI * 5)) * (r - 4);
    const px = Math.cos(a) * rad;
    const py = Math.sin(a) * rad;

    if (a === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }

  ctx.stroke();
  ctx.restore();
};

// Main rendering function
export const renderGame = (ctx, game) => {
  drawBackground(ctx);

  if (!game) return;

  const unlocked = game.apples.every((apple) => apple.collected);

  drawGoal(ctx, game.goal, unlocked, game.t);
  game.platforms.forEach((platform) => drawPlatform(ctx, platform));
  game.apples.forEach((apple) => drawApple(ctx, apple, game.t));
  game.hazards.forEach((hazard) => drawHazard(ctx, hazard));

  drawWorm(ctx, game.worm);
};
