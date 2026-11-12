
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  LEVELS,
  WIDTH,
  HEIGHT,
  getLevel,
  getEasyLevel,
} from "../game/levels";

import { reviveGame } from "../game/engine";
import { getTutorialKey } from "../game/progress";

import {
  getBoosterInventory,
  activateBooster,
} from "../services/boosterService";

import useKeyboardControls from "../hooks/useKeyboardControls";
import useGame from "../hooks/useGame";
import useGameLoop from "../hooks/useGameLoop";
import usePointerControls from "../hooks/usePointerControls";
import useLevelManager from "../hooks/useLevelManager";

import GameControls from "../components/game/GameControls";
import GameHUD from "../components/game/GameHUD";
import GameOverlay from "../components/game/GameOverlay";
import GameStartOverlay from "../components/game/GameStartOverlay";
import GameCanvas from "../components/game/GameCanvas";

import "./Game.css";

function Game() {
  const { levelId } = useParams();
  const navigate = useNavigate();

  const level = getLevel(levelId);

  const {
    gameRef,
    score,
    setScore,
    status,
    setStatus,
    resetGame: initializeGame,
  } = useGame(level);

  const nextLevel = LEVELS.find(
    (item) => item.id === level.id + 1
  );

  // Refs
  const levelRef = useRef(level);
  const canvasRef = useRef(null);
  const keysRef = useRef({});
  const startedRef = useRef(false);
  const beginPlayRef = useRef(() => {});
  const easyRef = useRef(false);

  levelRef.current = level;

  // States
  const [gameStarted, setGameStarted] = useState(false);
  const [easyMode, setEasyMode] = useState(false);
  const [justEased, setJustEased] = useState(false);

  const [reviveAvailable, setReviveAvailable] = useState(false);
  const [reviveLoading, setReviveLoading] = useState(false);

  // Load booster inventory
  useEffect(() => {
    let cancelled = false;

    const loadInventory = async () => {
      try {
        const inventory = await getBoosterInventory();

        if (!cancelled) {
          setReviveAvailable(
            Number(inventory?.REVIVE || 0) > 0
          );
        }
      } catch (error) {
        console.error("Unable to load booster inventory:", error);
      }
    };

    loadInventory();

    return () => {
      cancelled = true;
    };
  }, []);

  // Start game state
  const setStarted = (value) => {
    startedRef.current = value;
    setGameStarted(value);
  };

  // Reset game
  const resetGame = () => {
    const selectedLevel = easyRef.current
      ? getEasyLevel(levelRef.current)
      : levelRef.current;

    initializeGame(selectedLevel);

    keysRef.current = {};

    setStarted(false);
    setEasyMode(easyRef.current);
    setJustEased(false);
  };

  // Begin playing
  const beginPlay = () => {
    if (startedRef.current) return;

    if (!localStorage.getItem(getTutorialKey())) {
      localStorage.setItem(getTutorialKey(), "true");

      try {
        const container = document.querySelector(".game-page");

        if (container && !document.fullscreenElement) {
          Promise.resolve(
            container.requestFullscreen()
          ).catch(() => {});
        }
      } catch {
        // Fullscreen is optional.
      }
    }

    setStarted(true);
  };

  // Keep the latest beginPlay function available to keyboard and pointer hooks.
  beginPlayRef.current = beginPlay;

  // IMPORTANT: Initialize keyboard controls.
  useKeyboardControls(keysRef, beginPlayRef);

  // Initialize pointer controls.
  const controlProps = usePointerControls(
    keysRef,
    beginPlayRef
  );

  // Button handler
  const handleButton = (action) => (event) => {
    action();
    event.currentTarget.blur();
  };

  const exitToDashboard = () => {
    navigate("/dashboard");
  };

  const goToNextLevel = () => {
    if (nextLevel) {
      navigate(`/game/${nextLevel.id}`);
    }
  };

  // Revive booster
  const handleRevive = async () => {
    const game = gameRef.current;

    if (reviveLoading || !reviveAvailable) return;

    if (
      !game ||
      game.status !== "dead" ||
      !game.checkpoint
    ) {
      alert("No safe checkpoint is available.");
      return;
    }

    setReviveLoading(true);

    try {
      await activateBooster("REVIVE");

      const restored = reviveGame(game);

      if (!restored) {
        throw new Error("Unable to restore the game.");
      }

      setScore(game.score);
      setStatus("playing");
      setStarted(true);

      keysRef.current = {};

      easyRef.current = false;
      setJustEased(false);
      setEasyMode(false);
      setReviveAvailable(false);

      const inventory = await getBoosterInventory();

      setReviveAvailable(
        Number(inventory?.REVIVE || 0) > 0
      );
    } catch (error) {
      console.error("Revive failed:", error);

      alert(
        error.message || "Unable to revive. Please try again."
      );

      try {
        const inventory = await getBoosterInventory();

        setReviveAvailable(
          Number(inventory?.REVIVE || 0) > 0
        );
      } catch (inventoryError) {
        console.error(
          "Inventory refresh failed:",
          inventoryError
        );
      }
    } finally {
      setReviveLoading(false);
    }
  };

  // Level management
  useLevelManager({
    level,
    levelRef,
    easyRef,
    resetGame,
    setStarted,
  });

  // Game animation and movement loop
  useGameLoop({
    canvasRef,
    gameRef,
    keysRef,
    startedRef,
    levelRef,
    setScore,
    setStatus,
    easyRef,
    setJustEased,
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
        <GameCanvas
          canvasRef={canvasRef}
          width={WIDTH}
          height={HEIGHT}
        />

        <GameHUD
          level={level}
          score={score}
          easyMode={easyMode}
          handleButton={handleButton}
          resetGame={resetGame}
          exitToDashboard={exitToDashboard}
        />

        <GameControls controlProps={controlProps} />

        <GameStartOverlay
          gameStarted={gameStarted}
          beginPlay={beginPlay}
        />

        <GameOverlay
          status={status}
          score={score}
          nextLevel={nextLevel}
          justEased={justEased}
          handleButton={handleButton}
          goToNextLevel={goToNextLevel}
          resetGame={resetGame}
          exitToDashboard={exitToDashboard}
          reviveAvailable={reviveAvailable}
          reviveLoading={reviveLoading}
          onRevive={handleRevive}
        />
      </div>
    </div>
  );
}

export default Game;
