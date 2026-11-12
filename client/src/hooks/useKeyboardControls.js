
import { useEffect } from "react";

const useKeyboardControls = (keysRef, beginPlayRef) => {
  useEffect(() => {
    console.log("KEYBOARD CONTROL HOOK MOUNTED");

    const allowedKeys = [
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      " ",
      "a", "A",
      "d", "D",
      "w", "W",
    ];

    const handleKeyDown = (event) => {
      console.log("KEY PRESSED:", event.key);

      if (!allowedKeys.includes(event.key)) return;

      event.preventDefault();

      keysRef.current[event.key] = true;

      if (beginPlayRef.current) {
        beginPlayRef.current();
      }
    };

    const handleKeyUp = (event) => {
      keysRef.current[event.key] = false;
    };

    const clearKeys = () => {
      keysRef.current = {};
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", clearKeys);

    return () => {
      console.log("KEYBOARD CONTROL HOOK CLEANED UP");

      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", clearKeys);
    };
  }, [keysRef, beginPlayRef]);
};

export default useKeyboardControls;
