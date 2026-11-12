
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LEVELS, WIDTH, HEIGHT } from "../game/levels";
import { getProgress } from "../game/progress";
import { getGameProgress } from "../services/gameService";
import "./LevelDashboard.css";

function LevelPreview({ level }) {
  return (
    <svg
      className="level-preview"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`sky-${level.id}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0" stopColor="#4338ca" />
          <stop offset="0.5" stopColor="#f472b6" />
          <stop offset="1" stopColor="#fed7aa" />
        </linearGradient>
      </defs>

      <rect
        width={WIDTH}
        height={HEIGHT}
        fill={`url(#sky-${level.id})`}
      />

      {level.platforms.map((platform, index) => (
        <g key={`platform-${index}`}>
          <rect
            x={platform.x}
            y={platform.y}
            width={platform.width}
            height={platform.height ?? 35}
            rx="4"
            fill={platform.move ? "#64748b" : "#8b5a36"}
            stroke={platform.move ? "#334155" : "#5b3822"}
            strokeWidth="5"
          />
        </g>
      ))}

      {level.apples.map((apple, index) => (
        <g key={`apple-${index}`}>
          <circle
            cx={apple.x}
            cy={apple.y}
            r="17"
            fill="#ef2929"
          />
          <circle
            cx={apple.x - 5}
            cy={apple.y - 5}
            r="5"
            fill="#ffb4b4"
            opacity="0.8"
          />
        </g>
      ))}

      {level.hazards.map((hazard, index) => (
        <circle
          key={`hazard-${index}`}
          cx={hazard.x}
          cy={hazard.y}
          r={hazard.radius}
          fill="#202936"
          stroke={hazard.move ? "#fbbf24" : "#64748b"}
          strokeWidth="6"
        />
      ))}

      <rect
        x={level.goal.x}
        y={level.goal.y}
        width={level.goal.width}
        height={level.goal.height}
        fill="#16a34a"
        stroke="#ffffff"
        strokeWidth="6"
      />
    </svg>
  );
}

function LevelDashboard({ serverUnlockedLevel }) {
  const navigate = useNavigate();

  const [progress, setProgress] = useState(() => getProgress());
  const [backendUnlockedLevel, setBackendUnlockedLevel] = useState(
    serverUnlockedLevel ?? null
  );

  // Refresh progress from backend and local storage
  const refreshProgress = useCallback(async () => {
    setProgress(getProgress());

    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    if (!token) {
      setBackendUnlockedLevel(null);
      return;
    }

    try {
      const serverProgress = await getGameProgress();

      setBackendUnlockedLevel(
        Number(serverProgress?.unlockedLevel || 1)
      );
    } catch (error) {
      console.error("Failed to refresh level progress:", error);
    }
  }, []);

  useEffect(() => {
    if (serverUnlockedLevel !== undefined && serverUnlockedLevel !== null) {
      setBackendUnlockedLevel(Number(serverUnlockedLevel));
    }
  }, [serverUnlockedLevel]);

  useEffect(() => {
    refreshProgress();

    const handleRefresh = () => {
      refreshProgress();
    };

    window.addEventListener("focus", handleRefresh);
    window.addEventListener("storage", handleRefresh);
    window.addEventListener("progressUpdated", handleRefresh);

    return () => {
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener("storage", handleRefresh);
      window.removeEventListener("progressUpdated", handleRefresh);
    };
  }, [refreshProgress]);

  // Backend is the source of truth for logged-in users
  const unlockedLevel = Number(
    backendUnlockedLevel ?? progress.unlocked ?? 1
  );

  const handleLevelClick = (levelId) => {
    if (levelId <= unlockedLevel) {
      navigate(`/game/${levelId}`);
    }
  };

  return (
    <section className="levels-dashboard">
      <div className="levels-heading">
        <h2>Choose Your Adventure 🍎</h2>

        <p>
          Complete levels, collect apples, and unlock new challenges!
        </p>
      </div>

      <div className="levels-grid">
        {LEVELS.map((level) => {
          const locked = level.id > unlockedLevel;
          const best = progress.best?.[level.id];
          const completed = best !== undefined && best !== null;

          let statusText = "Ready to play";

          if (locked) {
            statusText = "🔒 Complete previous levels";
          } else if (completed) {
            statusText = `🏆 Completed · Best score ${best}`;
          }

          return (
            <button
              key={level.id}
              type="button"
              className={[
                "level-card",
                locked ? "is-locked" : "",
                completed ? "is-completed" : "",
                level.id === unlockedLevel ? "is-current" : "",
              ].join(" ")}
              style={{
                "--level-color": level.accent || "#16a34a",
              }}
              disabled={locked}
              onClick={() => handleLevelClick(level.id)}
            >
              <div className="level-card-art">
                <LevelPreview level={level} />

                {locked && (
                  <div className="level-lock">
                    <span>🔒</span>
                  </div>
                )}

                {completed && (
                  <div className="level-completed-badge">
                    ✓ Completed
                  </div>
                )}
              </div>

              <div className="level-card-body">
                <div className="level-card-top">
                  <span className="level-number">
                    LEVEL {level.id}
                  </span>

                  <span className="level-difficulty">
                    {level.difficulty}
                  </span>
                </div>

                <h3>{level.name}</h3>

                <p className="level-description">
                  {level.pattern}
                </p>

                <span className="level-status">
                  {statusText}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default LevelDashboard;
