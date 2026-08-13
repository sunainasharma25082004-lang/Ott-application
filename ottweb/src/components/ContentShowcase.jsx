import React, { useState } from 'react';
import { Play, Star, Flame, Eye, Film, Sparkles } from 'lucide-react';

export default function ContentShowcase({ onOpenVideo }) {
  const [filter, setFilter] = useState('all');

  const contentItems = [
    {
      id: 1,
      title: 'Talent Hunt 2026: Grand Auditions',
      category: 'talent',
      rating: '4.9',
      duration: '45 mins',
      views: '1.2M',
      poster: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop',
      badge: 'POPULAR TALENT',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    {
      id: 2,
      title: 'Cyber Strike: Neon Protocol',
      category: 'movies',
      rating: '4.8',
      duration: '2h 15m',
      views: '850K',
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop',
      badge: 'BLOCKBUSTER',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    },
    {
      id: 3,
      title: 'Shadows of Destiny: Web Series',
      category: 'series',
      rating: '4.7',
      duration: 'S1 E01',
      views: '620K',
      poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&auto=format&fit=crop',
      badge: 'ORIGINAL SERIES',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    },
    {
      id: 4,
      title: 'Rising Stars: Vocal Showcase',
      category: 'talent',
      rating: '4.9',
      duration: '32 mins',
      views: '410K',
      poster: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
      badge: 'LIVE VOTING',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
    },
    {
      id: 5,
      title: 'Echoes of Eternity',
      category: 'movies',
      rating: '4.6',
      duration: '1h 50m',
      views: '540K',
      poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
      badge: 'SUPERHIT',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
    },
    {
      id: 6,
      title: 'The Street Dance Chronicles',
      category: 'talent',
      rating: '4.8',
      duration: '28 mins',
      views: '930K',
      poster: 'https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=800&auto=format&fit=crop',
      badge: 'TOP TRENDING',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4'
    }
  ];

  const filteredItems = filter === 'all' ? contentItems : contentItems.filter(item => item.category === filter);

  return (
    <section className="trending-section" id="trending">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">
            <Flame size={16} />
            <span>Trending Library</span>
          </div>
          <h2 className="section-title">
            Popular on <span>VIZ TV</span>
          </h2>
          <p className="section-desc">
            Explore top-rated movies, original series, and featured Talent Hunt contestant videos.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs-row">
          <button
            onClick={() => setFilter('all')}
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          >
            All Content
          </button>
          <button
            onClick={() => setFilter('talent')}
            className={`filter-btn ${filter === 'talent' ? 'active' : ''}`}
          >
            🎤 Talent Hunt Auditions
          </button>
          <button
            onClick={() => setFilter('movies')}
            className={`filter-btn ${filter === 'movies' ? 'active' : ''}`}
          >
            🎬 Movies
          </button>
          <button
            onClick={() => setFilter('series')}
            className={`filter-btn ${filter === 'series' ? 'active' : ''}`}
          >
            📺 Web Series
          </button>
        </div>

        {/* Poster Grid */}
        <div className="content-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className="content-card" onClick={() => onOpenVideo(item)}>
              <div className="poster-frame">
                <img src={item.poster} alt={item.title} className="poster-img" />
                <div className="poster-badge">{item.badge}</div>
                <div className="poster-hover-overlay">
                  <button className="play-btn-glow">
                    <Play size={28} fill="white" />
                  </button>
                </div>
              </div>
              <div className="card-info">
                <div className="meta-row">
                  <span className="rating-pill">
                    <Star size={14} fill="#ffd700" color="#ffd700" />
                    {item.rating}
                  </span>
                  <span className="duration-lbl">{item.duration}</span>
                  <span className="views-lbl">
                    <Eye size={12} /> {item.views}
                  </span>
                </div>
                <h3 className="card-title">{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .trending-section {
          padding: 100px 0;
          background: rgba(14, 16, 26, 0.5);
        }
        .filter-tabs-row {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }
        .filter-btn {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          padding: 10px 22px;
          border-radius: var(--radius-full);
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
        }
        .filter-btn:hover {
          color: var(--text-main);
          border-color: rgba(255, 255, 255, 0.25);
        }
        .filter-btn.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary-hover);
          box-shadow: 0 4px 18px var(--primary-glow);
        }

        .content-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }
        .content-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          overflow: hidden;
          cursor: pointer;
          transition: var(--transition);
        }
        .content-card:hover {
          transform: translateY(-6px);
          border-color: var(--border-glow);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.7);
        }
        .poster-frame {
          position: relative;
          height: 240px;
          overflow: hidden;
        }
        .poster-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .content-card:hover .poster-img {
          transform: scale(1.08);
        }
        .poster-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(10, 11, 16, 0.85);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: var(--primary-hover);
          font-size: 0.72rem;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 6px;
        }
        .poster-hover-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: var(--transition);
        }
        .content-card:hover .poster-hover-overlay {
          opacity: 1;
        }
        .play-btn-glow {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--primary);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 25px var(--primary);
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .play-btn-glow:hover {
          transform: scale(1.15);
        }

        .card-info {
          padding: 1.25rem;
        }
        .meta-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          font-size: 0.82rem;
        }
        .rating-pill {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--accent-gold);
          font-weight: 700;
        }
        .duration-lbl, .views-lbl {
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .card-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-main);
        }

        @media (max-width: 992px) {
          .content-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
