import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, User, PhoneCall } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && message) {
      setSent(true);
    }
  };

  return (
    <section className="contact-section" id="contact">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">
            <Mail size={16} />
            <span>Support & Enquiries</span>
          </div>
          <h2 className="section-title">
            Get in <span>Touch With Us</span>
          </h2>
          <p className="section-desc">
            Have questions, feedback, or business queries? Reach out to the VIZ TV developer team.
          </p>
        </div>

        <div className="contact-grid">
          {/* Info Card */}
          <div className="contact-info-card glass-card">
            <h3 className="info-title">Developer & Platform Support</h3>
            <p className="info-desc">Our dedicated technical support team is available 24/7 to assist viewers and creators.</p>
            
            <div className="info-items-list">
              <div className="info-item">
                <div className="info-icon"><Mail size={20} /></div>
                <div>
                  <strong>Official Developer Email</strong>
                  <p>krishna732300@gmail.com</p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon"><MessageSquare size={20} /></div>
                <div>
                  <strong>Developer Account</strong>
                  <p>krishna7323</p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon"><PhoneCall size={20} /></div>
                <div>
                  <strong>Package Identifier</strong>
                  <p>com.vizdigitals.viztv</p>
                </div>
              </div>
            </div>

            <div className="contact-hours-box">
              <span>🕒 Response Time: Usually within 12-24 hours</span>
            </div>
          </div>

          {/* Form Card */}
          <div className="contact-form-card glass-card">
            {!sent ? (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label>Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Your Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Message / Support Ticket *</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="How can we help you?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="form-input"
                  ></textarea>
                </div>

                <button type="submit" className="btn-primary w-full">
                  <Send size={18} />
                  <span>Send Message</span>
                </button>
              </form>
            ) : (
              <div className="sent-success-box">
                <CheckCircle2 size={54} className="text-green" />
                <h3>Message Sent Successfully!</h3>
                <p>Thank you for reaching out, {name || 'User'}. We will get back to you at <strong>{email}</strong> shortly.</p>
                <button onClick={() => setSent(false)} className="btn-secondary">Send Another Message</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .contact-section {
          padding: 90px 0;
          background: rgba(14, 16, 26, 0.4);
        }
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem;
        }
        .contact-info-card {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .info-title {
          font-size: 1.5rem;
          font-weight: 800;
        }
        .info-desc {
          font-size: 0.98rem;
          color: var(--text-muted);
          line-height: 1.6;
        }
        .info-items-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .info-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .info-icon {
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
        .info-item strong {
          display: block;
          font-size: 0.95rem;
        }
        .info-item p {
          font-size: 0.88rem;
          color: var(--text-muted);
        }
        .contact-hours-box {
          margin-top: auto;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.3);
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .sent-success-box {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          padding: 2rem 0;
        }
        .text-green { color: #10b981; }

        @media (max-width: 992px) {
          .contact-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
