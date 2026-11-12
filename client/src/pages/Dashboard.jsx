import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import LevelDashboard from "../components/LevelDashboard";
import { getProgress, getTotalScore } from "../game/progress";

import { getGameProgress } from "../services/gameService";
import { getWalletBalance } from "../services/walletService";

import {
  getBoosterInventory,
  purchaseBooster,
} from "../services/boosterService";

import { createAdSession, completeAdReward } from "../services/adService";


import "./Dashboard.css";

const BOOSTERS = [
  {
    id: "REVIVE",
    name: "Revive",
    icon: "❤️",
    price: 30,
    description: "Continue from your last safe checkpoint.",
  },
  {
    id: "DOUBLE_SCORE",
    name: "Double Score",
    icon: "⭐",
    price: 20,
    description: "Earn double score during gameplay.",
  },
  {
    id: "DOUBLE_COINS",
    name: "Double Coins",
    icon: "🪙",
    price: 25,
    description: "Earn double coins during gameplay.",
  },
  {
    id: "EXTRA_MOVES",
    name: "Extra Moves",
    icon: "🎮",
    price: 15,
    description: "Get 10 additional moves.",
  },
  {
    id: "HINT",
    name: "Hint",
    icon: "💡",
    price: 10,
    description: "Get help to complete a level.",
  },
  {
    id: "BOOSTER",
    name: "Super Booster",
    icon: "🚀",
    price: 40,
    description: "Activate your special booster.",
  },
];

function readSavedUser() {
  try {
    const savedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    return savedUser ? JSON.parse(savedUser) : {};
  } catch (error) {
    console.error("Unable to read saved user:", error);
    return {};
  }
}

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(readSavedUser);
  const [progress, setProgress] = useState(() => getProgress());

  const [serverProgress, setServerProgress] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);

  const [shopOpen, setShopOpen] = useState(false);
  const [inventory, setInventory] = useState({});
  const [purchasing, setPurchasing] = useState(null);

  // Ad reward states
  const [adLoading, setAdLoading] = useState(false);
  const [adCountdown, setAdCountdown] = useState(0);
  const [adMessage, setAdMessage] = useState("");

  // Refresh dashboard information
  const refreshData = useCallback(async () => {
    setUser(readSavedUser());
    setProgress(getProgress());

    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) {
      setServerProgress(null);
      setWalletBalance(null);
      return;
    }

    const [gameResult, walletResult] = await Promise.allSettled([
      getGameProgress(),
      getWalletBalance(),
    ]);

    if (gameResult.status === "fulfilled") {
      setServerProgress(gameResult.value);
    } else {
      console.error("Failed to load game progress:", gameResult.reason);
    }

    if (walletResult.status === "fulfilled") {
      setWalletBalance(walletResult.value);
    } else {
      console.error("Failed to load wallet balance:", walletResult.reason);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    const handleRefresh = () => refreshData();

    window.addEventListener("focus", handleRefresh);
    window.addEventListener("storage", handleRefresh);
    window.addEventListener("progressUpdated", handleRefresh);

    return () => {
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener("storage", handleRefresh);
      window.removeEventListener("progressUpdated", handleRefresh);
    };
  }, [refreshData]);

  // Load booster inventory when shop opens
  useEffect(() => {
    if (!shopOpen) return;

    let cancelled = false;

    const loadInventory = async () => {
      try {
        const data = await getBoosterInventory();

        if (!cancelled) {
          setInventory(data || {});
        }
      } catch (error) {
        console.error("Unable to load inventory:", error);
      }
    };

    loadInventory();

    return () => {
      cancelled = true;
    };
  }, [shopOpen]);

  const username = serverProgress?.username || user.username || "Player";

  const coins = walletBalance ?? serverProgress?.coins ?? user.coins ?? 0;

  const totalScore = serverProgress?.totalScore ?? getTotalScore(progress);

  const unlockedLevel = Number(
    serverProgress?.unlockedLevel ?? progress.unlocked ?? 1,
  );

  // Purchase booster
  const handlePurchase = async (boosterId) => {
    if (purchasing) return;

    const booster = BOOSTERS.find((item) => item.id === boosterId);

    if (!booster) return;

    if (Number(coins) < booster.price) {
      alert("Not enough coins to purchase this booster.");
      return;
    }

    setPurchasing(boosterId);

    try {
      const referenceId = `BOOSTER-${boosterId}-${crypto.randomUUID()}`;

      await purchaseBooster(boosterId, referenceId);

      alert(`${booster.name} purchased successfully!`);

      await refreshData();

      const updatedInventory = await getBoosterInventory();

      setInventory(updatedInventory || {});
    } catch (error) {
      console.error("Booster purchase failed:", error);

      alert(error.message || "Unable to purchase booster. Please try again.");
    } finally {
      setPurchasing(null);
    }
  };

  // Watch mock ad and earn coins
  const handleWatchAd = async () => {
    if (adLoading) return;

    setAdLoading(true);
    setAdMessage("");
    setAdCountdown(0);

    try {
      // Request a new ad session from backend
      const adSession = await createAdSession();

      const { referenceId, completionToken } = adSession;

      if (!referenceId || !completionToken) {
        throw new Error("Invalid ad session response.");
      }

      // Mock advertisement countdown
      setAdMessage("Advertisement is playing...");

      for (let seconds = 5; seconds > 0; seconds--) {
        setAdCountdown(seconds);

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      setAdCountdown(0);
      setAdMessage("Verifying advertisement...");

      // Submit completion to backend
      const result = await completeAdReward(referenceId, completionToken);

      if (result.duplicate) {
        setAdMessage("This ad reward has already been claimed.");
      } else {
        setAdMessage(
          `Congratulations! You earned ${result.coinsAwarded} coins!`,
        );
      }

      await refreshData();
    } catch (error) {
      console.error("Ad reward failed:", error);

      setAdMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to claim ad reward. Please try again.",
      );
    } finally {
      setAdLoading(false);
      setAdCountdown(0);
    }
  };

  // Logout
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

        {/* Dashboard Statistics */}
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

        {/* Dashboard Actions */}

        <div className="dashboard-actions">
          <button onClick={() => navigate("/game")}>Play Game</button>

          <button onClick={() => navigate(`/game/${unlockedLevel}`)}>
            Continue Game
          </button>

          <button onClick={() => setShopOpen(!shopOpen)}>
            🛒 {shopOpen ? "Close Shop" : "Rewards Shop"}
          </button>
        </div>

        {/* Watch Ad Section */}
        <section className="ad-reward-section">
          <h2>🎬 Watch & Earn Coins</h2>

          <p>Watch a short mock advertisement and earn 10 coins.</p>

          <button onClick={handleWatchAd} disabled={adLoading}>
            {adLoading
              ? adCountdown > 0
                ? `Ad Playing: ${adCountdown}s`
                : "Please wait..."
              : "▶ Watch Ad & Earn 10 Coins"}
          </button>

          {adMessage && (
            <p role="status" aria-live="polite">
              {adMessage}
            </p>
          )}
        </section>

        {/* Rewards Shop */}
        {shopOpen && (
          <section className="rewards-shop">
            <h2>🛒 Rewards Shop</h2>

            <p>Available Coins: 🪙 {coins}</p>

            <div className="booster-grid">
              {BOOSTERS.map((booster) => (
                <div className="booster-card" key={booster.id}>
                  <div className="booster-icon">{booster.icon}</div>

                  <h3>{booster.name}</h3>

                  <p>{booster.description}</p>

                  <p>
                    <strong>🪙 {booster.price} Coins</strong>
                  </p>

                  <p>Owned: {Number(inventory?.[booster.id] || 0)}</p>

                  <button
                    disabled={
                      purchasing !== null || Number(coins) < booster.price
                    }
                    onClick={() => handlePurchase(booster.id)}
                  >
                    {purchasing === booster.id ? "Purchasing..." : "Purchase"}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Level Dashboard */}
        <LevelDashboard serverUnlockedLevel={serverProgress?.unlockedLevel} />
      </main>
    </div>
  );
}

export default Dashboard;
