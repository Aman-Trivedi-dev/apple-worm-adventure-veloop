
import { RestartIcon, HomeIcon } from "./GameIcons";
import { formatScore, formatLevel } from "../../utils/formatters";

const GameHUD = ({
  level,
  score,
  easyMode,
  handleButton,
  resetGame,
  exitToDashboard,
}) => {
  return (
    <>
      {/* Top HUD: restart / home — Level N — score */}
      <div className="hud-top">
        <div className="hud-group">
          <button
            className="hud-btn"
            aria-label="Restart"
            onClick={handleButton(resetGame)}
          >
            <RestartIcon />
          </button>

          <button
            className="hud-btn"
            aria-label="Dashboard"
            onClick={handleButton(exitToDashboard)}
          >
            <HomeIcon />
          </button>
        </div>

        <div className="level-pill">{formatLevel(level.id)}</div>

        <div className="hud-group right">
          <div className="score-pill">🍎 {formatScore(score)}</div>
        </div>
      </div>

      {/* Difficulty tags */}
      <div className="hud-tags">
        <span
          className="tag-pill"
          style={{ "--pill-color": level.accent }}
        >
          {level.difficulty}
        </span>

        {easyMode && (
          <span
            className="tag-pill"
            style={{ "--pill-color": "#2e8b3c" }}
          >
            Easy pattern
          </span>
        )}
      </div>
    </>
  );
};

export default GameHUD;
