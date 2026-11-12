
const GameCanvas = ({ canvasRef, width, height }) => {
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
    />
  );
};

export default GameCanvas;
