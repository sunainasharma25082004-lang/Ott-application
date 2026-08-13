import React, { useState } from 'react';
import { Download, UserCheck, Play, Video, ThumbsUp, Tv, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: '01',
      title: 'Download & Quick Account Setup',
      icon: <Download size={28} className="step-icon-red" />,
      desc: 'Download the official VIZ TV application for Android or open the web platform. Create your free account in seconds using email or phone number.',
      details: [
        'Instant profile creation',
        'Secure password & encrypted credentials',
        'Choose preferred entertainment categories & languages'
      ],
      tag: 'Get Started'
    },
    {
      number: '02',
      title: 'Stream Unlimited Movies & Shows',
      icon: <Play size={28} className="step-icon-cyan" />,
      desc: 'Access a massive library of 4K Ultra HD blockbuster movies, regional hits, exclusive original web series, and live television content.',
      details: [
        'Adaptive bitrate streaming (no buffering)',
        'Multi-subtitle & dual audio tracks',
        'Personalized Watchlist & continuation sync'
      ],
      tag: 'Streaming Engine'
    },
    {
      number: '03',
      title: 'Upload Auditions to Talent Hunt',
      icon: <Video size={28} className="step-icon-purple" />,
      desc: 'Got talent? Record your acting, singing, dancing, or stand-up comedy performance and upload your clip directly to VIZ TV Talent Hunt.',
      details: [
        'In-app video editor & thumbnail generator',
        'Guidelines & category selection',
        'Reach millions of OTT viewers & celebrity judges'
      ],
      tag: 'Creator Showcase'
    },
    {
      number: '04',
      title: 'Vote, Rise on Leaderboard & Win',
      icon: <ThumbsUp size={28} className="step-icon-gold" />,
      desc: 'Fans vote for their favorite contestants in real time. Climb the weekly leaderboard to unlock cash prizes, contracts, and fame!',
      details: [
        'Real-time fan voting counter',
        'Weekly contestant leaderboards',
        'Featured spotlight on VIZ TV homepage'
      ],
      tag: 'Live Voting'
    },
    {
      number: '05',
      title: 'Cross-Device Seamless Playback',
      icon: <Tv size={28} className="step-icon-green" />,
      desc: 'Pause on your smartphone and continue watching on your Smart TV or web browser right where you left off with account sync.',
      details: [
        'Sync watch progress across 5 devices',
        'Chromecast & Smart TV casting supported',
        'High-efficiency offline video downloads'
      ],
      tag: 'Any Device'
    }
  ];

  return (
    <section className="how-section" id="how-it-works">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">
            <span>Seamless Experience</span>
          </div>
          <h2 className="section-title">
            How <span>VIZ TV Works</span>
          </h2>
          <p className="section-desc">
            Discover how easy it is to stream premium entertainment or kickstart your stardom in our Talent Hunt ecosystem.
          </p>
        </div>

        {/* Step Tabs Navigation */}
        <div className="steps-nav-grid">
          {steps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`step-tab-card ${activeStep === idx ? 'active' : ''}`}
            >
              <div className="step-num-badge">{step.number}</div>
              <div className="step-tab-title">{step.title}</div>
            </button>
          ))}
        </div>

        {/* Active Step Highlight Card */}
        <div className="active-step-showcase glass-card">
          <div className="step-showcase-left">
            <div className="step-badge-tag">{steps[activeStep].tag}</div>
            <div className="step-header-row">
              <div className="step-icon-box">{steps[activeStep].icon}</div>
              <h3 className="step-main-title">{steps[activeStep].title}</h3>
            </div>
            <p className="step-main-desc">{steps[activeStep].desc}</p>
            
            <ul className="step-details-list">
              {steps[activeStep].details.map((item, i) => (
                <li key={i}>
                  <CheckCircle2 size={18} className="check-icon" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="step-action-row">
              <a
                href="https://expo.dev/artifacts/eas/fklQpTWgH3Kv9RysP4vrtlXus40-przEn1Z9GIbzZ9A.aab"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <span>Try It Now</span>
                <ArrowRight size={18} />
              </a>
            </div>
          </div>

          <div className="step-showcase-right">
            <div className="visual-mockup-frame">
              <div className="mockup-header-dots">
                <span className="dot dot-r"></span>
                <span className="dot dot-y"></span>
                <span className="dot dot-g"></span>
                <span className="mockup-url">viztv.app / {steps[activeStep].tag.toLowerCase().replace(/\s+/g, '-')}</span>
              </div>
              <div className="mockup-screen-content">
                <div className="screen-hero-preview">
                  <div className="preview-chip">{steps[activeStep].number} Step Overview</div>
                  <h4>{steps[activeStep].title}</h4>
                  <p>{steps[activeStep].desc}</p>
                </div>
                <div className="screen-widgets-grid">
                  <div className="widget-box">
                    <span className="widget-val">99.9%</span>
                    <span className="widget-lbl">Uptime & Speed</span>
                  </div>
                  <div className="widget-box">
                    <span className="widget-val">4K HDR</span>
                    <span className="widget-lbl">Audio & Video</span>
                  </div>
                  <div className="widget-box">
                    <span className="widget-val">Instant</span>
                    <span className="widget-lbl">Live Sync</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .how-section {
          padding: 100px 0;
          background: rgba(14, 16, 26, 0.4);
          position: relative;
        }
        .steps-nav-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;
          margin-bottom: 2.5rem;
        }
        .step-tab-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.25rem 1rem;
          text-align: left;
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .step-tab-card:hover {
          background: var(--bg-card-hover);
          border-color: rgba(255, 255, 255, 0.2);
        }
        .step-tab-card.active {
          background: linear-gradient(135deg, rgba(229, 9, 20, 0.2) 0%, rgba(138, 43, 226, 0.15) 100%);
          border-color: var(--primary);
          box-shadow: 0 8px 25px rgba(229, 9, 20, 0.3);
        }
        .step-num-badge {
          font-weight: 900;
          font-size: 0.85rem;
          color: var(--primary-hover);
          background: rgba(229, 9, 20, 0.15);
          padding: 2px 8px;
          border-radius: 6px;
          align-self: flex-start;
        }
        .step-tab-title {
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--text-main);
          line-height: 1.3;
        }

        .active-step-showcase {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: center;
          padding: 3rem;
          background: var(--bg-card);
          border: 1px solid var(--border-glow);
        }
        .step-badge-tag {
          display: inline-block;
          background: var(--primary);
          color: white;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: var(--radius-full);
          text-transform: uppercase;
          margin-bottom: 1.25rem;
        }
        .step-header-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 1rem;
        }
        .step-icon-box {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .step-icon-red { color: var(--primary); }
        .step-icon-cyan { color: var(--accent-cyan); }
        .step-icon-purple { color: var(--accent-purple); }
        .step-icon-gold { color: var(--accent-gold); }
        .step-icon-green { color: #10b981; }

        .step-main-title {
          font-size: 1.85rem;
          font-weight: 800;
          color: var(--text-main);
        }
        .step-main-desc {
          font-size: 1.05rem;
          color: var(--text-muted);
          line-height: 1.7;
          margin-bottom: 1.5rem;
        }
        .step-details-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 2rem;
        }
        .step-details-list li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.95rem;
          color: var(--text-main);
        }
        .check-icon {
          color: var(--primary);
          flex-shrink: 0;
        }

        /* Mockup Right */
        .visual-mockup-frame {
          background: #090a10;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          overflow: hidden;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
        }
        .mockup-header-dots {
          background: #141724;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid var(--border-color);
        }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .dot-r { background: #ff5f56; }
        .dot-y { background: #ffbd2e; }
        .dot-g { background: #27c93f; }
        .mockup-url {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-left: 12px;
          font-family: monospace;
        }
        .mockup-screen-content {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .screen-hero-preview {
          background: linear-gradient(135deg, rgba(229, 9, 20, 0.3) 0%, rgba(138, 43, 226, 0.2) 100%);
          border: 1px solid rgba(229, 9, 20, 0.3);
          border-radius: var(--radius-md);
          padding: 1.5rem;
        }
        .preview-chip {
          display: inline-block;
          background: rgba(255, 255, 255, 0.15);
          font-size: 0.75rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
          margin-bottom: 8px;
        }
        .screen-hero-preview h4 {
          font-size: 1.25rem;
          font-weight: 800;
          margin-bottom: 6px;
        }
        .screen-hero-preview p {
          font-size: 0.88rem;
          color: var(--text-muted);
        }
        .screen-widgets-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        .widget-box {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-sm);
          padding: 1rem;
          text-align: center;
        }
        .widget-val {
          display: block;
          font-weight: 800;
          font-size: 1.1rem;
          color: var(--accent-cyan);
        }
        .widget-lbl {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        @media (max-width: 1024px) {
          .steps-nav-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .active-step-showcase {
            grid-template-columns: 1fr;
            padding: 2rem;
          }
        }
        @media (max-width: 600px) {
          .steps-nav-grid {
            grid-template-columns: 1fr;
          }
          .screen-widgets-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
