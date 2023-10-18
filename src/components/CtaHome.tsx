import React from "react";
import { FaChevronRight } from "react-icons/fa6";
import { gridMetadata } from "../utils/CellStatus";

export interface CtaHomeProps {
  mode: "normal" | "medium" | "hard";
  title: string;
  description: string;
  cellsNumber: number;
  colsNumber: string;
}

function CtaHome({
  mode,
  title,
  description,
  cellsNumber,
  colsNumber,
}: CtaHomeProps) {
  return (
    <div
      className={`home-card ${mode === "normal" ? "md:min-h-full" : ""}`}
      title={description}
    >
      <div className={`grid ${colsNumber} w-fit mb-14`}>
        {[...Array(cellsNumber)].map((_, i) => (
          <div
            key={i}
            className={`${
              gridMetadata[mode].nonPlayableCells.includes(i)
                ? "mini-disabled-cell"
                : "mini-normal-cell"
            }`}
          />
        ))}
      </div>
      <div className="home-card-title">
        <span className="theme-text-accent">{title}</span>
        <FaChevronRight className="theme-text-accent" />
      </div>
    </div>
  );
}

export default CtaHome;
