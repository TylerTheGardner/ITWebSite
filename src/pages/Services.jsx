import { Link } from 'react-router-dom'
import ChatbotWidget from '../components/ChatbotWidget'
import './Services.css'

const services = [
  {
    id: 'it-support',
    icon: '🖥️',
    title: 'IT Support & Troubleshooting',
    desc: 'Is your computer slow, your printer refusing to print, or your Wi-Fi dropping constantly? I come to you — or connect remotely — and get things working again fast. No confusing tech-speak, just real help from a real person.',
    features: [
      'Remote & on-site support',
      'PC, Mac, tablet & phone help',
      'Wi-Fi & network setup',
      'Printer & peripheral troubleshooting',
      'Software installation & updates',
      'Data backup & recovery',
    ],
    pricing: [
      { label: 'Remote Session', price: '$75', note: 'per hour' },
      { label: 'On-Site Visit', price: '$99', note: 'first hour, $75/hr after' },
      { label: 'Monthly Support Plan', price: '$149', note: '/month — 2 hrs included' },
    ],
    tag: 'Most Popular',
  },
  {
    id: 'security',
    icon: '🔒',
    title: 'Security Audit',
    desc: 'Most small businesses and homes have security gaps they don\'t know about until it\'s too late. I\'ll review your network, devices, accounts, and software — then give you a clear, plain-English action plan to close those gaps.',
    features: [
      'Home network vulnerability scan',
      'Password & account security review',
      'Router & firewall configuration check',
      'Device & software audit',
      'Written report with priority fixes',
      'Follow-up Q&A session included',
    ],
    pricing: [
      { label: 'Home / Individual', price: '$149', note: 'one-time' },
      { label: 'Small Business (up to 10 devices)', price: '$299', note: 'one-time' },
      { label: 'Comprehensive Business Audit', price: '$499', note: 'up to 25 devices' },
    ],
  },
  {
    id: 'scam',
    icon: '🚫',
    title: 'Spam & Scam Prevention',
    desc: 'Scam calls, phishing emails, and spam texts are a growing problem — especially for seniors and small businesses. I\'ll set up the right filters and blockers, and walk you through the habits that actually make a difference.',
    features: [
      'Email spam filter setup & tuning',
      'Phone scam call blocking',
      'Phishing awareness training (1 session)',
      'DNS-level ad & malware blocking',
      'Employee awareness session (businesses)',
      'Ongoing monitoring option available',
    ],
    pricing: [
      { label: 'One-Time Setup', price: '$129', note: 'per device/account' },
      { label: 'Home Protection Package', price: '$199', note: 'up to 5 devices' },
      { label: 'Business Package', price: '$79', note: '/month, up to 10 users' },
    ],
  },
  {
    id: 'software',
    icon: '💻',
    title: 'Custom Software Development',
    desc: 'Generic software forces your business to adapt to it. I build the other way around — websites, booking systems, customer portals, and automation tools designed around exactly how you operate. With 8 years of professional development experience and a background delivering software for enterprise clients including Cintas and Gates Corporation, I bring the same quality of work to businesses of any size.',
    features: [
      'Business websites & landing pages',
      'Online booking & scheduling systems',
      'Customer-facing portals & dashboards',
      'Inventory & order management tools',
      'Process automation & integrations',
      'Ongoing maintenance & support',
    ],
    pricing: null,
    ctaNote: 'Every project is scoped individually. Reach out for a free consultation — I\'ll give you an honest assessment and a clear quote before any work begins.',
    credentials: [
      { label: 'Experience', value: '8+ years professional development' },
      { label: 'Clients', value: 'Cintas · Gates Corporation · SF 49ers' },
      { label: 'Approach', value: 'Fixed-scope quotes, no surprise costs' },
    ],
  },
  {
    id: 'ai',
    icon: '🤖',
    title: 'AI Integration & Consulting',
    desc: 'AI is moving fast, and most businesses don\'t have time to figure out what\'s actually worth adopting. I do. I work hands-on with AI tools daily — building agents, automating workflows, and integrating AI into real business systems. I\'ll help you cut through the noise, identify genuine opportunities, and implement solutions that actually work.',
    features: [
      'AI readiness assessment',
      'Tool selection & vendor evaluation',
      'Chatbot & virtual assistant setup',
      'Workflow automation with AI',
      'Staff training & adoption support',
      'Custom AI agent development',
    ],
    pricing: null,
    ctaNote: 'AI projects vary widely in scope. Let\'s start with a conversation about your business and what\'s realistic — no jargon, no hype.',
    credentials: [
      { label: 'Expertise', value: 'Hands-on AI development & agent building' },
      { label: 'Focus', value: 'Practical tools, not buzzwords' },
      { label: 'Background', value: 'Enterprise consulting + modern AI tooling' },
    ],
  },
]

export default function Services() {
  return (
    <>
      {/* Page header */}
      <section className="page-hero">
        <div className="container">
          <span className="section-label">What I Offer</span>
          <h1>Services &amp; Pricing</h1>
          <p className="page-hero__sub">
            Straightforward pricing where the scope is fixed.
            Custom projects start with a free conversation.
          </p>
        </div>
      </section>

      {/* Services */}
      <div className="services-list">
        {services.map((svc, i) => (
          <section
            key={svc.id}
            id={svc.id}
            className={`section ${i % 2 !== 0 ? 'section-alt' : ''}`}
          >
            <div className="container svc-item">
              <div className="svc-item__header">
                <span className="svc-item__icon">{svc.icon}</span>
                <div>
                  {svc.tag && <span className="svc-tag">{svc.tag}</span>}
                  <h2>{svc.title}</h2>
                  <p className="svc-item__desc">{svc.desc}</p>
                </div>
              </div>

              <div className="svc-item__body">
                <div className="svc-item__features">
                  <h4>What's included</h4>
                  <ul>
                    {svc.features.map(f => (
                      <li key={f}>
                        <span className="check" aria-hidden="true">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="svc-item__pricing">
                  {svc.pricing ? (
                    <>
                      <h4>Pricing</h4>
                      <div className="pricing-cards">
                        {svc.pricing.map(({ label, price, note }) => (
                          <div key={label} className="pricing-card">
                            <span className="pricing-card__label">{label}</span>
                            <span className="pricing-card__price">{price}</span>
                            <span className="pricing-card__note">{note}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="pricing-quote">
                      {svc.credentials && (
                        <div className="svc-credentials">
                          {svc.credentials.map(({ label, value }) => (
                            <div key={label} className="svc-credential-item">
                              <span className="svc-credential-item__label">{label}</span>
                              <span className="svc-credential-item__value">{value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <h4>Custom Quote</h4>
                      <p>{svc.ctaNote}</p>
                      <Link to="/contact" className="btn btn-outline">
                        Start a Conversation
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Bottom CTA */}
      <section className="section cta-banner-services">
        <div className="container cta-banner-services__inner">
          <h2>Not sure what you need?</h2>
          <p>
            That's fine — just reach out. A free 30-minute conversation is usually
            enough to figure out the best path forward.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/contact" className="btn btn-primary">Get in Touch</Link>
            <a href="tel:+13036537381" className="btn btn-outline">(303) 653-7381</a>
          </div>
        </div>
      </section>

      <ChatbotWidget />
    </>
  )
}
