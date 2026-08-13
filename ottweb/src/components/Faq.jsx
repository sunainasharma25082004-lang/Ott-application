import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function Faq() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: 'How do I install VIZ TV on my Android device?',
      a: 'You can click the "Download App" button on this website to download the official VIZ TV Android application file (.aab/.apk). Open the file on your device and tap Install. Ensure "Install from unknown sources" is enabled in settings if prompted.'
    },
    {
      q: 'How does the VIZ TV Talent Hunt showcase work?',
      a: 'Once logged into the app, tap the "Talent Hunt" tab. Choose your category (Singing, Acting, Dancing, Comedy), record or upload your performance clip (up to 3 minutes), add a title, and submit. Your audition will instantly be published for fan voting.'
    },
    {
      q: 'Is VIZ TV free to use?',
      a: 'VIZ TV offers both free ad-supported streaming content and VIP premium passes for ad-free 4K streaming and exclusive original series.'
    },
    {
      q: 'Can I stream VIZ TV on my Smart TV or Laptop?',
      a: 'Yes! VIZ TV supports Smart TV casting via Chromecast / AirPlay, as well as native web browser streaming at viztv.app.'
    },
    {
      q: 'How do I delete my account or saved data?',
      a: 'You can submit a data deletion request directly on our website in the Account Deletion section or email krishna732300@gmail.com. We erase all records within 48 hours.'
    }
  ];

  return (
    <section className="faq-section" id="faq">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">
            <HelpCircle size={16} />
            <span>Got Questions?</span>
          </div>
          <h2 className="section-title">
            Frequently Asked <span>Questions</span>
          </h2>
          <p className="section-desc">
            Find answers to common questions about streaming, talent submissions, and account management.
          </p>
        </div>

        <div className="faq-accordion-list">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`faq-item glass-card ${openIdx === idx ? 'open' : ''}`}
              onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)}
            >
              <div className="faq-question-row">
                <h4>{faq.q}</h4>
                <button className="faq-toggle-icon">
                  {openIdx === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>
              {openIdx === idx && (
                <div className="faq-answer-body">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .faq-section {
          padding: 90px 0;
        }
        .faq-accordion-list {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .faq-item {
          cursor: pointer;
          padding: 1.5rem;
          transition: var(--transition);
        }
        .faq-item.open {
          border-color: var(--border-glow);
          background: var(--bg-card-hover);
        }
        .faq-question-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }
        .faq-question-row h4 {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-main);
        }
        .faq-toggle-icon {
          background: none;
          border: none;
          color: var(--primary-hover);
          cursor: pointer;
        }
        .faq-answer-body {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }
        .faq-answer-body p {
          font-size: 0.98rem;
          color: var(--text-muted);
          line-height: 1.6;
        }
      `}</style>
    </section>
  );
}
