import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import AppDemo from './components/AppDemo.jsx';
import Features from './components/Features.jsx';
import ContentShowcase from './components/ContentShowcase.jsx';
import TalentHunt from './components/TalentHunt.jsx';
import LegalPrivacyView from './components/LegalPrivacyView.jsx';
import TermsOfService from './components/TermsOfService.jsx';
import AccountDeletion from './components/AccountDeletion.jsx';
import Faq from './components/Faq.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import VideoModal from './components/VideoModal.jsx';

const getTabFromUrl = () => {
  try {
    const rawPath = decodeURIComponent(window.location.pathname || '').toLowerCase();
    const rawHash = decodeURIComponent(window.location.hash || '').toLowerCase();
    const combined = `${rawPath} ${rawHash}`;

    if (combined.includes('privacy')) return 'privacy';
    if (combined.includes('term')) return 'terms';
    if (combined.includes('delete') || combined.includes('account-deletion')) return 'account-deletion';
    if (combined.includes('how')) return 'how-it-works';
    if (combined.includes('feature')) return 'features';
    if (combined.includes('trend')) return 'trending';
    if (combined.includes('talent')) return 'talent-hunt';
    if (combined.includes('faq')) return 'faq';
    if (combined.includes('contact')) return 'contact';
  } catch (e) {
    console.error('Error parsing URL route:', e);
  }
  return 'home';
};

export default function App() {
  const [activeTab, setActiveTab] = useState(getTabFromUrl);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    const handleLocationChange = () => {
      const targetTab = getTabFromUrl();
      setActiveTab(targetTab);

      if (['home', 'how-it-works', 'features', 'trending', 'talent-hunt', 'contact', 'faq'].includes(targetTab)) {
        setTimeout(() => {
          const el = document.getElementById(targetTab);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    
    // Execute on mount
    handleLocationChange();

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const changeTab = (newTab) => {
    setActiveTab(newTab);
    
    let path = '/';
    if (newTab === 'privacy') path = '/privacy-policy';
    else if (newTab === 'terms') path = '/terms-of-service';
    else if (newTab === 'account-deletion') path = '/account-deletion';
    else if (newTab !== 'home') path = `/#${newTab}`;

    try {
      window.history.pushState({ tab: newTab }, '', path);
    } catch (e) {
      console.warn('History pushState restricted:', e);
    }

    if (['privacy', 'terms', 'account-deletion'].includes(newTab)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(newTab);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleOpenTrailer = () => {
    setActiveVideo({
      title: 'VIZ TV - Streaming & Talent Hunt Official Trailer',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    });
  };

  const handleNavigateDeletion = () => {
    changeTab('account-deletion');
  };

  return (
    <div className="app-root">
      <Navbar activeTab={activeTab} setActiveTab={changeTab} />

      <main>
        {activeTab === 'privacy' ? (
          <div className="standalone-view">
            <LegalPrivacyView onNavigateDeletion={handleNavigateDeletion} />
          </div>
        ) : activeTab === 'terms' ? (
          <div className="standalone-view">
            <TermsOfService />
          </div>
        ) : activeTab === 'account-deletion' ? (
          <div className="standalone-view">
            <AccountDeletion />
          </div>
        ) : (
          <>
            <Hero
              onOpenTrailer={handleOpenTrailer}
              onNavigatePrivacy={() => changeTab('privacy')}
            />
            <HowItWorks />
            <AppDemo />
            <Features />
            <ContentShowcase onOpenVideo={(item) => setActiveVideo(item)} />
            <TalentHunt />
            <LegalPrivacyView onNavigateDeletion={handleNavigateDeletion} />
            <TermsOfService />
            <AccountDeletion />
            <Faq />
            <Contact />
          </>
        )}
      </main>

      <Footer
        setActiveTab={changeTab}
        onNavigateDeletion={handleNavigateDeletion}
      />

      <VideoModal
        video={activeVideo}
        onClose={() => setActiveVideo(null)}
      />

      <style>{`
        .app-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        main {
          flex: 1;
        }
        .standalone-view {
          padding-top: 80px;
        }
      `}</style>
    </div>
  );
}
