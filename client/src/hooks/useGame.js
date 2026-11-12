
import { useRef, useState } from "react";
import { createGame } from "../game/engine";

const useGame = (level) => {
  const gameRef = useRef(null);

  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("playing");

  const resetGame = (selectedLevel = level) => {
    gameRef.current = createGame(selectedLevel);
    setScore(0);
    setStatus("playing");
  };

  return {
    gameRef,
    score,
    setScore,
    status,
    setStatus,
    resetGame,
  };
};

export default useGame;
