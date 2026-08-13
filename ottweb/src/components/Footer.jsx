import React from 'react';
import { Download, Shield, Heart } from 'lucide-react';

export default function Footer({ setActiveTab, onNavigateDeletion }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top-grid">
          {/* Brand Info */}
          <div className="footer-brand-col">
            <a href="#home" className="footer-logo">
              <img src="./app-logo.png" alt="VIZ TV Logo" className="footer-logo-img" />
              <span>VIZ TV</span>
            </a>
            <p className="footer-tagline">
              Official OTT Streaming & Talent Hunt Showcase platform. Stream blockbuster movies, original web series, and participate in live video audition contests.
            </p>
            <div className="footer-app-badge">
              <span>App Package: com.vizdigitals.viztv</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links-col">
            <h4>Quick Navigation</h4>
            <ul>
              <li><a href="#home" onClick={() => setActiveTab('home')}>Home</a></li>
              <li><a href="#how-it-works" onClick={() => setActiveTab('how-it-works')}>How It Works</a></li>
              <li><a href="#features" onClick={() => setActiveTab('features')}>Features</a></li>
              <li><a href="#trending" onClick={() => setActiveTab('trending')}>Trending Content</a></li>
              <li><a href="#talent-hunt" onClick={() => setActiveTab('talent-hunt')}>Talent Hunt Showcase</a></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="footer-links-col">
            <h4>Legal & Safety</h4>
            <ul>
              <li><button onClick={() => setActiveTab('child-safety')} className="footer-btn-link">Child Safety Policy</button></li>
              <li><button onClick={() => setActiveTab('privacy')} className="footer-btn-link">Privacy Policy</button></li>
              <li><button onClick={() => setActiveTab('terms')} className="footer-btn-link">Terms of Service</button></li>
              <li><button onClick={onNavigateDeletion} className="footer-btn-link">Account Deletion Request</button></li>
              <li><a href="#faq" onClick={() => setActiveTab('faq')}>FAQ</a></li>
              <li><a href="#contact" onClick={() => setActiveTab('contact')}>Contact Support</a></li>
            </ul>
          </div>

          {/* CTA Col */}
          <div className="footer-cta-col">
            <h4>Get The App</h4>
            <p>Download the official VIZ TV Android app file (.aab) for instant access.</p>
            <a
              href="https://expo.dev/artifacts/eas/fklQpTWgH3Kv9RysP4vrtlXus40-przEn1Z9GIbzZ9A.aab"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary footer-download-btn"
            >
              <Download size={18} />
              <span>Download Android App</span>
            </a>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p>&copy; 2026 VIZ TV (com.vizdigitals.viztv). All rights reserved.</p>
          <p className="developer-credit">
            Developed with <Heart size={14} fill="#e50914" color="#e50914" inline="true" /> by krishna7323
          </p>
        </div>
      </div>

      <style>{`
        .site-footer {
          background: #06070a;
          border-top: 1px solid var(--border-color);
          padding: 80px 0 30px 0;
          color: var(--text-muted);
        }
        .footer-top-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1.2fr;
          gap: 3rem;
          margin-bottom: 4rem;
        }
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: white;
          font-weight: 900;
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }
        .footer-logo-img {
          width: 36px;
          height: 36px;
          border-radius: 8px;
        }
        .footer-tagline {
          font-size: 0.92rem;
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        .footer-app-badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .footer-links-col h4, .footer-cta-col h4 {
          color: white;
          font-size: 1.1rem;
          font-weight: 800;
          margin-bottom: 1.25rem;
        }
        .footer-links-col ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .footer-links-col a, .footer-btn-link {
          color: var(--text-muted);
          text-decoration: none;
          font-size: 0.92rem;
          transition: var(--transition);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          text-align: left;
        }
        .footer-links-col a:hover, .footer-btn-link:hover {
          color: var(--primary-hover);
        }

        .footer-cta-col p {
          font-size: 0.9rem;
          margin-bottom: 1.25rem;
          line-height: 1.5;
        }
        .footer-download-btn {
          width: 100%;
          padding: 12px;
        }

        .footer-bottom-bar {
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .developer-credit {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        @media (max-width: 992px) {
          .footer-top-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .footer-top-grid {
            grid-template-columns: 1fr;
          }
          .footer-bottom-bar {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
