import type { CtaHomeProps } from "../types/CtaHome";

export const CTA: CtaHomeProps[] = [
  {
    mode: "normal",
    title: "Gaufrette",
    description: "Découvrez le jeu en douceur",
    cellsNumber: 25,
    colsNumber: "grid-cols-5",
    href: "/normal-game",
  },
  {
    mode: "medium",
    title: "Gauf' au suc'",
    description: "Un challenge intermédiaire",
    cellsNumber: 49,
    colsNumber: "grid-cols-7",
    href: "/medium-game",
  },
  {
    mode: "hard",
    title: "Gaufre salée",
    description: "Un vrai défi",
    cellsNumber: 49,
    colsNumber: "grid-cols-7",
    href: "/hard-game",
  },
];
