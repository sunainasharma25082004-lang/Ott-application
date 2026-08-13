import React from 'react';
import { X } from 'lucide-react';

export default function VideoModal({ video, onClose }) {
  if (!video) return null;

  const defaultVideo = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  const videoSrc = video.videoUrl || defaultVideo;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content video-modal-box" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close" aria-label="Close video player">
          <X size={20} />
        </button>

        <div className="video-player-container">
          <video
            src={videoSrc}
            controls
            autoPlay
            className="modal-video-element"
          >
            Your browser does not support HTML5 video streaming.
          </video>
        </div>

        <div className="video-modal-info">
          <h3>{video.title || 'VIZ TV Official App Trailer'}</h3>
          <p className="modal-video-desc">
            Experience 4K Ultra HD video playback with low latency adaptive streaming on VIZ TV.
          </p>
        </div>
      </div>

      <style>{`
        .video-modal-box {
          max-width: 850px;
          padding: 1.5rem;
          background: #090a10;
        }
        .video-player-container {
          width: 100%;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: #000;
          aspect-ratio: 16 / 9;
          margin-bottom: 1.25rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
        }
        .modal-video-element {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .video-modal-info h3 {
          font-size: 1.35rem;
          font-weight: 800;
          margin-bottom: 6px;
        }
        .modal-video-desc {
          font-size: 0.92rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
