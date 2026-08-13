import React from 'react';
import { Shield, Lock, Eye, FileText, Mail, Trash2 } from 'lucide-react';

export default function LegalPrivacyView({ onNavigateDeletion }) {
  return (
    <section className="privacy-section" id="privacy">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">
            <Shield size={16} />
            <span>Google Play Policy Compliant</span>
          </div>
          <h2 className="section-title">
            Privacy <span>Policy</span>
          </h2>
          <p className="section-desc">
            Effective Date: August 12, 2026 | Application Package ID: <strong>com.vizdigitals.viztv</strong>
          </p>
        </div>

        <div className="legal-container glass-card">
          <div className="legal-block">
            <div className="legal-icon"><Shield size={22} /></div>
            <div className="legal-text">
              <h3>1. Overview & Scope</h3>
              <p>
                This Privacy Policy discloses the data collection, usage, storage, and protection practices of <strong>VIZ TV</strong> ("we", "our", or "us"). This policy applies to all users accessing our services via the VIZ TV mobile application (package ID: <code>com.vizdigitals.viztv</code>) or our website. We are dedicated to maintaining user confidentiality and strict adherence to the Google Play Developer Data Safety Guidelines.
              </p>
            </div>
          </div>

          <div className="legal-block">
            <div className="legal-icon"><Eye size={22} /></div>
            <div className="legal-text">
              <h3>2. Information We Collect</h3>
              <p>We collect information to provide, optimize, and secure our streaming and talent hunt services. The data collected falls into the following categories:</p>
              <ul className="legal-list">
                <li><strong>Personal Identification Data:</strong> Full name, email address, profile photo, and password credentials provided voluntarily during sign-up.</li>
                <li><strong>Device & Telemetry Data:</strong> Device model, operating system version, unique device identifiers (Android ID), IP address, app diagnostic logs, and network connection speed.</li>
                <li><strong>User-Generated Content:</strong> Video recordings, audio tracks, thumbnail images, and comments submitted for the VIZ TV Talent Hunt showcase.</li>
                <li><strong>Usage & Streaming Analytics:</strong> Playback duration, watch history, video resolution choices, and search query logs inside the app.</li>
              </ul>
            </div>
          </div>

          <div className="legal-block">
            <div className="legal-icon"><FileText size={22} /></div>
            <div className="legal-text">
              <h3>3. How We Use Collected Data</h3>
              <p>The information we collect is processed strictly for legitimate operational purposes:</p>
              <ul className="legal-list">
                <li>To deliver seamless 4K/HD video playback and sync user watch history across devices.</li>
                <li>To manage contestant accounts, process votes, and update Talent Hunt leaderboards.</li>
                <li>To authenticate user sessions and protect against fraudulent access or abuse.</li>
                <li>To send critical service notices, software updates, and developer announcements.</li>
              </ul>
            </div>
          </div>

          <div className="legal-block">
            <div className="legal-icon"><Lock size={22} /></div>
            <div className="legal-text">
              <h3>4. Data Security & Storage</h3>
              <p>
                We implement industry-standard encryption protocols (HTTPS/TLS 1.3) for all data in transit between your device and server infrastructure. Sensitive user credentials are hashed and stored in encrypted databases. We enforce strict role-based access controls for authorized personnel only.
              </p>
            </div>
          </div>

          <div className="legal-block">
            <div className="legal-icon"><Trash2 size={22} /></div>
            <div className="legal-text">
              <h3>5. User Rights & Account Deletion</h3>
              <p>
                You have the absolute right to access, export, modify, or request complete deletion of your personal data and VIZ TV account.
              </p>
              <p style={{ marginTop: '8px' }}>
                You can initiate account deletion at any time via our{' '}
                <button onClick={onNavigateDeletion} className="inline-link-btn">
                  Account Deletion Request Portal
                </button>{' '}
                or by emailing our privacy team directly at <strong>krishna732300@gmail.com</strong>.
              </p>
            </div>
          </div>

          <div className="legal-block">
            <div className="legal-icon"><Shield size={22} /></div>
            <div className="legal-text">
              <h3>6. Children's Privacy (COPPA Compliance)</h3>
              <p>
                VIZ TV does not knowingly collect personal identifiable information from children under the age of 13. If you believe a child has submitted personal data to our platform without parental consent, please contact us immediately for swift data removal.
              </p>
            </div>
          </div>

          <div className="legal-block">
            <div className="legal-icon"><Mail size={22} /></div>
            <div className="legal-text">
              <h3>7. Developer & Support Contact Details</h3>
              <div className="dev-details-card">
                <p><strong>Application Name:</strong> VIZ TV</p>
                <p><strong>Application ID:</strong> com.vizdigitals.viztv</p>
                <p><strong>Developer Account:</strong> krishna7323</p>
                <p><strong>Support Email:</strong> krishna732300@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .privacy-section {
          padding: 100px 0;
          position: relative;
        }
        .legal-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding: 3rem;
        }
        .legal-block {
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }
        .legal-block:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .legal-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(229, 9, 20, 0.15);
          color: var(--primary-hover);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .legal-text h3 {
          font-size: 1.3rem;
          font-weight: 800;
          margin-bottom: 8px;
          color: var(--text-main);
        }
        .legal-text p {
          font-size: 0.98rem;
          color: var(--text-muted);
          line-height: 1.7;
        }
        .legal-list {
          margin-top: 10px;
          padding-left: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .legal-list li {
          font-size: 0.95rem;
          color: var(--text-muted);
        }
        .inline-link-btn {
          background: none;
          border: none;
          color: var(--primary-hover);
          font-weight: 700;
          text-decoration: underline;
          cursor: pointer;
        }
        .dev-details-card {
          margin-top: 12px;
          background: rgba(0, 0, 0, 0.4);
          padding: 1.25rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .dev-details-card p {
          font-size: 0.9rem;
          color: var(--text-main);
        }

        @media (max-width: 768px) {
          .legal-container {
            padding: 1.5rem;
          }
          .legal-block {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </section>
  );
}
