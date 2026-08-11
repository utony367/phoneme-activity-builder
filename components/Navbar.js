"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="nav-container">
        <Link href="/" className="nav-brand" onClick={closeMenu}>
          Phoneme Builder
        </Link>

        <div className="desktop-nav">
          <Link href="/">Home</Link>
          <Link href="/wordle">Wordle</Link>
          <Link href="/word-search">Word Search</Link>
          <Link href="/about">About</Link>
          <Link href="/settings">Settings</Link>
        </div>

        <button
          type="button"
          className="menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
        >
          ☰
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-nav">
          <Link href="/" onClick={closeMenu}>Home</Link>
          <Link href="/wordle" onClick={closeMenu}>Wordle</Link>
          <Link href="/word-search" onClick={closeMenu}>Word Search</Link>
          <Link href="/about" onClick={closeMenu}>About</Link>
          <Link href="/settings" onClick={closeMenu}>Settings</Link>
        </div>
      )}
    </nav>
  );
}