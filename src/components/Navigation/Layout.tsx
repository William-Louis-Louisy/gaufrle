import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import HowToPlayModal from "../HowToPlayModal";
import Menu from "./Menu";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [modal, setModal] = React.useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState<boolean>(false);
  return (
    <div className="relative">
      {/* Header */}
      <Header
        setModal={setModal}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />

      {/* Main */}
      <main className="main-view">{children}</main>
      {/* Footer */}
      <Footer />

      {/* Modal */}
      {modal && <HowToPlayModal modal={modal} setModal={setModal} />}

      {/* Menu */}
      {isMenuOpen && (
        <Menu
          setModal={setModal}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
        />
      )}
    </div>
  );
}
