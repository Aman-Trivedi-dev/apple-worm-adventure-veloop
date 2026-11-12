
export const Chevron = ({ dir }) => {
  const rotate = {
    up: 0,
    right: 90,
    down: 180,
    left: 270,
  }[dir];

  return (
    <svg
      viewBox="0 0 24 24"
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden="true"
    >
      <path
        d="M5 15 L12 8 L19 15"
        fill="none"
        stroke="#fff"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const RestartIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M5 12a7 7 0 1 0 2.2-5.1M5 4v4h4"
      fill="none"
      stroke="#fff"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const HomeIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M4 11 L12 4 L20 11 V20 H14 V14 H10 V20 H4 Z"
      fill="none"
      stroke="#fff"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
  </svg>
);
