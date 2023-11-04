import React from "react";
import { FaChevronRight } from "react-icons/fa6";
import { gridMetadata } from "../utils/CellStatus";
import { Link } from "react-router-dom";

export interface CtaHomeProps {
  mode: "normal" | "medium" | "hard";
  title: string;
  description: string;
  cellsNumber: number;
  colsNumber: string;
  href: string;
}

function CtaHome({
  mode,
  title,
  description,
  cellsNumber,
  colsNumber,
  href,
}: CtaHomeProps) {
  return (
    <Link
      to={href}
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
    </Link>
  );
}

export default CtaHome;
