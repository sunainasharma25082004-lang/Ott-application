import React from 'react';
import { Download, Play, Shield, Star, Users, Film, Award, Sparkles } from 'lucide-react';

export default function Hero({ onOpenTrailer, onNavigatePrivacy }) {
  return (
    <section className="hero-section" id="home">
      <div className="container hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>Official VIZ TV OTT & Talent Platform</span>
          </div>

          <h1 className="hero-title">
            Unlimited Streaming & <span>Live Talent Showcase</span>
          </h1>

          <p className="hero-subtitle">
            Watch exclusive original series, 4K blockbuster movies, live talent competitions, and creator auditions anywhere, anytime. Download the official VIZ TV Android App today!
          </p>

          <div className="hero-cta-group">
            <a
              href="https://expo.dev/artifacts/eas/fklQpTWgH3Kv9RysP4vrtlXus40-przEn1Z9GIbzZ9A.aab"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary hero-btn"
            >
              <Download size={20} />
              <span>Download Android App (.aab)</span>
            </a>

            <button onClick={onOpenTrailer} className="btn-secondary hero-btn">
              <Play size={20} fill="currentColor" />
              <span>Watch App Trailer</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="hero-stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <Users size={20} className="icon-cyan" />
              </div>
              <div className="stat-info">
                <span className="stat-num">100K+</span>
                <span className="stat-lbl">Active Viewers</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <Star size={20} className="icon-gold" />
              </div>
              <div className="stat-info">
                <span className="stat-num">4.8 ★</span>
                <span className="stat-lbl">Play Store Rating</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <Film size={20} className="icon-red" />
              </div>
              <div className="stat-info">
                <span className="stat-num">1,000+</span>
                <span className="stat-lbl">Exclusive Titles</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <Award size={20} className="icon-purple" />
              </div>
              <div className="stat-info">
                <span className="stat-num">50K+</span>
                <span className="stat-lbl">Talent Contestants</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Media Side */}
        <div className="hero-media-container float-element">
          <div className="media-glow-backdrop"></div>
          <div className="hero-card-frame">
            <img
              src="./hero-banner.png"
              alt="VIZ TV Interface Showcase"
              className="hero-banner-image"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=1200&auto=format&fit=crop';
              }}
            />
            <div className="hero-banner-overlay">
              <div className="overlay-pill">
                <span className="live-dot"></span>
                <span>LIVE TALENT HUNT</span>
              </div>
              <div className="overlay-content">
                <h3>VIZ TV Auditions 2026</h3>
                <p>Singing • Acting • Dancing • Comedy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hero-section {
          padding: 160px 0 90px 0;
          position: relative;
          overflow: hidden;
        }
        .hero-container {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 3.5rem;
          align-items: center;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(229, 9, 20, 0.12);
          border: 1px solid rgba(229, 9, 20, 0.35);
          color: var(--primary-hover);
          padding: 8px 18px;
          border-radius: var(--radius-full);
          font-size: 0.88rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          box-shadow: 0 0 20px rgba(229, 9, 20, 0.2);
        }
        .hero-title {
          font-size: 3.5rem;
          font-weight: 900;
          line-height: 1.15;
          letter-spacing: -1px;
          margin-bottom: 1.25rem;
        }
        .hero-title span {
          background: linear-gradient(135deg, var(--primary) 0%, #ff5252 50%, var(--accent-purple) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-subtitle {
          font-size: 1.2rem;
          color: var(--text-muted);
          line-height: 1.7;
          margin-bottom: 2.25rem;
          max-width: 620px;
        }
        .hero-cta-group {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          margin-bottom: 3.5rem;
          flex-wrap: wrap;
        }
        .hero-btn {
          padding: 14px 32px;
          font-size: 1.05rem;
        }
        .hero-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color);
        }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .stat-icon-wrapper {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .icon-cyan { color: var(--accent-cyan); }
        .icon-gold { color: var(--accent-gold); }
        .icon-red { color: var(--primary); }
        .icon-purple { color: var(--accent-purple); }

        .stat-info {
          display: flex;
          flex-direction: column;
        }
        .stat-num {
          font-weight: 800;
          font-size: 1.25rem;
          line-height: 1;
          color: var(--text-main);
        }
        .stat-lbl {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 4px;
        }

        /* Hero Media */
        .hero-media-container {
          position: relative;
        }
        .media-glow-backdrop {
          position: absolute;
          top: -20%;
          left: -20%;
          width: 140%;
          height: 140%;
          background: radial-gradient(circle, rgba(229, 9, 20, 0.25) 0%, rgba(138, 43, 226, 0.15) 40%, transparent 70%);
          filter: blur(50px);
          z-index: 1;
        }
        .hero-card-frame {
          position: relative;
          z-index: 2;
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(229, 9, 20, 0.3);
          background: #141724;
        }
        .hero-banner-image {
          width: 100%;
          height: 480px;
          object-fit: cover;
          display: block;
          transition: transform 0.6s ease;
        }
        .hero-card-frame:hover .hero-banner-image {
          transform: scale(1.03);
        }
        .hero-banner-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          padding: 2rem;
          background: linear-gradient(to top, rgba(10, 11, 16, 0.95) 0%, rgba(10, 11, 16, 0.4) 60%, transparent 100%);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .overlay-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(229, 9, 20, 0.9);
          color: white;
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 800;
          align-self: flex-start;
        }
        .live-dot {
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          animation: pulseDot 1.5s infinite;
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.3); }
        }
        .overlay-content h3 {
          font-size: 1.5rem;
          font-weight: 800;
        }
        .overlay-content p {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        @media (max-width: 1100px) {
          .hero-container {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .hero-subtitle {
            margin-left: auto;
            margin-right: auto;
          }
          .hero-cta-group {
            justify-content: center;
          }
          .hero-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }
          .stat-card {
            justify-content: center;
          }
          .hero-banner-image {
            height: 360px;
          }
        }

        @media (max-width: 600px) {
          .hero-title {
            font-size: 2.35rem;
          }
          .hero-cta-group {
            flex-direction: column;
          }
          .hero-btn {
            width: 100%;
          }
          .hero-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </section>
  );
}
