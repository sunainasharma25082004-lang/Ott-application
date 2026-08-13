import React, { useState } from 'react';
import { Trash2, AlertTriangle, CheckCircle, Send } from 'lucide-react';

export default function AccountDeletion() {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <section className="account-deletion-section" id="account-deletion">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">
            <Trash2 size={16} />
            <span>User Data Safety</span>
          </div>
          <h2 className="section-title">
            Account & Data <span>Deletion Portal</span>
          </h2>
          <p className="section-desc">
            In compliance with Google Play Store User Data Policies, you can request full account data erasure at any time.
          </p>
        </div>

        <div className="deletion-card glass-card">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="deletion-form">
              <div className="warning-callout">
                <AlertTriangle size={24} className="icon-warning" />
                <div>
                  <h4>Important Notice</h4>
                  <p>Account deletion is permanent. Once processed, your user profile, saved watch history, uploaded talent hunt videos, and voting points will be permanently deleted.</p>
                </div>
              </div>

              <div className="form-group">
                <label>Registered Account Email or Mobile Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. user@example.com or +91 9876543210"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Reason for Deletion (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="Tell us why you want to delete your account..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="form-input"
                ></textarea>
              </div>

              <button type="submit" className="btn-primary form-submit-btn">
                <Send size={18} />
                <span>Submit Account Deletion Request</span>
              </button>

              <p className="deletion-footer-note">
                Or email directly to: <strong>krishna732300@gmail.com</strong> with subject "Account Deletion Request".
              </p>
            </form>
          ) : (
            <div className="submitted-confirmation">
              <CheckCircle size={56} className="icon-success" />
              <h3>Deletion Request Received</h3>
              <p>
                We have received your account deletion request for <strong>{email}</strong>. Your request is being verified and all associated data will be removed within 48 hours.
              </p>
              <button onClick={() => setSubmitted(false)} className="btn-secondary">
                Submit Another Request
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .account-deletion-section {
          padding: 80px 0;
        }
        .deletion-card {
          max-width: 680px;
          margin: 0 auto;
          padding: 2.5rem;
        }
        .deletion-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .warning-callout {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }
        .icon-warning {
          color: #ef4444;
          flex-shrink: 0;
        }
        .warning-callout h4 {
          font-size: 1rem;
          font-weight: 800;
          color: #ef4444;
          margin-bottom: 4px;
        }
        .warning-callout p {
          font-size: 0.88rem;
          color: var(--text-muted);
          line-height: 1.5;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-group label {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-main);
        }
        .form-input {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 12px 16px;
          color: var(--text-main);
          font-family: inherit;
          font-size: 0.95rem;
          outline: none;
          transition: var(--transition);
        }
        .form-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 12px var(--primary-glow);
        }
        .form-submit-btn {
          width: 100%;
          padding: 14px;
          margin-top: 8px;
        }
        .deletion-footer-note {
          font-size: 0.82rem;
          color: var(--text-muted);
          text-align: center;
          margin-top: 6px;
        }

        .submitted-confirmation {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          padding: 2rem 0;
        }
        .icon-success {
          color: #10b981;
        }
        .submitted-confirmation h3 {
          font-size: 1.6rem;
          font-weight: 800;
        }
        .submitted-confirmation p {
          font-size: 1rem;
          color: var(--text-muted);
          max-width: 480px;
          line-height: 1.6;
        }
      `}</style>
    </section>
  );
}
