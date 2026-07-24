import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import banner from "../../assests/images/banner.png";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Top par scroll karne ke liye (Logo & Home link)
  const handleScrollToTop = (e) => {
    e.preventDefault();
    setMenuOpen(false);

    if (location.pathname !== "/") {
      navigate("/");
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // 2. Sections par scroll karne ke liye (Courses, Enterprise, Pricing)
  const handleScroll = (e, targetId) => {
    e.preventDefault();
    setMenuOpen(false);

    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: targetId } });
      return;
    }

    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-black/5">
      <nav className="max-w-container-max mx-auto px-3 py-1 flex justify-between items-center">
        {/* LOGO: Click karne par top par jayega */}
        <div className="flex items-center gap-1">
          <a href="/" onClick={handleScrollToTop}>
            <img src={banner} alt="Knowledge guru logo" className="w-43 cursor-pointer" />
          </a>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {/* HOME: Click karne par top par jayega */}
          <a
            href="/"
            onClick={handleScrollToTop}
            className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          >
            Home
          </a>

          <a
            href="#courses"
            onClick={(e) => handleScroll(e, "courses")}
            className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          >
            Courses
          </a>

          <a
            href="#enterprise"
            onClick={(e) => handleScroll(e, "enterprise")}
            className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          >
            Enterprise
          </a>

          <a
            href="#pricing"
            onClick={(e) => handleScroll(e, "pricing")}
            className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          >
            Pricing
          </a>

          <Link
            to="/login"
            className="bg-primary hover:bg-primary-container text-on-primary px-6 py-2.5 rounded-xl font-label-md transition-all transform active:scale-95 shadow-sm"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="md:hidden text-on-surface"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className="material-symbols-outlined">{menuOpen ? "close" : "menu"}</span>
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-4 bg-surface border-t border-black/5">
          <a
            href="/"
            onClick={handleScrollToTop}
            className="text-label-md text-on-surface-variant hover:text-primary transition-colors"
          >
            Home
          </a>
          <a
            href="#courses"
            onClick={(e) => handleScroll(e, "courses")}
            className="text-label-md text-on-surface-variant hover:text-primary transition-colors"
          >
            Courses
          </a>
          <a
            href="#enterprise"
            onClick={(e) => handleScroll(e, "enterprise")}
            className="text-label-md text-on-surface-variant hover:text-primary transition-colors"
          >
            Enterprise
          </a>
          <a
            href="#pricing"
            onClick={(e) => handleScroll(e, "pricing")}
            className="text-label-md text-on-surface-variant hover:text-primary transition-colors"
          >
            Pricing
          </a>
          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-label-md text-center"
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}