import React from 'react';
import { FileCheck, ShieldAlert, Scale, UserCheck, ArrowLeft } from 'lucide-react';

export default function TermsOfService({ onBackHome }) {
  return (
    <section className="terms-section" id="terms">
      <div className="container">
        {onBackHome && (
          <div className="back-home-bar">
            <button onClick={onBackHome} className="btn-secondary back-btn">
              <ArrowLeft size={18} />
              <span>Back to Main Website</span>
            </button>
          </div>
        )}

        <div className="section-header">
          <div className="section-badge">
            <FileCheck size={16} />
            <span>Legal Agreement</span>
          </div>
          <h2 className="section-title">
            Terms of <span>Service</span>
          </h2>
          <p className="section-desc">
            Effective Date: August 12, 2026 | Application: <strong>VIZ TV (com.vizdigitals.viztv)</strong>
          </p>
        </div>

        <div className="legal-container glass-card">
          <div className="legal-block">
            <div className="legal-icon"><FileCheck size={22} /></div>
            <div className="legal-text">
              <h3>1. Acceptance of Terms</h3>
              <p>
                By downloading, installing, browsing, or using the <strong>VIZ TV</strong> mobile application or website platform, you agree to be bound by these Terms of Service. If you do not accept these terms in full, please discontinue platform access immediately.
              </p>
            </div>
          </div>

          <div className="legal-block">
            <div className="legal-icon"><UserCheck size={22} /></div>
            <div className="legal-text">
              <h3>2. Service License & Permitted Use</h3>
              <p>
                VIZ TV grants users a limited, non-exclusive, non-transferable, revocable license to stream entertainment content for personal, non-commercial use. Users may not copy, record, re-broadcast, or commercially exploit any platform video assets without express written authorization.
              </p>
            </div>
          </div>

          <div className="legal-block">
            <div className="legal-icon"><Scale size={22} /></div>
            <div className="legal-text">
              <h3>3. Talent Hunt Submissions & Content Rights</h3>
              <p>
                By uploading performance videos, auditions, or media to the VIZ TV Talent Hunt, you represent that you hold full copyright ownership of the submitted work. You grant VIZ TV a worldwide, royalty-free license to display and feature your video within the app and marketing channels.
              </p>
            </div>
          </div>

          <div className="legal-block">
            <div className="legal-icon"><ShieldAlert size={22} /></div>
            <div className="legal-text">
              <h3>4. Account Responsibilities & Termination</h3>
              <p>
                Users are responsible for maintaining session secrecy. Accounts found engaging in abusive behavior, illegal content uploads, or copyright infringement will be suspended or permanently terminated.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .terms-section {
          padding: 100px 0;
          position: relative;
        }
        .back-home-bar {
          margin-bottom: 2rem;
        }
        .back-btn {
          padding: 8px 18px;
          font-size: 0.9rem;
        }
      `}</style>
    </section>
  );
}
