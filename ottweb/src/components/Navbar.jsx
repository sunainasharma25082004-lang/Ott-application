import React, { useState, useEffect } from 'react';
import { Download, Menu, X, ShieldAlert } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'features', label: 'Features' },
    { id: 'trending', label: 'Trending' },
    { id: 'talent-hunt', label: 'Talent Hunt' },
    { id: 'child-safety', label: 'Child Safety' },
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'terms', label: 'Terms' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    if (['home', 'how-it-works', 'features', 'trending', 'talent-hunt', 'contact'].includes(id)) {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className={`navbar-header ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container navbar-container">
        <a href="#home" onClick={() => handleNavClick('home')} className="navbar-logo">
          <img src="./app-logo.png" alt="VIZ TV Logo" className="logo-img" />
          <div className="logo-text">
            <span className="logo-name">VIZ TV</span>
            <span className="logo-sub">STREAM & TALENT</span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="desktop-nav">
          <ul>
            {navLinks.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => handleNavClick(link.id)}
                  className={`nav-link ${activeTab === link.id ? 'active' : ''}`}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="navbar-actions">
          <a
            href="https://expo.dev/artifacts/eas/fklQpTWgH3Kv9RysP4vrtlXus40-przEn1Z9GIbzZ9A.aab"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary nav-download-btn"
          >
            <Download size={18} />
            <span>Download App</span>
          </a>

          <button
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <ul>
            {navLinks.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => handleNavClick(link.id)}
                  className={`mobile-link ${activeTab === link.id ? 'active' : ''}`}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="mobile-drawer-cta">
            <a
              href="https://expo.dev/artifacts/eas/fklQpTWgH3Kv9RysP4vrtlXus40-przEn1Z9GIbzZ9A.aab"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full"
            >
              <Download size={18} />
              Download Android App (.aab)
            </a>
          </div>
        </div>
      )}

      <style>{`
        .navbar-header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          padding: 1.1rem 0;
          transition: var(--transition);
          background: rgba(10, 11, 16, 0.4);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .navbar-scrolled {
          padding: 0.75rem 0;
          background: rgba(14, 16, 26, 0.92);
          border-bottom: 1px solid var(--border-color);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        .navbar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }
        .logo-img {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          object-fit: cover;
          box-shadow: 0 0 20px var(--primary-glow);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .logo-text {
          display: flex;
          flex-direction: column;
        }
        .logo-name {
          font-family: 'Outfit', sans-serif;
          font-weight: 900;
          font-size: 1.5rem;
          line-height: 1;
          background: linear-gradient(135deg, #ffffff 30%, var(--primary-hover) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: 0.5px;
        }
        .logo-sub {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 1.5px;
          margin-top: 2px;
        }
        .desktop-nav ul {
          display: flex;
          align-items: center;
          gap: 1.2rem;
          list-style: none;
        }
        .nav-link {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 0.92rem;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
          padding: 6px 2px;
          position: relative;
        }
        .nav-link:hover, .nav-link.active {
          color: var(--text-main);
        }
        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--primary);
          border-radius: 2px;
          box-shadow: 0 0 8px var(--primary);
        }
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .nav-download-btn {
          padding: 10px 20px;
          font-size: 0.9rem;
        }
        .mobile-toggle {
          display: none;
          background: none;
          border: none;
          color: var(--text-main);
          cursor: pointer;
        }
        .mobile-drawer {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          background: #0e101a;
          border-bottom: 1px solid var(--border-color);
          padding: 1.5rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
        }
        .mobile-drawer ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .mobile-link {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 1.1rem;
          font-weight: 600;
          width: 100%;
          text-align: left;
          padding: 8px 0;
        }
        .mobile-link.active {
          color: var(--primary);
        }
        .w-full {
          width: 100%;
        }

        @media (max-width: 1100px) {
          .desktop-nav {
            display: none;
          }
          .mobile-toggle {
            display: block;
          }
          .mobile-drawer {
            display: block;
          }
          .nav-download-btn {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
