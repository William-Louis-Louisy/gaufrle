import { CtaHomeProps } from "../components/CtaHome";

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
    description: "Un peu plus de challenge",
    cellsNumber: 49,
    colsNumber: "grid-cols-7",
    href: "/medium-game",
  },
  {
    mode: "hard",
    title: "Gaufre salée",
    description: "Un vrai challenge",
    cellsNumber: 49,
    colsNumber: "grid-cols-7",
    href: "/hard-game",
  },
];
