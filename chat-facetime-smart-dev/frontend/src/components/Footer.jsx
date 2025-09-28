
function Footer() {
    return (
      <>
     <div className="w-full h-1 bg-hero-gradient" />
      <footer className="bg-white text-gray-600 py-6">
        <div className="container mx-auto text-center">
          {/* Navigation links */}
          <nav className="mb-4">
            <ul className="flex flex-wrap justify-center gap-4 text-lg">
              <li><a href="/consulting" className="hover:text-brand-Blue">Consulting</a></li>
              <li><a href="/pricing" className="hover:text-brand-Blue">Pricing</a></li>
              <li><a href="/faq" className="hover:text-brand-Blue">FAQ</a></li>
              <li><a href="http://docs.simplewebrtc.com" className="hover:text-brand-Blue">Docs</a></li>
              <li><a href="/newsletter" className="hover:text-brand-Blue">Newsletter</a></li>
              <li><a href="/contact" className="hover:text-brand-Blue">Contact</a></li>
            </ul>
            <ul className="flex justify-center gap-4 text-lg mt-5">
              <li><a href="/terms-of-service" className="hover:text-brand-Blue">Terms of Service</a></li>
              <li><a href="/privacy-policy" className="hover:text-brand-Blue">Privacy Policy</a></li>
            </ul>
          </nav>

          {/* Logo + Byline */}
          <div className="mt-6">
            <a href="https://about.talky.io/team" className="flex justify-center mb-2">
              <img src="images/icons/logo-talky-mark.svg" alt="logo_footer" className="w-16 h-8 mt-5 mb-5" />
            </a>
            <p className="text-lg">
              <a href="https://about.talky.io/team" className="hover:text-brand-Blue">
                SimpleWebRTC is a product of Talky, inc.
              </a>
            </p>
          </div>
        </div>
      </footer>
    </>
      
    );
  }
  
  export default Footer;
  