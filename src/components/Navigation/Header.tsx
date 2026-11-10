import DarkModeToggle from "../DarkModeToggle";
import { GAME_NAVIGATION } from "../../utils/GameNavigation";
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

  const navigation = GAME_NAVIGATION.map((item) => ({
    ...item,
    current: pathname === item.href,
  }));

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
