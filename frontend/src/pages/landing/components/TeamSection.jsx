import { assets, teamMembers } from '../data/landingData';

export default function TeamSection() {
  return (
    <section className="section section--team" id="team">
      <div className="container">
        <div className="section-heading section-heading--center">
          <h2>Команда организаторов Сигмы</h2>
        </div>

        <div className="team-panel">
          <div className="team-list">
            {teamMembers.map((member) => (
              <article className="team-item" key={member.role + member.name}>
                <p className="team-item__role">{member.role}</p>

                <div className="team-item__person">
                  <img
                    className="team-item__avatar"
                    src={`/images/team/${member.avatar}`}
                    alt={member.name.replace('\n', ' ')}
                  />
                  <h3>
                    {member.name.split('\n').map((part) => (
                      <span key={part} className="team-item__name-line">
                        {part}
                      </span>
                    ))}
                  </h3>
                  <div
                    className="team-item__socials"
                    aria-label={`Соцсети ${member.name.replace('\n', ' ')}`}
                  >
                    {member.telegram && (
                      <a href={member.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                        <img src={assets.teamTgIcon} alt="Telegram" />
                      </a>
                    )}
                    {member.vk && (
                      <a href={member.vk} target="_blank" rel="noopener noreferrer" aria-label="VK">
                        <img src={assets.teamVkIcon} alt="VK" />
                      </a>
                    )}
                    {member.email && (
                      <a href={`mailto:${member.email}`} aria-label="Email">
                        <img src={assets.teamEmailIcon} alt="Email" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <a
            className="button button--centered"
            href="https://t.me/tarinaip"
            target="_blank"
            rel="noopener noreferrer"
          >
            Стать частью команды
          </a>
        </div>
      </div>
    </section>
  );
}