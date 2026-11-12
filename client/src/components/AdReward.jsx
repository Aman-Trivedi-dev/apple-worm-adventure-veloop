
import { useEffect, useRef, useState } from "react";
import {
  createAdSession,
  completeAdReward,
} from "../services/adService";

import "./AdReward.css";

function AdReward({ onRewarded }) {
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const sessionRef = useRef(null);
  const completedRef = useRef(false);

  // Countdown for the mock advertisement
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown((previous) => previous - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  // Complete ad after countdown
  useEffect(() => {
    if (countdown !== 0 || !sessionRef.current) return;
    if (completedRef.current) return;

    completedRef.current = true;

    const finishAd = async () => {
      try {
        setLoading(true);

        const result = await completeAdReward({
          referenceId: sessionRef.current.referenceId,
          completionToken: sessionRef.current.completionToken,
        });

        setMessage(
          result.duplicate
            ? "This ad reward was already credited."
            : `Congratulations! You earned ${result.coinsAwarded} coins!`
        );

        onRewarded?.(result);
      } catch (err) {
        setError(err.message || "Unable to claim ad reward.");
      } finally {
        setLoading(false);
        setCountdown(null);
        sessionRef.current = null;
      }
    };

    finishAd();
  }, [countdown, onRewarded]);

  const handleWatchAd = async () => {
    if (loading || countdown !== null) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const session = await createAdSession();

      sessionRef.current = session;
      completedRef.current = false;

      setMessage("Your mock advertisement is starting...");
      setCountdown(5);
    } catch (err) {
      setError(err.message || "Unable to start advertisement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="ad-reward">
      <h2>🎬 Watch & Earn Coins</h2>

      <p>
        Watch a short mock advertisement and earn 10 coins.
      </p>

      {countdown !== null && countdown > 0 && (
        <div className="ad-countdown">
          <h3>📺 Advertisement Playing</h3>
          <p>Reward unlocks in {countdown} seconds</p>
        </div>
      )}

      <button
        className="watch-ad-button"
        onClick={handleWatchAd}
        disabled={loading || countdown !== null}
      >
        {loading
          ? "Please wait..."
          : countdown !== null
            ? "Advertisement Playing..."
            : "▶ Watch Ad & Earn 10 Coins"}
      </button>

      {message && (
        <p className="ad-success">{message}</p>
      )}

      {error && (
        <p className="ad-error">{error}</p>
      )}
    </section>
  );
}

export default AdReward;
