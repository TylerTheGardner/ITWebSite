import { Link } from 'react-router-dom'
import ChatbotWidget from '../components/ChatbotWidget'
import './Home.css'

const services = [
  {
    icon: '🖥️',
    title: 'IT Support',
    desc: 'Computer acting up? Wi-Fi cutting out? I come to you or connect remotely and sort it out in plain English.',
    link: '/services#it-support',
  },
  {
    icon: '🔒',
    title: 'Security Audit',
    desc: 'Most homes and small businesses have gaps they don\'t know about. I\'ll find them and help you close them.',
    link: '/services#security',
  },
  {
    icon: '🚫',
    title: 'Scam Prevention',
    desc: 'Scam calls and phishing emails are everywhere. I\'ll help you stop them before they cause real damage.',
    link: '/services#scam',
  },
  {
    icon: '💻',
    title: 'Custom Software',
    desc: 'Need a website, booking system, or custom tool built for your business? I design and build it from scratch.',
    link: '/services#software',
  },
  {
    icon: '🤖',
    title: 'AI Integration',
    desc: 'AI can save your business real time and money. I help you figure out what\'s worth using and get it set up right.',
    link: '/services#ai',
  },
]

const localReasons = [
  {
    icon: '📍',
    title: 'Actually local',
    desc: 'I live in Auburn Lake Trails. When you call, you\'re calling a neighbor, not a call center.',
  },
  {
    icon: '🗣️',
    title: 'No tech-speak',
    desc: 'I\'ll tell you what\'s wrong and what it costs to fix it. No confusing jargon, no surprise bills.',
  },
  {
    icon: '🤝',
    title: 'No upselling',
    desc: 'You get what you actually need. I\'d rather earn your trust than sell you something you don\'t.',
  },
]

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero__bg" aria-hidden="true" />
        <div className="container hero__content">
          <span className="section-label">Cool, CA &amp; Auburn Lake Trails</span>
          <h1 className="hero__title">
            Tech help from<br />
            <span className="hero__title-accent">your neighbor.</span>
          </h1>
          <p className="hero__sub">
            I'm Tyler, and I live right here in Auburn Lake Trails. Whether your
            computer's slow, your Wi-Fi's unreliable, or you need a website built
            for your business, I can help.
          </p>
          <div className="hero__actions">
            <Link to="/contact" className="btn btn-primary">Get in Touch</Link>
            <Link to="/services" className="btn btn-ghost">See What I Do</Link>
          </div>
        </div>
      </section>

      {/* Services overview */}
      <section className="section">
        <div className="container">
          <div className="section-header center">
            <span className="section-label">How I Can Help</span>
            <h2 className="section-title">What I do</h2>
            <p className="section-sub">
              From everyday tech fixes to custom software for your business,
              all in one place, from someone who actually picks up the phone.
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

      {/* Why local */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header center">
            <span className="section-label">Why Gold Country IT</span>
            <h2 className="section-title">Tech help that actually feels helpful</h2>
            <p className="section-sub">
              I started this business because good, honest tech support is hard to find
              out here, and it shouldn't be.
            </p>
          </div>
          <div className="grid-3">
            {localReasons.map(({ icon, title, desc }) => (
              <div key={title} className="card local-reason-card">
                <span className="local-reason-card__icon">{icon}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="cta-banner">
        <div className="container cta-banner__inner">
          <div>
            <h2>Not sure if I can help?</h2>
            <p>Just ask. Free 30-minute consultation, no pressure.</p>
          </div>
          <div className="cta-banner__actions">
            <Link to="/contact" className="btn btn-primary">Get in Touch</Link>
            <a href="tel:+13036537381" className="btn btn-ghost">(303) 653-7381</a>
          </div>
        </div>
      </section>

      <ChatbotWidget />
    </>
  )
}
