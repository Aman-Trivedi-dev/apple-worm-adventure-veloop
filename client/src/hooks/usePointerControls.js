
const usePointerControls = (keysRef, beginPlayRef) => {
  const pressKey = (key) => (event) => {
    event.preventDefault();

    keysRef.current[key] = true;
    beginPlayRef.current();
  };

  const releaseKey = (key) => () => {
    keysRef.current[key] = false;
  };

  const controlProps = (key) => ({
    onPointerDown: pressKey(key),
    onPointerUp: releaseKey(key),
    onPointerLeave: releaseKey(key),
    onPointerCancel: releaseKey(key),
    onContextMenu: (event) => event.preventDefault(),
  });

  return controlProps;
};

export default usePointerControls;
