import { useEffect, useRef } from "react";

export function useInactivity(onInactive, timeout = 10 * 60 * 1000) {
  // Ref para siempre tener el callback más reciente sin re-lanzar el efecto
  const onInactiveRef = useRef(onInactive);
  useEffect(() => { onInactiveRef.current = onInactive; }, [onInactive]);

  const timerRef = useRef();

  useEffect(() => {
    const resetTimer = () => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onInactiveRef.current(), timeout);
    };

    const events = ["mousemove", "mousedown", "keydown", "click", "scroll", "touchstart"];
    resetTimer();
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      clearTimeout(timerRef.current);
    };
  }, [timeout]);
}
