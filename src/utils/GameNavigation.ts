/**
 * The game modes have one identity across desktop navigation, mobile menu,
 * and the landing page. Keep display labels, destinations and artwork together.
 */
export const GAME_NAVIGATION = [
  {
    name: "Gaufrette",
    href: "/normal-game",
    imgSrc: "/images/normal.webp",
    imgAlt: "Médaille de bronze",
  },
  {
    name: "Gauf' au suc'",
    href: "/medium-game",
    imgSrc: "/images/medium.webp",
    imgAlt: "Médaille d'argent",
  },
  {
    name: "Gaufre salée",
    href: "/hard-game",
    imgSrc: "/images/hard.webp",
    imgAlt: "Médaille d'or",
  },
] as const;
