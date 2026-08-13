import React from 'react';
import { Award, Tv, ShieldCheck, Smartphone, Zap, DownloadCloud, Sparkles } from 'lucide-react';

export default function Features() {
  const featureList = [
    {
      icon: <Award size={32} className="feature-icon-red" />,
      title: 'Talent Hunt Platform',
      desc: 'Showcase your acting, singing, dancing, and comedy skills to millions of global OTT viewers and celebrity recruiters.'
    },
    {
      icon: <Tv size={32} className="feature-icon-cyan" />,
      title: 'Ultra HD & 4K Streaming',
      desc: 'High dynamic range (HDR10+) with adaptive bitrate technology ensuring crystal clear 4K streaming even on 3G/4G connections.'
    },
    {
      icon: <ShieldCheck size={32} className="feature-icon-purple" />,
      title: 'Secure & Private Platform',
      desc: 'Bank-grade DRM content protection and SSL encryption keeping user account credentials and personal data fully protected.'
    },
    {
      icon: <Smartphone size={32} className="feature-icon-gold" />,
      title: 'Cross-Device Sync',
      desc: 'Seamlessly switch playback between Android smartphones, Android tablets, Smart TVs, and desktop web browsers.'
    },
    {
      icon: <Zap size={32} className="feature-icon-blue" />,
      title: 'Zero-Lag Adaptive Engine',
      desc: 'Instant video startup with zero buffering delay powered by ultra-fast global CDN streaming edge nodes.'
    },
    {
      icon: <DownloadCloud size={32} className="feature-icon-green" />,
      title: 'Offline Video Downloads',
      desc: 'Download your favorite movies, series episodes, and talent audition clips to watch offline anywhere without internet.'
    }
  ];

  return (
    <section className="features-section" id="features">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">
            <Sparkles size={16} />
            <span>Cutting Edge Technology</span>
          </div>
          <h2 className="section-title">
            Why Choose <span>VIZ TV?</span>
          </h2>
          <p className="section-desc">
            Experience next-level entertainment with industry-leading video performance, talent showcase capabilities, and total data privacy.
          </p>
        </div>

        <div className="features-grid">
          {featureList.map((item, idx) => (
            <div key={idx} className="feature-card glass-card">
              <div className="feature-icon-box">{item.icon}</div>
              <h3 className="feature-title">{item.title}</h3>
              <p className="feature-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .features-section {
          padding: 100px 0;
          position: relative;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }
        .feature-card {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          height: 100%;
          position: relative;
          overflow: hidden;
        }
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, transparent 0%, var(--primary) 50%, transparent 100%);
          opacity: 0;
          transition: var(--transition);
        }
        .feature-card:hover::before {
          opacity: 1;
        }
        .feature-icon-box {
          width: 60px;
          height: 60px;
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .feature-icon-red { color: var(--primary); }
        .feature-icon-cyan { color: var(--accent-cyan); }
        .feature-icon-purple { color: var(--accent-purple); }
        .feature-icon-gold { color: var(--accent-gold); }
        .feature-icon-blue { color: #3b82f6; }
        .feature-icon-green { color: #10b981; }

        .feature-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-main);
        }
        .feature-desc {
          font-size: 0.98rem;
          color: var(--text-muted);
          line-height: 1.65;
        }

        @media (max-width: 992px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
