import { LEVELS } from "./levels";

export const PROGRESS_EVENT = "progressUpdated";

export const getUserId = () => {
  const storedUser =
    localStorage.getItem("user") || sessionStorage.getItem("user");

  if (!storedUser) return "guest";

  try {
    const user = JSON.parse(storedUser);
    return user._id || user.id || user.email || user.username || "guest";
  } catch {
    return "guest";
  }
};

// Same key your old tutorial used, so fullscreen is still only asked once
export const getTutorialKey = () => `appleWormTutorialCompleted_${getUserId()}`;

const progressKey = () => `appleWormProgress_${getUserId()}`;

// { unlocked: highest level number the player can open, best: { [levelId]: score } }
export const getProgress = () => {
  try {
    const raw = localStorage.getItem(progressKey());

    if (raw) {
      const saved = JSON.parse(raw);

      return {
        unlocked: Math.min(Math.max(saved.unlocked || 1, 1), LEVELS.length),
        best: saved.best || {},
      };
    }
  } catch {
    // fall through to the default
  }

  return { unlocked: 1, best: {} };
};

// Sum of the best score of every level (use this for "Total Score")
export const getTotalScore = (progress = getProgress()) =>
  Object.values(progress.best).reduce((sum, value) => sum + (Number(value) || 0), 0);

// Call when a level is finished: saves the best score and opens the next level
export const completeLevel = (levelId, score) => {
  const progress = getProgress();

  progress.best[levelId] = Math.max(progress.best[levelId] || 0, score);
  progress.unlocked = Math.max(
    progress.unlocked,
    Math.min(levelId + 1, LEVELS.length),
  );

  try {
    localStorage.setItem(progressKey(), JSON.stringify(progress));
  } catch {
    // storage full or blocked: the game still works, progress just isn't saved
  }

  // Tell any mounted dashboard / summary cards to re-read the progress
  window.dispatchEvent(new Event(PROGRESS_EVENT));

  return progress;
};