import { useState, useEffect } from 'react';
import './landing-styles.css';
import Header from './components/Header.jsx';
import HeroSection from './components/HeroSection.jsx';
import NumbersSection from './components/NumbersSection.jsx';
import PrinciplesSection from './components/PrinciplesSection.jsx';
import HistorySection from './components/HistorySection.jsx';
import ReviewsSection from './components/ReviewsSection.jsx';
import PartnersSection from './components/PartnersSection.jsx';
import FaqSection from './components/FaqSection.jsx';
import TeamSection from './components/TeamSection.jsx';
import MapSection from './components/MapSection.jsx';
import FooterSection from './components/FooterSection.jsx';
import CookieConsent from './components/CookieConsent.jsx';
import RegistrationModal from './components/RegistrationModal.jsx';
import { getRegistrationStatus } from '../../entities/auth';

// Объявляем тип для конфига
interface Config {
  registration: {
    startDate: string;
    endDate: string;
  };
}

export default function LandingPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [registrationClosed, setRegistrationClosed] = useState(false);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [registrationModalClosing, setRegistrationModalClosing] = useState(false);

  useEffect(() => {
    fetch('/config.json')
      .then((res) => {
        if (!res.ok) throw new Error('Config not found');
        return res.json();
      })
      .then((data: Config) => {
        setConfig(data);
        setConfigLoaded(true);
      })
      .catch(() => {
        // fallback — если файл не найден, используем дефолтные даты
        setConfig({
          registration: {
            startDate: '2026-06-20T00:00:00',
            endDate: '2026-07-20T23:59:59',
          },
        });
        setConfigLoaded(true);
      });
  }, []);

  useEffect(() => {
    getRegistrationStatus()
      .then((status) => setRegistrationClosed(status.intake_closed))
      .catch(() => setRegistrationClosed(false));
  }, []);

  const closeRegistrationModal = () => {
    setRegistrationModalClosing(true);
    setTimeout(() => {
      setRegistrationModalOpen(false);
      setRegistrationModalClosing(false);
    }, 260);
  };

  const isRegistrationClosedByDate = (() => {
    if (!config) {
      return false;
    }

    const now = Date.now();
    return now < new Date(config.registration.startDate).getTime() ||
      now > new Date(config.registration.endDate).getTime();
  })();

  const isRegistrationClosed = registrationClosed || isRegistrationClosedByDate;

  if (!configLoaded) {
    return null;
  }

  return (
    <div className="landing-page">
      <Header />
      <main>
        <HeroSection
          config={config}
          registrationClosed={isRegistrationClosed}
          onRegistrationClosedClick={() => setRegistrationModalOpen(true)}
        />
        <NumbersSection />
        <hr className="landing-divider" />
        <PrinciplesSection />
        <hr className="landing-divider" />
        <HistorySection />
        <hr className="landing-divider" />
        <ReviewsSection />
        <hr className="landing-divider" />
        <PartnersSection />
        <hr className="landing-divider" />
        <FaqSection />
        <hr className="landing-divider" />
        <TeamSection />
        <hr className="landing-divider" />
        <MapSection />
      </main>
      <FooterSection />
      <RegistrationModal
        isOpen={registrationModalOpen}
        isClosing={registrationModalClosing}
        onClose={closeRegistrationModal}
      />
      <CookieConsent />
    </div>
  );
}
