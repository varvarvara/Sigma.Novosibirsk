import { useState } from 'react';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';

const NSU_COORDINATES = [54.842993, 83.090845];

export default function MapSection() {
  const [showCopied, setShowCopied] = useState(false);

  const handleCopyAddress = async () => {
    const address = 'г. Новосибирск, ул. Пирогова, д. 1';
    try {
      await navigator.clipboard.writeText(address);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      const input = document.createElement('input');
      input.value = address;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  return (
    <section className="section section--map" id="map">
      <div className="container">
        <div className="map-wrapper">
          <div className="map-info">
            <h3 className="map-info__title">Новосибирский государственный университет (НГУ)</h3>
            <div className="map-info__address-wrapper">
              <button className="map-info__address-copy" onClick={handleCopyAddress} aria-label="Скопировать адрес">
                г. Новосибирск, ул. Пирогова, д. 1
              </button>
              {showCopied && (
                <span className="map-copied-tooltip">Скопировано!</span>
              )}
            </div>

            <div className="map-info__details">
              <div>
                <strong>Как добраться:</strong>
                <p>Метро «Студенческая», далее пешком 5 минут до главного корпуса НГУ.</p>
              </div>
              <div>
                <strong>Ориентир по входу:</strong>
                <p>Главный вход со стороны ул. Пирогова, через центральную арку.</p>
              </div>
            </div>
          </div>

          <div className="map-container">
            <YMaps query={{ apikey: '0643d0d2-bb58-420d-81c4-fd7635893ee2', lang: 'ru_RU' }}>
              <Map
                defaultState={{
                  center: NSU_COORDINATES,
                  zoom: 16,
                }}
                width="100%"
                height="100%"
              >
                <Placemark
                  geometry={NSU_COORDINATES}
                  properties={{
                    balloonContent: 'Новосибирский государственный университет (НГУ)',
                  }}
                  options={{
                    preset: 'islands#redDotIcon',
                  }}
                />
              </Map>
            </YMaps>
          </div>
        </div>
      </div>
    </section>
  );
}