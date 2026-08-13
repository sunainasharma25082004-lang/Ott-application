import React, { useState } from 'react';
import { Smartphone, Play, Trophy, User, Heart, Sparkles, Flame, Eye, ThumbsUp, Share2 } from 'lucide-react';

export default function AppDemo() {
  const [activeScreen, setActiveScreen] = useState('talent');
  const [likes, setLikes] = useState(1420);
  const [hasLiked, setHasLiked] = useState(false);

  const handleLike = () => {
    if (!hasLiked) {
      setLikes(likes + 1);
      setHasLiked(true);
    } else {
      setLikes(likes - 1);
      setHasLiked(false);
    }
  };

  return (
    <section className="app-demo-section">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">
            <Smartphone size={16} />
            <span>Interactive Mobile App Preview</span>
          </div>
          <h2 className="section-title">
            Experience <span>VIZ TV Interface</span>
          </h2>
          <p className="section-desc">
            Try out key features of the VIZ TV mobile application directly in your browser.
          </p>
        </div>

        <div className="demo-wrapper">
          {/* Controls Panel */}
          <div className="demo-controls-panel">
            <h3 className="controls-title">Choose Feature View</h3>
            
            <button
              onClick={() => setActiveScreen('talent')}
              className={`demo-tab-btn ${activeScreen === 'talent' ? 'active' : ''}`}
            >
              <Sparkles size={20} />
              <div className="btn-text">
                <strong>Talent Hunt Hub</strong>
                <span>Upload & view audition reels</span>
              </div>
            </button>

            <button
              onClick={() => setActiveScreen('player')}
              className={`demo-tab-btn ${activeScreen === 'player' ? 'active' : ''}`}
            >
              <Play size={20} />
              <div className="btn-text">
                <strong>4K Video Player</strong>
                <span>Ultra HD movie playback</span>
              </div>
            </button>

            <button
              onClick={() => setActiveScreen('leaderboard')}
              className={`demo-tab-btn ${activeScreen === 'leaderboard' ? 'active' : ''}`}
            >
              <Trophy size={20} />
              <div className="btn-text">
                <strong>Live Leaderboard</strong>
                <span>Real-time contestant rankings</span>
              </div>
            </button>

            <button
              onClick={() => setActiveScreen('profile')}
              className={`demo-tab-btn ${activeScreen === 'profile' ? 'active' : ''}`}
            >
              <User size={20} />
              <div className="btn-text">
                <strong>User Profile</strong>
                <span>Watchlist & history</span>
              </div>
            </button>

            <div className="demo-hint-box glass-card">
              <span className="hint-badge">Pro Tip</span>
              <p>Download the VIZ TV Android app for full screen performance and offline downloads.</p>
            </div>
          </div>

          {/* Simulated Mobile Device Frame */}
          <div className="phone-device-container">
            <div className="phone-outer-shell">
              <div className="phone-notch"></div>
              
              <div className="phone-screen">
                {/* Status Bar */}
                <div className="phone-status-bar">
                  <span>9:41</span>
                  <span>VIZ TV 5G</span>
                  <span>100% 🔋</span>
                </div>

                {/* Header */}
                <div className="phone-app-header">
                  <div className="brand-mini">
                    <img src="./app-logo.png" alt="Logo" className="mini-logo" />
                    <span>VIZ TV</span>
                  </div>
                  <span className="live-pill">● LIVE</span>
                </div>

                {/* Dynamic Screen Content */}
                {activeScreen === 'talent' && (
                  <div className="screen-body talent-view">
                    <div className="reels-card">
                      <img
                        src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop"
                        alt="Talent Video"
                        className="reels-bg-img"
                      />
                      <div className="reels-overlay">
                        <span className="category-tag">🎤 Singing Audition</span>
                        <h4 className="contestant-name">Ananya Roy (Season 4)</h4>
                        <p className="song-title">"Melody of Dreams Cover"</p>
                        
                        <div className="reels-stats-bar">
                          <button onClick={handleLike} className={`reel-action-btn ${hasLiked ? 'liked' : ''}`}>
                            <ThumbsUp size={18} />
                            <span>{likes} Votes</span>
                          </button>
                          <div className="reel-action-btn">
                            <Eye size={18} />
                            <span>45.2K</span>
                          </div>
                          <div className="reel-action-btn">
                            <Share2 size={18} />
                            <span>Share</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeScreen === 'player' && (
                  <div className="screen-body player-view">
                    <div className="video-player-sim">
                      <img
                        src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop"
                        alt="Movie Poster"
                        className="player-bg-img"
                      />
                      <div className="player-controls-overlay">
                        <button className="play-circle-btn">
                          <Play size={32} fill="white" />
                        </button>
                        <div className="player-bottom-bar">
                          <div className="progress-bar">
                            <div className="progress-filled" style={{ width: '45%' }}></div>
                          </div>
                          <div className="player-meta">
                            <span>01:14:20 / 02:25:00</span>
                            <span className="hd-tag">4K HDR</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="player-info-card">
                      <h4>Cyber Strike: The Final War</h4>
                      <p className="genres">Action • Sci-Fi • Thriller | 2026</p>
                      <p className="summary">A team of elite hackers take on a high-stakes global network threat in this adrenaline-fueled thriller.</p>
                    </div>
                  </div>
                )}

                {activeScreen === 'leaderboard' && (
                  <div className="screen-body leaderboard-view">
                    <div className="lb-header">
                      <Trophy size={20} className="text-gold" />
                      <h4>Top Contestants This Week</h4>
                    </div>
                    <div className="lb-list">
                      <div className="lb-item rank-1">
                        <span className="rank-num">🥇</span>
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop" alt="User" className="user-avatar" />
                        <div className="user-details">
                          <strong>Priya Sharma</strong>
                          <span>Classical Vocalist</span>
                        </div>
                        <span className="vote-badge">24,500 Votes</span>
                      </div>

                      <div className="lb-item rank-2">
                        <span className="rank-num">🥈</span>
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop" alt="User" className="user-avatar" />
                        <div className="user-details">
                          <strong>Rahul Verma</strong>
                          <span>Hip-Hop Dancer</span>
                        </div>
                        <span className="vote-badge">19,820 Votes</span>
                      </div>

                      <div className="lb-item rank-3">
                        <span className="rank-num">🥉</span>
                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop" alt="User" className="user-avatar" />
                        <div className="user-details">
                          <strong>Simran Kaur</strong>
                          <span>Dramatic Monologue</span>
                        </div>
                        <span className="vote-badge">15,400 Votes</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeScreen === 'profile' && (
                  <div className="screen-body profile-view">
                    <div className="profile-card">
                      <div className="profile-avatar-box">
                        <User size={36} />
                      </div>
                      <h4 className="profile-name">Krishna Kumar</h4>
                      <p className="profile-sub">Premium VIZ TV Subscriber</p>
                      <div className="profile-chips">
                        <span>VIP Member</span>
                        <span>Contestant #402</span>
                      </div>
                    </div>
                    <div className="watchlist-section">
                      <h5>My Saved Watchlist</h5>
                      <div className="wl-grid">
                        <div className="wl-item">🎬 Dark Horizon</div>
                        <div className="wl-item">🎤 Talent Auditions</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom App Nav */}
                <div className="phone-bottom-nav">
                  <span className={activeScreen === 'talent' ? 'active' : ''}>🔥 Discover</span>
                  <span className={activeScreen === 'player' ? 'active' : ''}>🎬 Movies</span>
                  <span className={activeScreen === 'leaderboard' ? 'active' : ''}>🏆 Ranks</span>
                  <span className={activeScreen === 'profile' ? 'active' : ''}>👤 Profile</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .app-demo-section {
          padding: 100px 0;
          position: relative;
        }
        .demo-wrapper {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }
        .demo-controls-panel {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .controls-title {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }
        .demo-tab-btn {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: var(--transition);
          text-align: left;
          color: var(--text-main);
        }
        .demo-tab-btn:hover {
          background: var(--bg-card-hover);
          border-color: rgba(255, 255, 255, 0.2);
        }
        .demo-tab-btn.active {
          background: linear-gradient(135deg, rgba(229, 9, 20, 0.25) 0%, rgba(138, 43, 226, 0.15) 100%);
          border-color: var(--primary);
          box-shadow: 0 8px 25px rgba(229, 9, 20, 0.3);
        }
        .btn-text {
          display: flex;
          flex-direction: column;
        }
        .btn-text strong {
          font-size: 1.05rem;
          font-weight: 700;
        }
        .btn-text span {
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .demo-hint-box {
          margin-top: 1rem;
          padding: 1.25rem;
        }
        .hint-badge {
          display: inline-block;
          background: var(--accent-gold);
          color: black;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 4px;
          margin-bottom: 6px;
        }
        .demo-hint-box p {
          font-size: 0.88rem;
          color: var(--text-muted);
        }

        /* Device Shell */
        .phone-device-container {
          display: flex;
          justify-content: center;
        }
        .phone-outer-shell {
          width: 330px;
          height: 640px;
          background: #090a0f;
          border-radius: 42px;
          border: 10px solid #1a1d2d;
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.9), 0 0 40px rgba(229, 9, 20, 0.3);
          position: relative;
          padding: 12px 8px;
          overflow: hidden;
        }
        .phone-notch {
          position: absolute;
          top: 12px;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 24px;
          background: #1a1d2d;
          border-bottom-left-radius: 14px;
          border-bottom-right-radius: 14px;
          z-index: 100;
        }
        .phone-screen {
          width: 100%;
          height: 100%;
          background: #0e101a;
          border-radius: 32px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .phone-status-bar {
          padding: 10px 18px 4px 18px;
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          color: var(--text-muted);
          z-index: 90;
        }
        .phone-app-header {
          padding: 8px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(14, 16, 26, 0.8);
        }
        .brand-mini {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 800;
          font-size: 0.9rem;
          color: var(--primary);
        }
        .mini-logo {
          width: 22px;
          height: 22px;
          border-radius: 6px;
        }
        .live-pill {
          background: rgba(229, 9, 20, 0.2);
          color: var(--primary-hover);
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
        }

        /* Screen Body */
        .screen-body {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          display: flex;
          flex-direction: column;
        }
        .reels-card {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 16px;
          overflow: hidden;
        }
        .reels-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .reels-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          padding: 14px;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, transparent 100%);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .category-tag {
          font-size: 0.7rem;
          background: var(--primary);
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          align-self: flex-start;
          font-weight: 700;
        }
        .contestant-name {
          font-size: 1rem;
          font-weight: 800;
        }
        .song-title {
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .reels-stats-bar {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }
        .reel-action-btn {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(8px);
          border: none;
          color: white;
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
        }
        .reel-action-btn.liked {
          background: var(--primary);
        }

        /* Player View */
        .video-player-sim {
          position: relative;
          height: 180px;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        .player-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .player-controls-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .play-circle-btn {
          background: var(--primary);
          border: none;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px var(--primary);
        }
        .player-bottom-bar {
          position: absolute;
          bottom: 8px;
          left: 8px;
          right: 8px;
        }
        .progress-bar {
          height: 3px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
          margin-bottom: 4px;
        }
        .progress-filled {
          height: 100%;
          background: var(--primary);
          border-radius: 2px;
        }
        .player-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.65rem;
          color: var(--text-muted);
        }
        .hd-tag {
          color: var(--accent-gold);
          font-weight: 800;
        }
        .player-info-card h4 {
          font-size: 0.95rem;
          font-weight: 800;
        }
        .genres {
          font-size: 0.72rem;
          color: var(--primary-hover);
          margin: 2px 0 6px 0;
        }
        .summary {
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        /* Leaderboard View */
        .lb-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        .lb-header h4 {
          font-size: 0.9rem;
          font-weight: 800;
        }
        .text-gold { color: var(--accent-gold); }
        .lb-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .lb-item {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 8px 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .rank-num { font-size: 1.1rem; }
        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }
        .user-details {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .user-details strong {
          font-size: 0.78rem;
        }
        .user-details span {
          font-size: 0.65rem;
          color: var(--text-muted);
        }
        .vote-badge {
          background: rgba(229, 9, 20, 0.2);
          color: var(--primary-hover);
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
        }

        /* Profile View */
        .profile-card {
          text-align: center;
          padding: 12px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 12px;
          margin-bottom: 12px;
        }
        .profile-avatar-box {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: var(--primary);
          margin: 0 auto 8px auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .profile-name { font-size: 0.95rem; font-weight: 800; }
        .profile-sub { font-size: 0.72rem; color: var(--text-muted); }
        .profile-chips {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin-top: 8px;
        }
        .profile-chips span {
          font-size: 0.65rem;
          background: rgba(255, 255, 255, 0.1);
          padding: 2px 8px;
          border-radius: 4px;
        }
        .watchlist-section h5 {
          font-size: 0.8rem;
          margin-bottom: 6px;
        }
        .wl-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }
        .wl-item {
          background: rgba(255, 255, 255, 0.06);
          padding: 10px;
          border-radius: 8px;
          font-size: 0.72rem;
          font-weight: 700;
        }

        /* Phone Bottom Nav */
        .phone-bottom-nav {
          display: flex;
          justify-content: space-around;
          padding: 8px 0;
          background: #141724;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 0.68rem;
          color: var(--text-muted);
        }
        .phone-bottom-nav span.active {
          color: var(--primary);
          font-weight: 800;
        }

        @media (max-width: 992px) {
          .demo-wrapper {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
