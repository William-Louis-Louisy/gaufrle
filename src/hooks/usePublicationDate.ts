import { useEffect, useState } from "react";
import { getNextGridChange } from "../utils/GridSchedule";
import { getPublicationDate } from "../utils/PublicationClock";

/**
 * Single source of truth for the published calendar day in Europe/Paris.
 * Changes at Paris midnight, even for visitors in another timezone.
 * Also resynchronizes after browser throttling, focus or a suspended tab.
 */
export function usePublicationDate(): string {
  const [publicationDate, setPublicationDate] = useState(() =>
    getPublicationDate(new Date())
  );

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const schedule = () => {
      if (timer !== undefined) clearTimeout(timer);

      const now = new Date();
      const next = getNextGridChange(now, false);
      const delay = Math.max(50, next.getTime() - now.getTime() + 50);

      timer = setTimeout(() => {
        setPublicationDate(getPublicationDate(new Date()));
        schedule();
      }, delay);
    };

    const resynchronize = () => {
      setPublicationDate(getPublicationDate(new Date()));
      schedule();
    };

    const onVisibilityChange = () => {
      if (!document.hidden) resynchronize();
    };

    schedule();
    window.addEventListener("focus", resynchronize);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (timer !== undefined) clearTimeout(timer);
      window.removeEventListener("focus", resynchronize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return publicationDate;
}
