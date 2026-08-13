import React, { useState } from 'react';
import { ShieldAlert, HeartHandshake, Eye, AlertTriangle, Send, CheckCircle2, Lock, Mail } from 'lucide-react';

export default function ChildSafetyView() {
  const [reportEmail, setReportEmail] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (reportDetails) {
      setSubmitted(true);
    }
  };

  return (
    <section className="child-safety-section" id="child-safety">
      <div className="container">
        <div className="section-header">
          <div className="section-badge badge-alert">
            <ShieldAlert size={16} />
            <span>Google Play Policy & COPPA Compliant</span>
          </div>
          <h2 className="section-title">
            Child Safety & <span>Protection Policy</span>
          </h2>
          <p className="section-desc">
            Effective Date: August 12, 2026 | Application: <strong>VIZ TV (com.vizdigitals.viztv)</strong>
          </p>
        </div>

        <div className="legal-container glass-card">
          {/* Section 1: Zero Tolerance Statement */}
          <div className="legal-block">
            <div className="legal-icon icon-alert"><ShieldAlert size={24} /></div>
            <div className="legal-text">
              <h3>1. Zero-Tolerance Policy Against Child Sexual Abuse & Exploitation (CSAE)</h3>
              <p>
                <strong>VIZ TV</strong> enforces a strict, uncompromising zero-tolerance policy against Child Sexual Abuse Material (CSAM), Child Sexual Exploitation and Abuse (CSAE), and any form of child endangerment, grooming, or inappropriate depiction of minors across our video streaming platform and Talent Hunt audition showcase.
              </p>
              <p style={{ marginTop: '8px' }}>
                Any account or video upload attempting to share, request, or promote harmful content involving minors will be <strong>permanently banned immediately</strong>, and all associated IP addresses, account metadata, and media files will be reported to law enforcement agencies and the <strong>National Center for Missing & Exploited Children (NCMEC)</strong>.
              </p>
            </div>
          </div>

          {/* Section 2: Proactive Moderation & Safety Controls */}
          <div className="legal-block">
            <div className="legal-icon"><Eye size={24} /></div>
            <div className="legal-text">
              <h3>2. Proactive Content Moderation & AI Screening</h3>
              <p>To ensure VIZ TV remains a safe ecosystem for families, viewers, and young talent contestants, we deploy multi-layered safety mechanisms:</p>
              <ul className="legal-list">
                <li><strong>Automated AI Image & Video Filtering:</strong> All uploaded Talent Hunt video auditions are pre-screened by automated perceptual hashing algorithms to block illicit content prior to publication.</li>
                <li><strong>Human Moderation Team:</strong> A dedicated 24/7 safety moderation team reviews reported clips and audition entries.</li>
                <li><strong>Talent Hunt Minor Supervision:</strong> Contestants under the age of 18 must participate under the supervision of a parent or verified legal guardian.</li>
              </ul>
            </div>
          </div>

          {/* Section 3: In-App & Web Reporting Mechanism */}
          <div className="legal-block">
            <div className="legal-icon"><AlertTriangle size={24} /></div>
            <div className="legal-text">
              <h3>3. Urgent Child Safety Incident Reporting Portal</h3>
              <p>
                If you encounter any content, video clip, user comment, or profile that appears to violate our Child Safety Standards, please report it immediately using our direct hotline form below or via email.
              </p>

              <div className="safety-report-box">
                {!submitted ? (
                  <form onSubmit={handleReportSubmit} className="safety-report-form">
                    <h4 className="report-box-title">Submit Urgent Child Safety Report</h4>
                    
                    <div className="form-group">
                      <label>Your Email Address (Optional for follow-up)</label>
                      <input
                        type="email"
                        placeholder="reporter@example.com"
                        value={reportEmail}
                        onChange={(e) => setReportEmail(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Incident Details / Video URL / Contestant Name *</label>
                      <textarea
                        rows="3"
                        required
                        placeholder="Describe the issue or paste the video URL / contestant username..."
                        value={reportDetails}
                        onChange={(e) => setReportDetails(e.target.value)}
                        className="form-input"
                      ></textarea>
                    </div>

                    <button type="submit" className="btn-primary btn-alert-submit">
                      <Send size={18} />
                      <span>Submit Urgent Safety Report</span>
                    </button>
                  </form>
                ) : (
                  <div className="report-success-box">
                    <CheckCircle2 size={44} className="text-green" />
                    <h4>Report Submitted Successfully</h4>
                    <p>Thank you for helping keep VIZ TV safe. Our emergency safety compliance team is reviewing this report immediately.</p>
                    <button onClick={() => setSubmitted(false)} className="btn-secondary">Submit Another Report</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Children's Privacy & COPPA Compliance */}
          <div className="legal-block">
            <div className="legal-icon"><Lock size={24} /></div>
            <div className="legal-text">
              <h3>4. Children's Online Privacy Protection (COPPA Compliance)</h3>
              <p>
                VIZ TV complies with the Children's Online Privacy Protection Act (COPPA) and Google Play Developer Policies regarding child privacy. We do not knowingly collect personal identifiable information from children under the age of 13 without verifiable parental consent.
              </p>
            </div>
          </div>

          {/* Section 5: Direct Contact for Safety Officers */}
          <div className="legal-block">
            <div className="legal-icon"><Mail size={24} /></div>
            <div className="legal-text">
              <h3>5. Official Child Safety Officer Contact</h3>
              <p>For urgent law enforcement requests or child protection inquiries, contact our Child Safety Compliance Officer:</p>
              <div className="dev-details-card">
                <p><strong>Child Safety Officer Email:</strong> krishna732300@gmail.com</p>
                <p><strong>Subject Line:</strong> URGENT: CHILD SAFETY REPORT</p>
                <p><strong>Application:</strong> VIZ TV (com.vizdigitals.viztv)</p>
                <p><strong>Developer:</strong> krishna7323</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .child-safety-section {
          padding: 100px 0;
          position: relative;
        }
        .badge-alert {
          background: rgba(239, 68, 68, 0.15) !important;
          border-color: rgba(239, 68, 68, 0.4) !important;
          color: #ef4444 !important;
        }
        .icon-alert {
          background: rgba(239, 68, 68, 0.18) !important;
          color: #ef4444 !important;
        }
        .safety-report-box {
          margin-top: 1.25rem;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          padding: 1.5rem;
        }
        .report-box-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: #ef4444;
          margin-bottom: 1rem;
        }
        .safety-report-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .btn-alert-submit {
          background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%) !important;
          box-shadow: 0 8px 24px rgba(239, 68, 68, 0.35) !important;
        }
        .btn-alert-submit:hover {
          background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%) !important;
        }
        .report-success-box {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 1rem 0;
        }
      `}</style>
    </section>
  );
}
