import { useState, useEffect } from 'react';
import './App.css';
import Header from './components/landing/Header';
import HeroSection from './components/landing/HeroSection';
import NumbersSection from './components/landing/NumbersSection';
import PrinciplesSection from './components/landing/PrinciplesSection';
import HistorySection from './components/landing/HistorySection';
import ReviewsSection from './components/landing/ReviewsSection';
import PartnersSection from './components/landing/PartnersSection';
import FaqSection from './components/landing/FaqSection';
import TeamSection from './components/landing/TeamSection';
import MapSection from './components/MapSection';
import FooterSection from './components/landing/FooterSection';
import CookieConsent from './components/CookieConsent';

function App() {
  const [config, setConfig] = useState(null);
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    fetch('/config.json')
      .then(res => {
        if (!res.ok) throw new Error('Config not found');
        return res.json();
      })
      .then(data => {
        setConfig(data);
        setConfigLoaded(true);
      })
      .catch(() => {
        setConfig({
          registration: {
            startDate: '2026-06-20T00:00:00',
            endDate: '2026-07-20T23:59:59',
          },
        });
        setConfigLoaded(true);
      });
  }, []);

  if (!configLoaded) {
    return null;
  }

  return (
    <div className="page">
      <Header />

      <main>
        <HeroSection config={config} />
        <NumbersSection />
        
        <div className="container">
          <hr className="section-divider" />
        </div>

        <PrinciplesSection />
        
        <div className="container">
          <hr className="section-divider" />
        </div>

        <HistorySection />
        
        <div className="container">
          <hr className="section-divider" />
        </div>

        <ReviewsSection />
        
        <div className="container">
          <hr className="section-divider" />
        </div>

        <PartnersSection />
        
        <div className="container">
          <hr className="section-divider" />
        </div>

        <FaqSection />
        
        <div className="container">
          <hr className="section-divider" />
        </div>

        <TeamSection />
        
        <div className="container">
          <hr className="section-divider" />
        </div>

        <MapSection />
        
        <div className="container">
          <hr className="section-divider" />
        </div>
      </main>

      <FooterSection />
      <CookieConsent />
    </div>
  );
}

export default App;