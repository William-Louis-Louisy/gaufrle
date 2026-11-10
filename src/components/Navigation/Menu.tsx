import React from "react";
import { useLocation } from "react-router";
import DarkModeToggle from "../DarkModeToggle";
import { FaCircleQuestion } from "react-icons/fa6";

function Menu({
  setModal,
  isMenuOpen,
  setIsMenuOpen,
}: {
  isMenuOpen: boolean;
  setModal: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const location = useLocation();
  const pathname = location.pathname;

  const navigation = [
    {
      name: "Gaufrette",
      href: "/normal-game",
      current: pathname === "/normal-game",
      imgSrc:
        "/images/normal.webp",
      imgAlt: "Médaille de bronze",
    },
    {
      name: "Gauf' au suc'",
      href: "/medium-game",
      current: pathname === "/medium-game",
      imgSrc:
        "/images/medium.webp",
      imgAlt: "Médaille d'argent",
    },
    {
      name: "Gaufre salée",
      href: "/hard-game",
      current: pathname === "/hard-game",
      imgSrc:
        "/images/hard.webp",
      imgAlt: "Médaille d'or",
    },
  ];

  // Handle HowToPlayModal visibility
  const handleModal = () => {
    setModal(true);
    setIsMenuOpen(false);
    document.body.style.overflow = "unset";
  };

  React.useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else if (!isMenuOpen) {
      document.body.style.overflow = "unset";
    }
  }, [isMenuOpen]);

  return (
    <div id="mobile-navigation" role="navigation" aria-label="Navigation mobile" className="absolute py-6 mt-[60px] h-[calc(100dvh-60px)] w-full theme-bg top-0 flex flex-col items-start">
      {navigation.map((item, index) => (
        <a
          key={item.name}
          href={item.href}
          aria-current={item.current ? "page" : undefined}
          className={`px-6 py-6 theme-text font-bold w-full text-left border-t flex flex-row items-center gap-4 ${
            index === navigation.length - 1 ? "border-b" : ""
          }`}
        >
          <img src={item.imgSrc} className="w-6 h-6" alt={item.imgAlt} />
          {item.name}
        </a>
      ))}

      {/* How to play */}
      <div className="flex flex-row items-center mt-12 mx-6 font-semibold theme-text gap-2">
        Comment jouer :
        <button type="button" aria-label="Comment jouer ?" onClick={() => handleModal()}>
          <FaCircleQuestion className="text-xl theme-text" />
        </button>
      </div>

      {/* Dark mode */}
      <div className="flex flex-row items-center mt-6 mx-6 font-semibold theme-text gap-2">
        <span className="mb-1">Thème :</span>
        <DarkModeToggle />
      </div>
    </div>
  );
}

export default Menu;
