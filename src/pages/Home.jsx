import { Link } from 'react-router-dom'
import ChatbotWidget from '../components/ChatbotWidget'
import './Home.css'

const services = [
  {
    icon: '🖥️',
    title: 'IT Support',
    desc: 'Fast, friendly help for computers, networks, printers, and all your everyday tech headaches — in person or remote.',
    link: '/services#it-support',
  },
  {
    icon: '🔒',
    title: 'Security Audit',
    desc: 'Find out where your home or business is vulnerable before someone else does. Clear report, plain-English results.',
    link: '/services#security',
  },
  {
    icon: '🚫',
    title: 'Scam Prevention',
    desc: 'Stop spam and scam calls, emails, and texts in their tracks. Protect yourself and your employees.',
    link: '/services#scam',
  },
  {
    icon: '💻',
    title: 'Custom Software',
    desc: 'Websites, booking tools, inventory systems — built for your specific business, not off-the-shelf.',
    link: '/services#software',
  },
  {
    icon: '🤖',
    title: 'AI Integration',
    desc: 'Put AI to work for your business: automate tasks, answer customer questions, generate reports, and more.',
    link: '/services#ai',
  },
]

const credentials = [
  { label: 'Years Experience', value: '8+' },
  { label: 'SAP Hackathon', value: '2019 Winner' },
  { label: 'Enterprise Clients', value: '3+' },
  { label: 'Local & Remote', value: 'Available' },
]

const clients = ['Cintas', 'San Francisco 49ers', 'Gates Corporation']

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero__bg" aria-hidden="true" />
        <div className="container hero__content">
          <span className="section-label">Serving Cool, CA &amp; Auburn Lake Trails</span>
          <h1 className="hero__title">
            Local Tech Help,<br />
            <span className="hero__title-accent">AI-Powered Results</span>
          </h1>
          <p className="hero__sub">
            Gold Country IT brings big-company expertise to your neighborhood.
            From fixing a slow PC to building a custom AI tool for your business —
            we've got you covered.
          </p>
          <div className="hero__actions">
            <Link to="/contact" className="btn btn-primary">Book a Free Consultation</Link>
            <Link to="/services" className="btn btn-ghost">View Services</Link>
          </div>
        </div>
      </section>

      {/* Credential strip */}
      <section className="cred-strip">
        <div className="container cred-strip__inner">
          {credentials.map(({ label, value }) => (
            <div key={label} className="cred-strip__item">
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Services overview */}
      <section className="section">
        <div className="container">
          <div className="section-header center">
            <span className="section-label">What We Do</span>
            <h2 className="section-title">Everything Tech, Under One Roof</h2>
            <p className="section-sub">
              Whether you need a quick fix or a full digital transformation,
              Gold Country IT has the skills to get it done.
            </p>
          </div>
          <div className="services-grid">
            {services.map(({ icon, title, desc, link }) => (
              <Link to={link} key={title} className="service-card card">
                <span className="service-card__icon">{icon}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
                <span className="service-card__more">Learn more →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Client logos */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header center">
            <span className="section-label">Proven Track Record</span>
            <h2 className="section-title">Trusted by Industry Leaders</h2>
            <p className="section-sub">
              8 years of experience helping enterprise clients — now bringing that
              expertise to Gold Country businesses and homes.
            </p>
          </div>
          <div className="clients-row">
            {clients.map(c => (
              <div key={c} className="client-badge">{c}</div>
            ))}
          </div>
          <p className="clients-note">
            + 2019 SAP Hackathon Winner &nbsp;🏆
          </p>
        </div>
      </section>

      {/* CTA banner */}
      <section className="cta-banner">
        <div className="container cta-banner__inner">
          <div>
            <h2>Ready to get started?</h2>
            <p>Free 30-minute consultation — no pressure, no jargon.</p>
          </div>
          <div className="cta-banner__actions">
            <Link to="/contact" className="btn btn-primary">Book Now</Link>
            <a href="tel:+13036537381" className="btn btn-ghost">(303) 653-7381</a>
          </div>
        </div>
      </section>

      <ChatbotWidget />
    </>
  )
}
