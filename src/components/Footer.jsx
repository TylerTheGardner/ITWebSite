import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <span aria-hidden="true">⛰️</span> Gold Country <strong>IT</strong>
          </Link>
          <p className="footer__tagline">
            Local tech expertise. Real solutions.<br />
            Serving Cool, CA &amp; Auburn Lake Trails.
          </p>
        </div>

        <div className="footer__cols">
          <div className="footer__col">
            <h4>Services</h4>
            <ul>
              <li><Link to="/services#it-support">IT Support</Link></li>
              <li><Link to="/services#security">Security Audit</Link></li>
              <li><Link to="/services#scam">Scam Prevention</Link></li>
              <li><Link to="/services#software">Custom Software</Link></li>
              <li><Link to="/services#ai">AI Integration</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About Tyler</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/contact">Book a Consultation</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4>Get in Touch</h4>
            <ul>
              <li>
                <a href="mailto:tylerthegardner@gmail.com">
                  tylerthegardner@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+13036537381">(303) 653-7381</a>
              </li>
              <li className="footer__location">
                📍 Cool, CA — Auburn Lake Trails
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container">
          <p>&copy; {year} Gold Country IT. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
