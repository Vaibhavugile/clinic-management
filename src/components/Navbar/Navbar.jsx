import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowUpRight, ChevronDown } from "lucide-react";
import "./Navbar.css";

const services = [
  { label: "Smile Makeover", href: "/treatments/smile-makeover" },
  { label: "Dental Implants", href: "/treatments/dental-implants" },
  { label: "Root Canal", href: "/treatments/root-canal" },
  { label: "Teeth Whitening", href: "/treatments/teeth-whitening" },
  { label: "Braces & Aligners", href: "/treatments/braces-aligners" },
];

const isHoverDevice = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(hover: hover)").matches;

/*
  BRAND NAME STYLE
  "Anand" bold, "Dental Clinic" elegant italic, twinkling sparkle, aur neeche line ke saath
  tagline. Hover par tooth halka hilta hai aur line lambi ho jaati hai.
  Colors parent se aate hain (hero par white, scroll ke baad dark), isliye dono me sahi dikhega.
*/
const BRAND_CSS = `
  .site-header .brand .brand-copy .brand-title {
    display: flex;
    align-items: baseline;
    gap: 6px;
    font-size: 1.32rem;
    line-height: 1.05;
    font-weight: 800;
    letter-spacing: -0.01em;
    white-space: nowrap;
  }
  .site-header .brand .brand-copy .brand-title .brand-word-light {
    font-family: "Playfair Display", Georgia, "Times New Roman", serif;
    font-style: italic;
    font-weight: 500;
    letter-spacing: 0;
  }
  .site-header .brand .brand-copy .brand-title .brand-sparkle {
    display: inline-block;
    margin-left: 2px;
    font-size: 0.55em;
    font-style: normal;
    vertical-align: super;
    animation: brandTwinkle 2.8s ease-in-out infinite;
  }
  .site-header .brand .brand-copy .brand-tagline {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 5px;
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.24em;
    line-height: 1;
    opacity: 0.88;
  }
  .site-header .brand .brand-copy .brand-tagline::before {
    content: "";
    width: 18px;
    height: 1.5px;
    border-radius: 2px;
    background: currentColor;
    opacity: 0.7;
    transition: width 0.35s ease;
  }
  .site-header .brand:hover .brand-copy .brand-tagline::before {
    width: 32px;
  }
  .site-header .brand:hover .brand-tooth {
    animation: brandWiggle 0.7s ease-in-out;
  }
  @keyframes brandTwinkle {
    0%, 100% { opacity: 0.35; transform: scale(0.8) rotate(0deg); }
    50% { opacity: 1; transform: scale(1.2) rotate(25deg); }
  }
  @keyframes brandWiggle {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-10deg); }
    75% { transform: rotate(10deg); }
  }
  @media (max-width: 480px) {
    .site-header .brand .brand-copy .brand-title { font-size: 1.12rem; }
    .site-header .brand .brand-copy .brand-tagline { font-size: 0.55rem; letter-spacing: 0.18em; }
  }
  @media (prefers-reduced-motion: reduce) {
    .site-header .brand .brand-sparkle,
    .site-header .brand:hover .brand-tooth { animation: none; }
  }
`;

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const headerRef = useRef(null);

  const { pathname, hash, key } = location;

  const isActive = (path) =>
    path === "/" ? pathname === "/" && !hash : pathname.startsWith(path);

  const linkClass = (path) => (isActive(path) ? "nav-link active" : "nav-link");

  // Route change: menus band + hash scroll / top scroll
  useEffect(() => {
    setMenuOpen(false);
    setServicesOpen(false);

    if (hash) {
      const id = hash.slice(1);
      const timer = window.setTimeout(() => {
        const target = document.getElementById(id);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
      return () => window.clearTimeout(timer);
    }

    window.scrollTo({ top: 0, left: 0 });
    return undefined;
  }, [pathname, hash, key]);

  // Header shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mobile menu: body lock, outside click, Escape, resize
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    const onPointerDown = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setMenuOpen(false);
        setServicesOpen(false);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setServicesOpen(false);
      }
    };

    const onResize = () => {
      if (window.innerWidth > 1120) setMenuOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);

  return (
    <header
      ref={headerRef}
      className={`site-header ${pathname === "/" ? "site-header-overlay" : ""} ${
        scrolled ? "site-header-scrolled" : ""
      }`}
    >
      <style>{BRAND_CSS}</style>
      <nav className="navbar container" aria-label="Main navigation">
        <Link
          to="/"
          className="brand"
          aria-label="Anand Dental Clinic and Implant Center - Home"
        >
          <span className="brand-icon" aria-hidden="true">
            <svg
              className="brand-tooth"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5.6c-1.2-1.1-2.9-1.5-4.3-1-2 .7-3.2 2.8-2.9 5.3.3 2.4 1.3 3.6 1.8 5.4.5 1.9.6 4.3 1.6 4.8 1.3.6 1.7-2.3 2.2-3.8.3-.9.7-1.4 1.6-1.4s1.3.5 1.6 1.4c.5 1.5.9 4.4 2.2 3.8 1-.5 1.1-2.9 1.6-4.8.5-1.8 1.5-3 1.8-5.4.3-2.5-.9-4.6-2.9-5.3-1.4-.5-3.1-.1-4.3 1z" />
            </svg>
          </span>
          <span className="brand-copy">
            <strong className="brand-title">
              <span>Anand</span>
              <span className="brand-word-light">
                Dental Clinic
                <span className="brand-sparkle" aria-hidden="true">✦</span>
              </span>
            </strong>
            <small className="brand-tagline">&amp; IMPLANT CENTER</small>
          </span>
        </Link>

        <button
          className="mobile-menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="main-nav-content"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>

        <div
          id="main-nav-content"
          className={`nav-content ${menuOpen ? "nav-content-open" : ""}`}
        >
          <div className="nav-links">
            <Link to="/" className={linkClass("/")}>
              Home
            </Link>

            <Link to="/about" className={linkClass("/about")}>
              About Us
            </Link>

            {/* Home page ke "Meet our dentists" section (id="doctors") par scroll karta hai */}
            <Link
              to="/#doctors"
              className={
                pathname === "/" && hash === "#doctors"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              Our Doctors
            </Link>

            <div
              className="nav-dropdown"
              onMouseEnter={() => isHoverDevice() && setServicesOpen(true)}
              onMouseLeave={() => isHoverDevice() && setServicesOpen(false)}
            >
              <button
                className={`nav-link nav-dropdown-trigger ${
                  isActive("/treatments") ? "active" : ""
                } ${servicesOpen ? "open" : ""}`}
                type="button"
                aria-expanded={servicesOpen}
                aria-haspopup="true"
                onClick={() => setServicesOpen((open) => !open)}
              >
                Services <ChevronDown size={15} />
              </button>

              {servicesOpen && (
                <div className="nav-dropdown-menu">
                  {services.map((service) => (
                    <Link key={service.href} to={service.href}>
                      {service.label}
                    </Link>
                  ))}
                  <Link to="/treatments" className="nav-dropdown-all">
                    View all treatments <ArrowUpRight size={15} />
                  </Link>
                </div>
              )}
            </div>

            <Link to="/gallery" className={linkClass("/gallery")}>
              Smile Gallery
            </Link>

            <Link
              to="/#testimonials"
              className={
                pathname === "/" && hash === "#testimonials"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              Testimonials
            </Link>

            <Link to="/contact" className={linkClass("/contact")}>
              Contact
            </Link>
          </div>

          <Link to="/#appointment" className="btn btn-primary nav-cta">
            Book Appointment <ArrowUpRight size={17} />
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
