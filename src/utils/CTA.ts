import { CtaHomeProps } from "../components/CtaHome";

export const CTA: CtaHomeProps[] = [
  {
    mode: "normal",
    title: "Niveau 1",
    description: "Découvrez le jeu en douceur",
    cellsNumber: 25,
    colsNumber: "grid-cols-5",
  },
  {
    mode: "medium",
    title: "Niveau 2",
    description: "Un peu plus de challenge",
    cellsNumber: 49,
    colsNumber: "grid-cols-7",
  },
  {
    mode: "hard",
    title: "Niveau 3",
    description: "Un vrai challenge",
    cellsNumber: 49,
    colsNumber: "grid-cols-7",
  },
];
