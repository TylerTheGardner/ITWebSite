import { Link } from 'react-router-dom'
import ChatbotWidget from '../components/ChatbotWidget'
import './About.css'

const timeline = [
  {
    year: 'Early career',
    title: 'Learning the craft',
    desc: 'Started in IT support and software development, working my way through increasingly complex projects and learning what actually makes technology work for people, not just on paper.',
  },
  {
    year: '2019',
    title: 'SAP Hackathon, first place',
    desc: 'Competed in a national SAP development challenge and took first. Mostly just a fun reminder that working fast under pressure is a skill you either have or you build.',
  },
  {
    year: 'Over 8 years',
    title: 'Enterprise consulting',
    desc: 'Worked with companies like Cintas, the San Francisco 49ers, and Gates Corporation on software development and IT projects. Good experience, interesting problems, and a lot of lessons about what businesses actually need from their technology.',
  },
  {
    year: 'Now',
    title: 'Moved to Auburn Lake Trails, started Gold Country IT',
    desc: 'After years of working with big organizations, I wanted to do work that felt closer to home. Literally. Good tech help is hard to find out here, and that felt like a problem worth solving.',
  },
]

const values = [
  {
    icon: '🤝',
    title: 'Straight talk',
    desc: 'I\'ll tell you what\'s actually wrong and what it actually costs to fix. No inflated quotes, no unnecessary upsells.',
  },
  {
    icon: '📍',
    title: 'Your neighbor',
    desc: 'I live in Auburn Lake Trails. I\'m not a franchise or a call center. I\'m someone you might run into at the hardware store.',
  },
  {
    icon: '🎯',
    title: 'Right-sized help',
    desc: 'A $50 fix doesn\'t need a $500 solution. I\'ll tell you when something is simple and when it isn\'t.',
  },
  {
    icon: '🔮',
    title: 'Keeping up with AI',
    desc: 'The tech landscape is changing fast. I stay current so I can give you honest, practical advice instead of hype.',
  },
]

export default function About() {
  return (
    <>
      <section className="page-hero page-hero--about">
        <div className="container">
          <span className="section-label">About</span>
          <h1>Hi, I'm Tyler.</h1>
          <p className="page-hero__sub">
            I live in Auburn Lake Trails and I started Gold Country IT because
            finding good local tech help shouldn't be this hard.
          </p>
        </div>
      </section>

      {/* Bio */}
      <section className="section">
        <div className="container about-bio">
          <div className="about-bio__avatar" aria-hidden="true">
            <div className="about-bio__avatar-placeholder">TG</div>
          </div>
          <div className="about-bio__text">
            <span className="section-label">A bit about me</span>
            <h2>Tyler, Gold Country IT</h2>
            <p>
              I'm a software developer and IT consultant. I've been doing this
              professionally for over 8 years, working on everything from small
              business websites to large-scale enterprise software. I've learned
              a lot along the way, mostly about what people actually need from
              their technology versus what they get sold.
            </p>
            <p>
              I moved to Auburn Lake Trails because I wanted to be somewhere
              quieter and more connected. Starting Gold Country IT was a natural
              fit. There's real demand for this kind of help out here, and I'd
              rather be useful to my neighbors than commute to an office.
            </p>
            <p>
              If you've got a tech problem, big or small, feel free to reach
              out. I'm pretty easy to talk to, and the first conversation is
              always free.
            </p>
            <div className="about-bio__actions">
              <Link to="/contact" className="btn btn-primary">Get in Touch</Link>
              <Link to="/services" className="btn btn-outline">View Services</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Background</span>
            <h2 className="section-title">Where I'm coming from</h2>
          </div>
          <div className="timeline">
            {timeline.map(({ year, title, desc }) => (
              <div key={title} className="timeline-item">
                <div className="timeline-item__year">{year}</div>
                <div className="timeline-item__dot" aria-hidden="true" />
                <div className="timeline-item__content">
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section">
        <div className="container">
          <div className="section-header center">
            <span className="section-label">How I work</span>
            <h2 className="section-title">What to expect</h2>
          </div>
          <div className="grid-2">
            {values.map(({ icon, title, desc }) => (
              <div key={title} className="card value-card">
                <span className="value-card__icon">{icon}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-banner-about">
        <div className="container cta-banner-about__inner">
          <h2>Let's figure out what you need.</h2>
          <p>Free 30-minute conversation. No pressure, no commitment.</p>
          <Link to="/contact" className="btn btn-primary">Get in Touch</Link>
        </div>
      </section>

      <ChatbotWidget />
    </>
  )
}
