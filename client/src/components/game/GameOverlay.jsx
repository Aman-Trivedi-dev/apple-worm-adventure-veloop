
const GameOverlay = ({
  status,
  score,
  nextLevel,
  justEased,
  handleButton,
  goToNextLevel,
  resetGame,
  exitToDashboard,
  reviveAvailable = false,
  reviveLoading = false,
  onRevive,
}) => {
  if (status === "playing") return null;

  return (
    <div className="game-overlay">
      <h2>
        {status === "won" ? "Level Completed! 🎉" : "Game Over!"}
      </h2>

      <p>
        {status === "won"
          ? `Great job! Your score is ${score}`
          : `Your score is ${score}`}
      </p>

      <div className="overlay-actions">

        {/* Revive option */}
        {status === "dead" && (
          <button
            className="overlay-btn"
            onClick={
              reviveAvailable && !reviveLoading
                ? handleButton(onRevive)
                : undefined
            }
            disabled={!reviveAvailable || reviveLoading}
            title={
              reviveAvailable
                ? "Continue from your last checkpoint"
                : "You need a Revive booster"
            }
            style={{
              opacity: reviveAvailable ? 1 : 0.6,
              cursor: reviveAvailable ? "pointer" : "not-allowed",
            }}
          >
            {reviveLoading
              ? "Reviving..."
              : reviveAvailable
              ? "❤️ Revive"
              : "❤️ Revive (Not Available)"}
          </button>
        )}

        {/* Next level */}
        {status === "won" && nextLevel && (
          <button
            className="overlay-btn"
            onClick={handleButton(goToNextLevel)}
          >
            Next Level ▶
          </button>
        )}

        {/* Restart */}
        <button
          className={`overlay-btn ${
            status === "won" && nextLevel ? "secondary" : ""
          }`}
          onClick={handleButton(resetGame)}
        >
          {status === "won" ? "Play Again" : "Restart"}
        </button>

        {/* Exit */}
        <button
          className="overlay-btn secondary"
          onClick={handleButton(exitToDashboard)}
        >
          Exit
        </button>
      </div>

      {status === "dead" && !reviveAvailable && (
        <p className="overlay-note">
          You don't have a Revive booster. Purchase one from the Rewards Shop.
        </p>
      )}

      {status === "dead" && justEased && (
        <p className="overlay-note">
          No worries! Your next try uses an easier pattern.
        </p>
      )}

      {status === "won" && !nextLevel && (
        <p className="overlay-note">
          You finished every level! 🏆
        </p>
      )}
    </div>
  );
};

export default GameOverlay;
