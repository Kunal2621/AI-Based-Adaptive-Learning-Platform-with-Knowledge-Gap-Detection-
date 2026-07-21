import { useState } from "react";
import { Link } from "react-router-dom";
import banner from "../../assests/images/banner.png";


export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-black/5">
      <nav className="max-w-container-max mx-auto px-3 py-1 flex justify-between items-center">
        <div className="flex items-center gap-1">
          <Link to="/">
            <img src={banner} alt="Knowledge guru logo" className="w-43 cursor-pointer" />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors">
            Home
          </Link>
          <a className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors" href="#">
            Courses
          </a>
          <a className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors" href="#">
            Enterprise
          </a>
          <a className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors" href="#">
            Pricing
          </a>
          <Link
            to="/register"
            className="bg-primary hover:bg-primary-container text-on-primary px-6 py-2.5 rounded-xl font-label-md transition-all transform active:scale-95 shadow-sm"
          >
            Get Started
          </Link>
        </div>

        <button
          className="md:hidden text-on-surface"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className="material-symbols-outlined">{menuOpen ? "close" : "menu"}</span>
        </button>
      </nav>

      {menuOpen && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-4 bg-surface border-t border-black/5">
          <a className="text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#">
            Courses
          </a>
          <a className="text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#">
            Enterprise
          </a>
          <a className="text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#">
            Pricing
          </a>
          <Link
            to="/register"
            className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-label-md text-center"
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}
