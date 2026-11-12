
import { Chevron } from "./GameIcons";

const GameControls = ({ controlProps }) => {
  return (
    <div className="dpad">
      <button
        className="dpad-btn dpad-up"
        aria-label="Jump"
        {...controlProps(" ")}
      >
        <Chevron dir="up" />
      </button>

      <button
        className="dpad-btn dpad-left"
        aria-label="Left"
        {...controlProps("ArrowLeft")}
      >
        <Chevron dir="left" />
      </button>

      <button
        className="dpad-btn dpad-right"
        aria-label="Right"
        {...controlProps("ArrowRight")}
      >
        <Chevron dir="right" />
      </button>

      <button
        className="dpad-btn dpad-down"
        aria-label="Down"
        {...controlProps("ArrowDown")}
      >
        <Chevron dir="down" />
      </button>
    </div>
  );
};

export default GameControls;
