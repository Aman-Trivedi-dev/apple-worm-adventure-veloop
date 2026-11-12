
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProgress } from "../game/progress";
import { getGameProgress } from "../services/gameService";

const useLevelManager = ({
  level,
  easyRef,
  resetGame,
  setStarted,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const loadLevel = async () => {
      try {
        let unlockedLevel = getProgress().unlocked || 1;

        // Use backend progress when the user is logged in
        const token =
          localStorage.getItem("token") ||
          sessionStorage.getItem("token");

        if (token) {
          const serverProgress = await getGameProgress();
          unlockedLevel = Number(
            serverProgress?.unlockedLevel || unlockedLevel
          );
        }

        if (cancelled) return;

        if (level.id > unlockedLevel) {
          navigate("/dashboard", { replace: true });
          return;
        }

        easyRef.current = false;
        resetGame();
        setStarted(false);

      } catch (error) {
        console.error("Unable to load level progress:", error);

        if (!cancelled) {
          navigate("/dashboard", { replace: true });
        }
      }
    };

    loadLevel();

    return () => {
      cancelled = true;
    };
  }, [level.id, navigate]);

};

export default useLevelManager;
