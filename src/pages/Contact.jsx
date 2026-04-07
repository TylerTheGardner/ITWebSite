import { useState } from 'react'
import ChatbotWidget from '../components/ChatbotWidget'
import './Contact.css'

const serviceOptions = [
  'IT Support & Troubleshooting',
  'Security Audit',
  'Spam & Scam Prevention',
  'Custom Software Development',
  'AI Integration & Consulting',
  'Not sure — help me figure it out',
]

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  })
  const [status, setStatus] = useState(null) // null | 'sending' | 'success' | 'error'
  const [errors, setErrors] = useState({})

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: null }))
    }
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.message.trim()) errs.message = 'Please describe what you need help with'
    return errs
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setStatus('sending')

    // Using mailto fallback until a form backend is configured.
    // To wire up a real backend, replace this block with a fetch() to
    // your preferred service (Formspree, EmailJS, a serverless function, etc.)
    const subject = encodeURIComponent(`Gold Country IT Inquiry — ${form.service || 'General'}`)
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nService: ${form.service}\n\nMessage:\n${form.message}`
    )
    window.location.href = `mailto:tylerthegardner@gmail.com?subject=${subject}&body=${body}`
    setStatus('success')
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="section-label">Let's Talk</span>
          <h1>Get in Touch</h1>
          <p className="page-hero__sub">
            Free 30-minute consultation — remote or in person, no obligation.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container contact-layout">

          {/* Form */}
          <div className="contact-form-wrap">
            <h2>Send a Message</h2>
            <p className="contact-form-sub">
              Fill out the form and I'll get back to you within one business day.
            </p>

            {status === 'success' ? (
              <div className="contact-success">
                <span className="contact-success__icon">✅</span>
                <h3>Thanks! Your message is on its way.</h3>
                <p>
                  I'll respond within one business day. For urgent issues, call or
                  text me directly at{' '}
                  <a href="tel:+13036537381">(303) 653-7381</a>.
                </p>
                <button className="btn btn-outline" onClick={() => { setStatus(null); setForm({ name:'', email:'', phone:'', service:'', message:'' }) }}>
                  Send Another
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Jane Smith"
                      required
                      aria-invalid={!!errors.name}
                    />
                    {errors.name && <span className="form-error" role="alert">{errors.name}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="jane@example.com"
                      required
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && <span className="form-error" role="alert">{errors.email}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="(530) 555-1234"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="service">Service Interested In</label>
                    <select
                      id="service"
                      name="service"
                      value={form.service}
                      onChange={handleChange}
                    >
                      <option value="">Select a service…</option>
                      {serviceOptions.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Tell Me What's Going On *</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Describe your situation, question, or project idea…"
                    required
                    aria-invalid={!!errors.message}
                  />
                  {errors.message && <span className="form-error" role="alert">{errors.message}</span>}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div className="contact-sidebar">
            <div className="contact-info card">
              <h3>Contact Info</h3>
              <ul className="contact-info__list">
                <li>
                  <span className="contact-info__icon">📧</span>
                  <div>
                    <strong>Email</strong>
                    <a href="mailto:tylerthegardner@gmail.com">
                      tylerthegardner@gmail.com
                    </a>
                  </div>
                </li>
                <li>
                  <span className="contact-info__icon">📱</span>
                  <div>
                    <strong>Phone / Text</strong>
                    <a href="tel:+13036537381">(303) 653-7381</a>
                  </div>
                </li>
                <li>
                  <span className="contact-info__icon">📍</span>
                  <div>
                    <strong>Location</strong>
                    <span>Cool, CA — Auburn Lake Trails</span>
                  </div>
                </li>
                <li>
                  <span className="contact-info__icon">🕐</span>
                  <div>
                    <strong>Response Time</strong>
                    <span>Within 1 business day</span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="contact-consult card">
              <span className="contact-consult__badge">Free</span>
              <h3>30-Minute Consultation</h3>
              <p>
                Not sure what you need? Let's hop on a call. No sales pitch —
                just an honest conversation about your situation.
              </p>
              <p className="contact-consult__note">
                📅 Scheduling tool coming soon — in the meantime, email or call
                to set a time.
              </p>
            </div>

            <div className="contact-service-area card">
              <h3>Service Area</h3>
              <p>
                Based in Auburn Lake Trails, serving Cool, CA and surrounding
                Gold Country communities. Remote support available anywhere.
              </p>
              <ul>
                <li>✓ Cool / Auburn Lake Trails</li>
                <li>✓ Auburn</li>
                <li>✓ Placerville</li>
                <li>✓ El Dorado Hills</li>
                <li>✓ Remote support — anywhere</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <ChatbotWidget />
    </>
  )
}
