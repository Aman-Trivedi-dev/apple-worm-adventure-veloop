
import { useEffect } from "react";
import { stepGame } from "../game/engine";
import { renderGame } from "../game/renderer";
import playGameSound from "../utils/gameSound";
import { completeGameLevel } from "../services/gameService";

const useGameLoop = ({
  canvasRef,
  gameRef,
  keysRef,
  startedRef,
  levelRef,
  setScore,
  setStatus,
  easyRef,
  setJustEased,
}) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId;
    let completionRequested = false;

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

        if (game.status === "won" && !completionRequested) {
          completionRequested = true;

          playGameSound("win");
          setStatus("won");

          completeGameLevel(levelRef.current.id, game.score)
            .then((response) => {
              console.log("Level completion saved:", response);
            })
            .catch((error) => {
              console.error("Failed to save level completion:", error);
            });

        } else if (game.status === "dead") {
          if (!easyRef.current) {
            easyRef.current = true;
            setJustEased(true);
          }

          playGameSound("lose");
          setStatus("dead");
        }
      }

      renderGame(ctx, game);
      animationId = requestAnimationFrame(loop);
    };

    loop();

    return () => cancelAnimationFrame(animationId);
  }, [
    canvasRef,
    gameRef,
    keysRef,
    startedRef,
    levelRef,
    setScore,
    setStatus,
    easyRef,
    setJustEased,
  ]);
};

export default useGameLoop;
