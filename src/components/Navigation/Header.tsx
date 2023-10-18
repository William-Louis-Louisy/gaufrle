import DarkModeToggle from "../DarkModeToggle";
import { Dispatch, SetStateAction } from "react";
import { FaCircleQuestion, FaBars } from "react-icons/fa6";
import { useLocation } from "react-router-dom";

function Header({ setModal }: { setModal: Dispatch<SetStateAction<boolean>> }) {
  const location = useLocation();
  const pathname = location.pathname;

  const navigation = [
    {
      name: "Niveau 1",
      href: "/normal-game",
      current: pathname === "/normal-game",
    },
    {
      name: "Niveau 2",
      href: "/medium-game",
      current: pathname === "/medium-game",
    },
    {
      name: "Niveau 3",
      href: "/hard-game",
      current: pathname === "/hard-game",
    },
  ];

  return (
    <div className="theme-header theme-lmnt">
      <a href="/">
        <span className="logo">GAUFRLE</span>
      </a>

      <div className="md:flex flex-row items-center h-full gap-6 hidden ">
        {/* Naivigation */}
        <nav className="flex flex-row items-center justify-center h-full gap-3">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`nav-link ${
                item.current
                  ? "theme-text-accent theme-nav-border-accnt"
                  : "theme-text theme-nav-border"
              }`}
            >
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
        <FaBars className="text-2xl theme-text" />
      </button>
    </div>
  );
}

export default Header;
