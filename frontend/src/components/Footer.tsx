import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

export function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-grid">
        {/* Brand */}
        <div>
          <div className="footer-brand">
            <span className="text-2xl">🍔</span>
            <span>Zomato</span>
          </div>
          <p className="footer-desc">
            Discover the best restaurants near you and order delicious food online with fast
            delivery.
          </p>
          <div className="footer-social">
            <a href="#" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
              <FaFacebookF size={16} />
            </a>
            <a href="#" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
              <FaTwitter size={16} />
            </a>
            <a href="#" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <FaInstagram size={16} />
            </a>
            <a href="#" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
              <FaLinkedinIn size={16} />
            </a>
          </div>
        </div>

        {/* Links */}
        <div>
          <h3 className="footer-heading">Company</h3>
          <ul className="footer-links">
            <li>
              <a href="#">About Us</a>
            </li>
            <li>
              <a href="#">Careers</a>
            </li>
            <li>
              <a href="#">Blog</a>
            </li>
            <li>
              <a href="#">Press</a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="footer-heading">Support</h3>
          <ul className="footer-links">
            <li>
              <a href="#">Help Center</a>
            </li>
            <li>
              <a href="#">Terms of Service</a>
            </li>
            <li>
              <a href="#">Privacy Policy</a>
            </li>
            <li>
              <a href="#">Contact Us</a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="footer-heading">Partner</h3>
          <ul className="footer-links">
            <li>
              <a href="#">Add Restaurant</a>
            </li>
            <li>
              <a href="#">Partner App</a>
            </li>
            <li>
              <a href="#">For Enterprise</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Zomato Clone. All rights reserved.</p>
      </div>
    </footer>
  );
}

