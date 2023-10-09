import { useState, Dispatch, SetStateAction } from "react";
import DarkModeToggle from "../DarkModeToggle";
import { FaCircleQuestion, FaBars } from "react-icons/fa6";

const navigation = [
  { name: "Niveau 1", href: "/normal-game" },
  { name: "Niveau 2", href: "/medium-game" },
  { name: "Niveau 3", href: "/hard-game" },
];

function Header({ setModal }: { setModal: Dispatch<SetStateAction<boolean>> }) {
  return (
    <div className="theme-header theme-lmnt">
      <a href="/">
        <span className="logo">GAUFRLE</span>
      </a>

      <div className="md:flex flex-row items-center h-full gap-6 hidden ">
        {/* Naivigation */}
        <nav className="flex flex-row items-center justify-center h-full gap-3">
          {navigation.map((item) => (
            <a key={item.name} href={item.href} className="nav-link theme-text">
              {item.name}
            </a>
          ))}
        </nav>
        <DarkModeToggle />
        <button onClick={() => setModal(true)}>
          <FaCircleQuestion className="text-2xl mb-1 theme-text" />
        </button>
      </div>

      <button className="flex md:hidden">
        <FaBars className="text-2xl" />
      </button>
    </div>
  );
}

export default Header;
