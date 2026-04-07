import { Link } from 'react-router-dom'
import ChatbotWidget from '../components/ChatbotWidget'
import './About.css'

const timeline = [
  {
    year: '2019',
    title: 'SAP Hackathon Winner',
    desc: 'Won a competitive SAP Hackbot challenge against teams from across the industry — demonstrating rapid problem-solving and deep technical chops.',
  },
  {
    year: 'Enterprise',
    title: 'Cintas Corporation',
    desc: 'Delivered IT consulting for one of North America\'s largest uniform and workplace supply companies, supporting complex enterprise infrastructure.',
  },
  {
    year: 'Enterprise',
    title: 'San Francisco 49ers',
    desc: 'Provided technology consulting for the NFL franchise, working on systems used by one of the most recognized sports organizations in the world.',
  },
  {
    year: 'Enterprise',
    title: 'Gates Corporation',
    desc: 'Supported IT initiatives at Gates, a global leader in power transmission and fluid power solutions.',
  },
  {
    year: 'Today',
    title: 'Gold Country IT — Serving My Community',
    desc: 'After 8+ years in enterprise IT and development, I\'m putting those skills to work for the people and businesses of Cool, CA and the Auburn Lake Trails community.',
  },
]

const values = [
  {
    icon: '🤝',
    title: 'No Jargon, No Runaround',
    desc: 'I explain things in plain English and tell you exactly what\'s going on with your technology.',
  },
  {
    icon: '📍',
    title: 'Truly Local',
    desc: 'I live here in Auburn Lake Trails. When you need someone, I\'m not a call center — I\'m your neighbor.',
  },
  {
    icon: '🎯',
    title: 'Right-Sized Solutions',
    desc: 'I won\'t oversell you. You get exactly what your situation calls for — not a package designed to inflate a bill.',
  },
  {
    icon: '🔮',
    title: 'Forward-Thinking',
    desc: 'AI is changing everything fast. I stay current so I can give you honest, practical advice on what\'s worth adopting.',
  },
]

export default function About() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="section-label">About Gold Country IT</span>
          <h1>Your Neighbor. Your Tech Expert.</h1>
          <p className="page-hero__sub">
            8 years of enterprise IT experience, now working for the community I call home.
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
            <span className="section-label">Meet Tyler</span>
            <h2>Tyler — Founder & Lead Consultant</h2>
            <p>
              I'm a software developer and IT consultant living in the Auburn Lake Trails
              community in Cool, CA. After spending 8+ years working with major corporations
              across the US, I started Gold Country IT to bring that same level of expertise
              to my own backyard.
            </p>
            <p>
              My background spans everything from enterprise infrastructure and custom software
              development to cutting-edge AI tooling. I've competed in — and won — national
              hackathons, and I've helped companies like Cintas, the San Francisco 49ers, and
              Gates Corporation solve real technology problems.
            </p>
            <p>
              What drives me now is simpler: the people in this community deserve the same
              quality of tech support and advice that big companies pay a lot of money for. No
              condescension, no upselling — just honest, skilled help from someone who
              genuinely cares about this area.
            </p>
            <div className="about-bio__actions">
              <Link to="/contact" className="btn btn-primary">Work With Me</Link>
              <Link to="/services" className="btn btn-outline">View Services</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Experience</span>
            <h2 className="section-title">A Track Record That Speaks for Itself</h2>
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
            <span className="section-label">How I Work</span>
            <h2 className="section-title">What You Can Expect</h2>
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
          <h2>Let's talk about what you need.</h2>
          <p>Free 30-minute consultation. No pressure, no commitment.</p>
          <Link to="/contact" className="btn btn-primary">Schedule a Consultation</Link>
        </div>
      </section>

      <ChatbotWidget />
    </>
  )
}
