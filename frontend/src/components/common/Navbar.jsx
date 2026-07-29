import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import banner from "../../assests/images/banner.svg";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-xl border-b border-black/5">
      <nav className="w-full max-w-[1400px] mx-auto h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Left Corner Logo */}
        <div className="flex items-center">
          <a href="/" onClick={handleScrollToTop} className="flex items-center">
            <img 
              src={banner} 
              alt="knowledge.guru logo" 
              className="h-8 sm:h-9 md:h-10 w-auto object-contain cursor-pointer" 
            />
          </a>
        </div>

        {/* Desktop Links (GAP INCREASED HERE) */}
        <div className="hidden md:flex items-center gap-10 lg:gap-14">
          <a
            href="/"
            onClick={handleScrollToTop}
            className="text-base font-medium tracking-wide text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          >
            Home
          </a>

          <a
            href="#courses"
            onClick={(e) => handleScroll(e, "courses")}
            className="text-base font-medium tracking-wide text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          >
            Courses
          </a>

          <a
            href="#enterprise"
            onClick={(e) => handleScroll(e, "enterprise")}
            className="text-base font-medium tracking-wide text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          >
            Enterprise
          </a>

          <a
            href="#pricing"
            onClick={(e) => handleScroll(e, "pricing")}
            className="text-base font-medium tracking-wide text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          >
            Pricing
          </a>

          <Link
            to="/login"
            className="ml-2 bg-primary hover:bg-primary-container text-on-primary px-6 py-2.5 rounded-xl font-medium transition-all active:scale-95 shadow-sm"
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
        <div className="md:hidden px-6 py-6 flex flex-col gap-5 bg-surface border-t border-black/5">
          <a
            href="/"
            onClick={handleScrollToTop}
            className="text-base font-medium text-on-surface-variant hover:text-primary transition-colors"
          >
            Home
          </a>
          <a
            href="#courses"
            onClick={(e) => handleScroll(e, "courses")}
            className="text-base font-medium text-on-surface-variant hover:text-primary transition-colors"
          >
            Courses
          </a>
          <a
            href="#enterprise"
            onClick={(e) => handleScroll(e, "enterprise")}
            className="text-base font-medium text-on-surface-variant hover:text-primary transition-colors"
          >
            Enterprise
          </a>
          <a
            href="#pricing"
            onClick={(e) => handleScroll(e, "pricing")}
            className="text-base font-medium text-on-surface-variant hover:text-primary transition-colors"
          >
            Pricing
          </a>
          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="bg-primary text-on-primary px-6 py-3 rounded-xl font-medium text-center mt-2"
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}