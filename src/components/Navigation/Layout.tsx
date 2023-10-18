import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import HowToPlayModal from "../HowToPlayModal";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [modal, setModal] = React.useState<boolean>(false);
  return (
    <div className="relative">
      {/* Header */}
      <Header setModal={setModal} />
      {/* Sidebar */}
      {/* <Sidebar /> */}
      {/* Main */}
      <main className="main-view">{children}</main>
      {/* Footer */}
      <Footer />

      {/* Modal */}
      {modal && <HowToPlayModal modal={modal} setModal={setModal} />}
    </div>
  );
}
