
const GameStartOverlay = ({ gameStarted, beginPlay }) => {
  if (gameStarted) return null;

  return (
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
  );
};

export default GameStartOverlay;
