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
    desc: 'Most small businesses and homes have security gaps they don\'t know about until it\'s too late. I\'ll review your network, devices, accounts, and software — then give you a clear action plan to close those gaps before someone exploits them.',
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
    desc: 'Scam calls, phishing emails, and spam texts are a growing problem — especially for seniors and small businesses. I\'ll set up filters, blockers, and smart habits to dramatically reduce the noise and protect you from costly mistakes.',
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
    desc: 'Off-the-shelf software never quite fits. I build custom websites, booking systems, inventory tools, customer portals, and automation scripts tailored exactly to how your business works — not the other way around.',
    features: [
      'Business websites & landing pages',
      'Online booking & scheduling systems',
      'Customer-facing portals & dashboards',
      'Inventory & order management tools',
      'Process automation & integrations',
      'Ongoing maintenance & support',
    ],
    pricing: null,
    ctaNote: 'Every project is unique. Contact me for a free scoping conversation and quote.',
  },
  {
    id: 'ai',
    icon: '🤖',
    title: 'AI Integration & Consulting',
    desc: 'AI tools are transforming how businesses operate — but knowing which ones to use and how to implement them is the hard part. With deep expertise in AI platforms and tools, I help local businesses identify real opportunities and put them into practice.',
    features: [
      'AI readiness assessment',
      'Tool selection & vendor evaluation',
      'Chatbot & virtual assistant setup',
      'Workflow automation with AI',
      'Staff training & adoption support',
      'Custom AI agent development',
    ],
    pricing: null,
    ctaNote: 'AI solutions are scoped to your specific needs. Let\'s talk about what\'s possible for your business.',
  },
]

export default function Services() {
  return (
    <>
      {/* Page header */}
      <section className="page-hero">
        <div className="container">
          <span className="section-label">What We Offer</span>
          <h1>Services &amp; Pricing</h1>
          <p className="page-hero__sub">
            Transparent pricing on the services that fit a fixed scope.
            Custom projects are quoted after a free consultation.
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
                      <span className="pricing-quote__icon">💬</span>
                      <h4>Custom Quote</h4>
                      <p>{svc.ctaNote}</p>
                      <Link to="/contact" className="btn btn-outline">
                        Get a Free Quote
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
          <h2>Not sure which service you need?</h2>
          <p>
            Just reach out. A free 30-minute consultation will help us figure out
            exactly what will make the biggest difference for you.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/contact" className="btn btn-primary">Book a Free Consultation</Link>
            <a href="tel:+13036537381" className="btn btn-outline">(303) 653-7381</a>
          </div>
        </div>
      </section>

      <ChatbotWidget />
    </>
  )
}
