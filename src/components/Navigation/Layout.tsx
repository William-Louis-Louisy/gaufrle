import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      {/* Header */}
      <Header />
      {/* Sidebar */}
      {/* <Sidebar /> */}
      {/* Main */}
      <main className="min-h-[calc(100vh-64px)] theme-bg theme-text">
        {children}
      </main>
      {/* Footer */}
      <Footer />
    </>
  );
}
