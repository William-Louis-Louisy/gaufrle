import DarkModeToggle from "../DarkModeToggle";
import { Dispatch, SetStateAction } from "react";
import { FaCircleQuestion, FaBars } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";

type HeaderProps = {
  setModal: Dispatch<SetStateAction<boolean>>;
  isMenuOpen: boolean;
  setIsMenuOpen: Dispatch<SetStateAction<boolean>>;
};

function Header({ setModal, isMenuOpen, setIsMenuOpen }: HeaderProps) {
  const location = useLocation();
  const pathname = location.pathname;

  const navigation = [
    {
      name: "Gaufrette",
      href: "/normal-game",
      current: pathname === "/normal-game",
      imgSrc:
        "https://ucarecdn.com/d3a18e9a-da74-4e57-a6a5-ae1e782706e6/-/preview/500x500/-/quality/smart/-/format/auto/",
    },
    {
      name: "Gauf' au suc'",
      href: "/medium-game",
      current: pathname === "/medium-game",
      imgSrc:
        "https://ucarecdn.com/2d3b5c90-d564-41e9-b5f5-bb200aff634a/-/preview/500x500/-/quality/smart/-/format/auto/",
    },
    {
      name: "Gaufre salée",
      href: "/hard-game",
      current: pathname === "/hard-game",
      imgSrc:
        "https://ucarecdn.com/4615a20f-db47-42e2-87f7-e808567f1b1d/-/preview/500x500/-/quality/smart/-/format/auto/",
    },
  ];

  const handleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = "unset";
  };

  return (
    <div className="theme-header">
      <Link to="/">
        <span className="logo">GAUFRLE</span>
      </Link>

      <div className="md:flex flex-row items-center h-full gap-6 hidden ">
        {/* Naivigation */}
        <nav aria-label="Choisir une difficulté" className="flex flex-row items-center justify-center h-full gap-3">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              aria-current={item.current ? "page" : undefined}
              className={`nav-link ${
                item.current
                  ? "theme-text-accent theme-nav-border-accnt"
                  : "theme-text theme-nav-border"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <DarkModeToggle />
        <button type="button" onClick={() => setModal(true)} aria-label="Comment jouer ?">
          <FaCircleQuestion className="text-2xl mb-1 theme-text" />
        </button>
      </div>

      <button
        type="button"
        aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-navigation"
        onClick={() => handleMenu()}
        className="flex md:hidden"
        title="Ouvrir le menu"
      >
        <FaBars className="text-2xl theme-text" />
      </button>
    </div>
  );
}

export default Header;
