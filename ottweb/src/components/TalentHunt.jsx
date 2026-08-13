import React from 'react';
import { Award, Mic, Music, Video, ThumbsUp, Sparkles, Check, Download } from 'lucide-react';

export default function TalentHunt() {
  return (
    <section className="talent-hunt-section" id="talent-hunt">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">
            <Sparkles size={16} />
            <span>VIZ TV Creator Ecosystem</span>
          </div>
          <h2 className="section-title">
            The Ultimate <span>Talent Hunt Showcase</span>
          </h2>
          <p className="section-desc">
            Are you a singer, actor, dancer, or comedian? Upload your audition reels directly on VIZ TV and let millions of fans vote for you!
          </p>
        </div>

        <div className="talent-grid">
          {/* Left Column: Categories */}
          <div className="talent-left-col">
            <h3 className="sub-heading">Featured Audition Categories</h3>
            
            <div className="category-cards-grid">
              <div className="cat-card glass-card">
                <div className="cat-icon icon-pink">
                  <Mic size={28} />
                </div>
                <div>
                  <h4>Singing & Vocals</h4>
                  <p>Solo singing, acoustic covers, rap battles, and instrumental performances.</p>
                </div>
              </div>

              <div className="cat-card glass-card">
                <div className="cat-icon icon-purple">
                  <Video size={28} />
                </div>
                <div>
                  <h4>Acting & Monologues</h4>
                  <p>Dramatic scenes, movie dialogue re-enactments, and short story acting.</p>
                </div>
              </div>

              <div className="cat-card glass-card">
                <div className="cat-icon icon-cyan">
                  <Music size={28} />
                </div>
                <div>
                  <h4>Dance & Choreography</h4>
                  <p>Hip-hop, classical, contemporary, street style, and group dance routines.</p>
                </div>
              </div>

              <div className="cat-card glass-card">
                <div className="cat-icon icon-gold">
                  <Award size={28} />
                </div>
                <div>
                  <h4>Stand-Up & Comedy</h4>
                  <p>Stand-up comedy sets, miming, impressionism, and humorous skits.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Rules & Prizes */}
          <div className="talent-right-col glass-card">
            <div className="prize-banner">
              <span className="prize-tag">SEASON 4 LIVE</span>
              <h3>Weekly Cash Prizes & Web Series Contracts</h3>
              <p>Top voted contestants every week win cash rewards and exclusive roles in upcoming VIZ TV original series!</p>
            </div>

            <div className="guidelines-box">
              <h4>Submission Guidelines</h4>
              <ul>
                <li>
                  <Check size={18} className="check-mark" />
                  <span>Video length: 60 seconds to 3 minutes</span>
                </li>
                <li>
                  <Check size={18} className="check-mark" />
                  <span>HD resolution (1080p recommended)</span>
                </li>
                <li>
                  <Check size={18} className="check-mark" />
                  <span>Original audio or licensed backing track</span>
                </li>
                <li>
                  <Check size={18} className="check-mark" />
                  <span>Free registration via VIZ TV Android app</span>
                </li>
              </ul>
            </div>

            <a
              href="https://expo.dev/artifacts/eas/fklQpTWgH3Kv9RysP4vrtlXus40-przEn1Z9GIbzZ9A.aab"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full text-center"
            >
              <Download size={20} />
              <span>Download App to Submit Audition</span>
            </a>
          </div>
        </div>
      </div>

      <style>{`
        .talent-hunt-section {
          padding: 100px 0;
          position: relative;
        }
        .talent-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 2.5rem;
          align-items: start;
        }
        .sub-heading {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
        }
        .category-cards-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }
        .cat-card {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 1.5rem;
        }
        .cat-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .icon-pink { background: rgba(236, 72, 153, 0.15); color: #ec4899; }
        .icon-purple { background: rgba(138, 43, 226, 0.15); color: var(--accent-purple); }
        .icon-cyan { background: rgba(0, 242, 254, 0.15); color: var(--accent-cyan); }
        .icon-gold { background: rgba(255, 215, 0, 0.15); color: var(--accent-gold); }

        .cat-card h4 {
          font-size: 1.1rem;
          font-weight: 800;
          margin-bottom: 4px;
        }
        .cat-card p {
          font-size: 0.88rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        /* Right Card */
        .talent-right-col {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }
        .prize-banner {
          background: linear-gradient(135deg, rgba(229, 9, 20, 0.25) 0%, rgba(138, 43, 226, 0.25) 100%);
          border: 1px solid var(--primary);
          padding: 1.5rem;
          border-radius: var(--radius-md);
        }
        .prize-tag {
          font-size: 0.72rem;
          font-weight: 800;
          background: var(--primary);
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          display: inline-block;
          margin-bottom: 8px;
        }
        .prize-banner h3 {
          font-size: 1.25rem;
          font-weight: 800;
          margin-bottom: 6px;
        }
        .prize-banner p {
          font-size: 0.88rem;
          color: var(--text-muted);
        }

        .guidelines-box h4 {
          font-size: 1.1rem;
          font-weight: 800;
          margin-bottom: 12px;
        }
        .guidelines-box ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .guidelines-box li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.92rem;
          color: var(--text-main);
        }
        .check-mark {
          color: var(--primary);
          flex-shrink: 0;
        }

        @media (max-width: 992px) {
          .talent-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 600px) {
          .category-cards-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
