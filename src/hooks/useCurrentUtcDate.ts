import { useEffect, useState } from "react";
import { getNextGridChangeUtc, getUtcDate } from "../utils/GridSchedule";

/**
 * Keep the selected UTC publication day in sync even if the tab remains open.
 * Recheck when the page regains focus after a suspended browser timer.
 */
export function useCurrentUtcDate(): string {
  const [todayUtc, setTodayUtc] = useState(() => getUtcDate(new Date()));

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const sync = () => setTodayUtc(getUtcDate(new Date()));

    const schedule = () => {
      const now = new Date();
      const next = getNextGridChangeUtc(now, false);
      timer = setTimeout(() => {
        sync();
        schedule();
      }, Math.max(50, next.getTime() - now.getTime() + 50));
    };

    const refreshOnReturn = () => {
      sync();
      clearTimeout(timer);
      schedule();
    };
    const refreshOnVisibilityChange = () => {
      if (!document.hidden) refreshOnReturn();
    };

    schedule();
    window.addEventListener("focus", refreshOnReturn);
    document.addEventListener("visibilitychange", refreshOnVisibilityChange);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", refreshOnReturn);
      document.removeEventListener("visibilitychange", refreshOnVisibilityChange);
    };
  }, []);

  return todayUtc;
}
