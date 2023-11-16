import { useState } from "react";
import { UPDATES } from "../utils/Updates";
import { IoInformationCircleSharp } from "react-icons/io5";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";

function PatchNotePanel() {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  return (
    <div className="theme-lmnt p-4 mb-8 min-w-full md:rounded-md md:max-w-4/5 md:min-w-[40%] flex flex-col gap-4">
      {/* Panel heading */}
      <div className="flex flex-row items-center justify-between">
        <span className="flex flex-row items-center gap-1">
          <IoInformationCircleSharp className="w-5 h-5" />
          <h4 className="uppercase font-bold">Mises à jour :</h4>
        </span>

        <button
          onClick={() => setIsVisible(!isVisible)}
          className="text-sm hover:underline duration-200 cursor-pointer"
        >
          {isVisible ? (
            <FaChevronUp title="Masquer les mises à jour" />
          ) : (
            <FaChevronDown title="Afficher les mises à jour" />
          )}
        </button>
      </div>

      {/* Panel content */}
      {isVisible &&
        UPDATES.map((update) => (
          <div className="flex flex-col gap-2">
            <span className="font-semibold">
              {`(${update.releaseDate})`} {update.title}
            </span>
            <ul className="px-[24px] flex flex-col gap-1 list-disc">
              {update.features.map((feature) => (
                <li className="text-sm">
                  <span>{feature.title}</span>{" "}
                  <p className="italic">{feature.description}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
}

export default PatchNotePanel;
