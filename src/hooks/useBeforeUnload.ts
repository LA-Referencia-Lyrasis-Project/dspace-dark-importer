import { useEffect } from "react";

export function useBeforeUnload(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled]);
}
