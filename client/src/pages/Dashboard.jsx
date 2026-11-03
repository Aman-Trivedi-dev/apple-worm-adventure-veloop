import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LevelDashboard from "../components/LevelDashboard";
import { getProgress, getTotalScore } from "../game/progress"; // <-- 1. Import helpers
import "./Dashboard.css";

function readSavedUser() {
  try {
    const savedUser =
      localStorage.getItem("user") ||
      sessionStorage.getItem("user");

    return savedUser ? JSON.parse(savedUser) : {};
  } catch (error) {
    console.error("Unable to read saved user:", error);
    return {};
  }
}

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(readSavedUser);
  const [progress, setProgress] = useState(() => getProgress()); // <-- 2. Store progress state

  const refreshData = useCallback(() => {
    setUser(readSavedUser());
    setProgress(getProgress()); // <-- 3. Refresh game progress on event
  }, []);

  useEffect(() => {
    window.addEventListener("focus", refreshData);
    window.addEventListener("storage", refreshData);
    window.addEventListener("progressUpdated", refreshData);

    return () => {
      window.removeEventListener("focus", refreshData);
      window.removeEventListener("storage", refreshData);
      window.removeEventListener("progressUpdated", refreshData);
    };
  }, [refreshData]);

  const username = user.username || "Player";
  const coins = user.coins ?? 0;

  // 4. Use calculated scores & unlocked levels from game progress
  const totalScore = getTotalScore(progress);
  const unlockedLevel = Number(progress.unlocked ?? 1);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("username");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("username");

    navigate("/login", { replace: true });
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Apple Worm Adventure 🍎</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <main className="dashboard-content">
        <h2>Welcome, {username}!</h2>
        <p>Your adventure starts here. Are you ready to play?</p>

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Score</h3>
            <p>{totalScore}</p>
          </div>

          <div className="stat-card">
            <h3>Coins</h3>
            <p>🪙 {coins}</p>
          </div>

          <div className="stat-card">
            <h3>Unlocked Level</h3>
            <p>Level {unlockedLevel}</p>
          </div>
        </div>

        <div className="dashboard-actions">
          <button onClick={() => navigate("/game")}>
            Play Game
          </button>

          <button onClick={() => navigate(`/game/${unlockedLevel}`)}>
            Continue Game
          </button>
        </div>

        <LevelDashboard />
      </main>
    </div>
  );
}

export default Dashboard;