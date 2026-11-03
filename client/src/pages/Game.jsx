import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LEVELS, WIDTH, HEIGHT, getLevel, getEasyLevel } from "../game/levels";
import { createGame, stepGame } from "../game/engine";
import { completeLevel, getProgress, getTutorialKey } from "../game/progress";
import "./Game.css";

const GAME_KEYS = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "];
const START_KEYS = [...GAME_KEYS, "a", "A", "d", "D", "w", "W"];

const playGameSound = (kind = "collect") => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const audio = new AudioCtx();
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    const tones = { collect: [660, 990], win: [523, 784], lose: [220, 150] };
    const [from, to] = tones[kind] || tones.collect;
    osc.type = kind === "lose" ? "triangle" : "sine";
    osc.frequency.setValueAtTime(from, audio.currentTime);
    osc.frequency.exponentialRampToValueAtTime(to, audio.currentTime + 0.12);
    gain.gain.setValueAtTime(0.0001, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, audio.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + 0.21);
    osc.onended = () => audio.close();
  } catch {
    /* Audio is optional; gameplay must still work. */
  }
};

/* ---------- Canvas drawing ---------- */

const drawCloud = (ctx, cx, cy, s) => {
  ctx.fillStyle = "rgba(255,255,255,.7)";
  ctx.beginPath();
  ctx.arc(cx, cy, 22 * s, 0, Math.PI * 2);
  ctx.arc(cx + 26 * s, cy - 10 * s, 28 * s, 0, Math.PI * 2);
  ctx.arc(cx + 56 * s, cy, 22 * s, 0, Math.PI * 2);
  ctx.rect(cx, cy, 56 * s, 22 * s);
  ctx.fill();
};

const drawSkyline = (ctx, color, seed, minH, varH, baseY) => {
  ctx.fillStyle = color;
  for (let i = 0; i < Math.ceil(WIDTH / 22) + 2; i++) {
    const bw = 24 + ((i * seed) % 4) * 9;
    const bh = minH + ((i * seed * 31) % varH);
    const x = i * 24;
    ctx.fillRect(x, baseY - bh, bw, bh + (HEIGHT - baseY));
  }
};

const drawBackground = (ctx) => {
  // Soft light-blue sky
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, "#a8dcf0");
  sky.addColorStop(0.55, "#cdeef7");
  sky.addColorStop(1, "#e4f6f4");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Clouds
  drawCloud(ctx, WIDTH * 0.2, HEIGHT * 0.38, 1.2);
  drawCloud(ctx, WIDTH * 0.62, HEIGHT * 0.46, 1);

  // Two hazy skyline layers (far, near)
  drawSkyline(ctx, "rgba(160,205,225,.45)", 7, 80, 150, HEIGHT - 10);
  drawSkyline(ctx, "rgba(140,190,215,.55)", 5, 40, 110, HEIGHT + 5);

  // Haze at the bottom
  const haze = ctx.createLinearGradient(0, HEIGHT - 80, 0, HEIGHT);
  haze.addColorStop(0, "rgba(255,255,255,0)");
  haze.addColorStop(1, "rgba(255,255,255,.45)");
  ctx.fillStyle = haze;
  ctx.fillRect(0, HEIGHT - 80, WIDTH, 80);
};

// Chunky brown block with a lit top/left edge and a dark bottom/right edge
const drawPlatform = (ctx, platform) => {
  const moving = Boolean(platform.move);
  const { x, y, width: w, height: h } = platform;
  const base = moving ? "#8fc0e0" : "#a8683a";
  const light = moving ? "#cfeaff" : "#c8884e";
  const dark = moving ? "#5b93b8" : "#7d4a28";
  const line = moving ? "#3f7698" : "#6a3d1f";
  const r = Math.min(8, h / 2, w / 2);
  const d = Math.min(9, h / 2); // depth of the side faces

  ctx.save();
  // Ground shadow
  ctx.fillStyle = "rgba(40,70,95,.16)";
  ctx.beginPath();
  ctx.roundRect(x + 4, y + 6, w, h, r);
  ctx.fill();

  // Dark back/side face (gives the 3D thickness)
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();

  // Main front face
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.roundRect(x + d * 0.5, y + d * 0.5, w - d * 0.9, h - d * 0.9, Math.max(2, r - 2));
  ctx.fill();

  // Lit top strip
  ctx.fillStyle = light;
  ctx.beginPath();
  ctx.roundRect(x + d * 0.5, y + d * 0.5, w - d * 0.9, Math.min(d + 2, h * 0.35), Math.max(2, r - 2));
  ctx.fill();

  // Outline
  ctx.strokeStyle = line;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(x + 1, y + 1, w - 2, h - 2, r);
  ctx.stroke();

  // Subtle wood grain
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
    ctx.fillText(platform.move.axis === "x" ? "↔" : "↕", x + w / 2, y + h - 6);
    ctx.textAlign = "start";
  }
  ctx.restore();
};

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
  // Head and face
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

const drawHazard = (ctx, hazard) => {
  ctx.save();
  const r = hazard.radius;
  const gradient = ctx.createRadialGradient(hazard.x - r * 0.3, hazard.y - r * 0.35, 2, hazard.x, hazard.y, r);
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

// Goal = dark spiral portal (dimmed until every apple is collected)
const drawGoal = (ctx, goal, unlocked, t = 0) => {
  const cx = goal.x + goal.width / 2;
  const cy = goal.y + goal.height / 2;
  const r = Math.max(goal.width, goal.height) / 2 + 2;
  ctx.save();
  ctx.globalAlpha = unlocked ? 1 : 0.5;
  ctx.shadowColor = unlocked ? "rgba(60,40,120,.45)" : "rgba(30,30,50,.2)";
  ctx.shadowBlur = unlocked ? 16 : 6;

  const g = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.25, 2, cx, cy, r);
  g.addColorStop(0, "#3a3a52");
  g.addColorStop(1, "#14141f");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Spiral
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

const renderGame = (ctx, game) => {
  drawBackground(ctx);
  if (!game) return;
  const unlocked = game.apples.every((apple) => apple.collected);
  drawGoal(ctx, game.goal, unlocked, game.t);
  game.platforms.forEach((platform) => drawPlatform(ctx, platform));
  game.apples.forEach((apple) => drawApple(ctx, apple, game.t));
  game.hazards.forEach((hazard) => drawHazard(ctx, hazard));
  drawWorm(ctx, game.worm);
};

/* ---------- Small icon components ---------- */

const Chevron = ({ dir }) => {
  const rotate = { up: 0, right: 90, down: 180, left: 270 }[dir];
  return (
    <svg viewBox="0 0 24 24" style={{ transform: `rotate(${rotate}deg)` }} aria-hidden="true">
      <path
        d="M5 15 L12 8 L19 15"
        fill="none"
        stroke="#fff"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const RestartIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M5 12a7 7 0 1 0 2.2-5.1M5 4v4h4"
      fill="none"
      stroke="#fff"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M4 11 L12 4 L20 11 V20 H14 V14 H10 V20 H4 Z"
      fill="none"
      stroke="#fff"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
  </svg>
);

/* ---------- Component ---------- */

function Game() {
  const { levelId } = useParams();
  const navigate = useNavigate();

  const level = getLevel(levelId);
  const nextLevel = LEVELS.find((item) => item.id === level.id + 1);

  const levelRef = useRef(level);
  levelRef.current = level;

  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const keysRef = useRef({});
  const animationRef = useRef(null);
  const startedRef = useRef(false);
  const beginPlayRef = useRef(() => {});

  // After the first game over on a level, the next try uses an easier pattern
  const easyRef = useRef(false);

  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("playing"); // "playing" | "dead" | "won"
  const [gameStarted, setGameStarted] = useState(false);
  const [easyMode, setEasyMode] = useState(false);
  const [justEased, setJustEased] = useState(false);

  const setStarted = (value) => {
    startedRef.current = value;
    setGameStarted(value);
  };

  const resetGame = () => {
    gameRef.current = createGame(
      easyRef.current ? getEasyLevel(levelRef.current) : levelRef.current,
    );
    keysRef.current = {};

    setScore(0);
    setStatus("playing");
    setEasyMode(easyRef.current);
    setJustEased(false);
  };

  // Called when the player presses a key or taps the hint screen
  const beginPlay = () => {
    if (startedRef.current) return;

    // Fullscreen is only requested the first time
    if (!localStorage.getItem(getTutorialKey())) {
      localStorage.setItem(getTutorialKey(), "true");

      try {
        const container = document.querySelector(".game-page");

        if (container && !document.fullscreenElement) {
          Promise.resolve(container.requestFullscreen()).catch(() => {});
        }
      } catch {
        // fullscreen is optional
      }
    }

    setStarted(true);
  };

  beginPlayRef.current = beginPlay;

  // Run the action, then drop focus so Space does not "click" the button again
  const handleButton = (action) => (event) => {
    action();
    event.currentTarget.blur();
  };

  const exitToDashboard = () => navigate("/dashboard");

  const goToNextLevel = () => {
    if (nextLevel) navigate(`/game/${nextLevel.id}`);
  };

  // Load the level (and show the arrow-key hint) whenever the level changes
  useEffect(() => {
    if (level.id > getProgress().unlocked) {
      navigate("/dashboard", { replace: true });
      return;
    }

    easyRef.current = false; // every level starts with its normal pattern
    resetGame();
    setStarted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level.id]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      keysRef.current[event.key] = true;

      if (GAME_KEYS.includes(event.key)) {
        event.preventDefault();
      }

      if (!startedRef.current && START_KEYS.includes(event.key)) {
        beginPlayRef.current();
      }
    };

    const handleKeyUp = (event) => {
      keysRef.current[event.key] = false;

      if (GAME_KEYS.includes(event.key)) {
        event.preventDefault();
      }
    };

    // Stop the worm from running forever if the window loses focus
    const clearKeys = () => {
      keysRef.current = {};
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", clearKeys);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", clearKeys);
    };
  }, []);

  // Game loop
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");

    const loop = () => {
      const game = gameRef.current;

      if (game && startedRef.current && game.status === "playing") {
        const keys = keysRef.current;
        const previousScore = game.score;

        stepGame(game, {
          left: Boolean(keys.ArrowLeft || keys.a || keys.A),
          right: Boolean(keys.ArrowRight || keys.d || keys.D),
          jump: Boolean(keys.ArrowUp || keys[" "] || keys.w || keys.W),
        });

        if (game.score !== previousScore) {
          setScore(game.score);
          playGameSound("collect");
        }

        if (game.status === "won") {
          completeLevel(levelRef.current.id, game.score);
          playGameSound("win");
          setStatus("won");
        } else if (game.status === "dead") {
          // First game over on this level: the next try is the easy pattern
          if (!easyRef.current) {
            easyRef.current = true;
            setJustEased(true);
          }

          playGameSound("lose");
          setStatus("dead");
        }
      }

      renderGame(ctx, game);
      animationRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  // D-pad buttons: key stays pressed while the finger / mouse is held down
  const pressKey = (key) => (event) => {
    event.preventDefault();
    keysRef.current[key] = true;
    beginPlayRef.current();
  };

  const releaseKey = (key) => () => {
    keysRef.current[key] = false;
  };

  const controlProps = (key) => ({
    onPointerDown: pressKey(key),
    onPointerUp: releaseKey(key),
    onPointerLeave: releaseKey(key),
    onPointerCancel: releaseKey(key),
    onContextMenu: (event) => event.preventDefault(),
  });

  return (
    <div className="game-page">
      <div
        className="canvas-wrapper"
        style={{
          aspectRatio: `${WIDTH} / ${HEIGHT}`,
          width: `min(100vw, calc(100vh * ${WIDTH} / ${HEIGHT}))`,
        }}
      >
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />

        {/* Top HUD: restart / home — Level N — score */}
        <div className="hud-top">
          <div className="hud-group">
            <button className="hud-btn" aria-label="Restart" onClick={handleButton(resetGame)}>
              <RestartIcon />
            </button>
            <button className="hud-btn" aria-label="Dashboard" onClick={handleButton(exitToDashboard)}>
              <HomeIcon />
            </button>
          </div>

          <div className="level-pill">Level {level.id}</div>

          <div className="hud-group right">
            <div className="score-pill">🍎 {score}</div>
          </div>
        </div>

        <div className="hud-tags">
          <span className="tag-pill" style={{ "--pill-color": level.accent }}>
            {level.difficulty}
          </span>
          {easyMode && (
            <span className="tag-pill" style={{ "--pill-color": "#2e8b3c" }}>
              Easy pattern
            </span>
          )}
        </div>

        {/* On-screen D-pad (right side) */}
        <div className="dpad">
          <button className="dpad-btn dpad-up" aria-label="Jump" {...controlProps(" ")}>
            <Chevron dir="up" />
          </button>
          <button className="dpad-btn dpad-left" aria-label="Left" {...controlProps("ArrowLeft")}>
            <Chevron dir="left" />
          </button>
          <button className="dpad-btn dpad-right" aria-label="Right" {...controlProps("ArrowRight")}>
            <Chevron dir="right" />
          </button>
          <button className="dpad-btn dpad-down" aria-label="Down" {...controlProps("ArrowDown")}>
            <Chevron dir="down" />
          </button>
        </div>

        {/* Start hint: shown at the beginning of every level */}
        {!gameStarted && (
          <div className="hint-overlay" onPointerDown={beginPlay}>
            <div className="hint-keys" aria-hidden="true">
              <div className="hint-key hint-key-left">◀</div>
              <div className="hint-key hint-key-up">▲</div>
              <div className="hint-key hint-key-right">▶</div>
            </div>

            <p className="hint-title">Use arrow keys to move</p>
            <p className="hint-sub">Press ▲ or Space to jump</p>
            <p className="hint-start">Press any arrow key to start</p>
          </div>
        )}

        {status !== "playing" && (
          <div className="game-overlay">
            <h2>{status === "won" ? "Level Completed! 🎉" : "Game Over!"}</h2>

            <p>
              {status === "won"
                ? `Great job! Your score is ${score}`
                : `Your score is ${score}`}
            </p>

            <div className="overlay-actions">
              {status === "won" && nextLevel && (
                <button className="overlay-btn" onClick={handleButton(goToNextLevel)}>
                  Next Level ▶
                </button>
              )}

              <button
                className={`overlay-btn ${status === "won" && nextLevel ? "secondary" : ""}`}
                onClick={handleButton(resetGame)}
              >
                {status === "won" ? "Play Again" : "Restart"}
              </button>

              <button className="overlay-btn secondary" onClick={handleButton(exitToDashboard)}>
                Exit
              </button>
            </div>

            {status === "dead" && justEased && (
              <p className="overlay-note">No worries! Your next try uses an easier pattern.</p>
            )}

            {status === "won" && !nextLevel && (
              <p className="overlay-note">You finished every level! 🏆</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Game;
