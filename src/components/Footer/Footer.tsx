import React from 'react';
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <h3 className="footer-logo"><b>ServEaso</b></h3>
      <div className="social-media">
  {/* <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
    <FaXTwitter size={30} className="twitter" />
  </a> */}
  <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
    <FaInstagram size={30} className="instagram" />
  </a>
  <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">
    <FaYoutube size={30} className="youtube" />
  </a>
  <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
    <FaLinkedin size={30} className="linkedin" />
  </a>
  <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
    <FaFacebook size={30} className="facebook" />
  </a>
</div>
    </footer>
  );
};

export default Footer;