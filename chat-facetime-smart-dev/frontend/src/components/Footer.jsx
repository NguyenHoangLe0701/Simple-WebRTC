
function Footer() {
    return (
      <footer className="bg-white text-gray-600 py-6">
        <div className="container mx-auto text-center">
          {/* Navigation links */}
          <nav className="mb-4">
            <ul className="flex flex-wrap justify-center gap-4 text-sm">
              <li><a href="/consulting" className="hover:text-pink-600">Consulting</a></li>
              <li><a href="/pricing" className="hover:text-pink-600">Pricing</a></li>
              <li><a href="/faq" className="hover:text-pink-600">FAQ</a></li>
              <li><a href="http://docs.simplewebrtc.com" className="hover:text-pink-600">Docs</a></li>
              <li><a href="/newsletter" className="hover:text-pink-600">Newsletter</a></li>
              <li><a href="/contact" className="hover:text-pink-600">Contact</a></li>
            </ul>
            <ul className="flex justify-center gap-4 text-sm mt-2">
              <li><a href="/terms-of-service" className="hover:text-pink-600">Terms of Service</a></li>
              <li><a href="/privacy-policy" className="hover:text-pink-600">Privacy Policy</a></li>
            </ul>
          </nav>
  
          {/* Logo + Byline */}
          <div className="mt-6">
            <a href="https://about.talky.io/team" className="flex justify-center mb-2">
              <span className="w-6 h-6 bg-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                ▶
              </span>
            </a>
            <p className="text-xs">
              <a href="https://about.talky.io/team" className="hover:text-pink-600">
                SimpleWebRTC is a product of Talky, inc.
              </a>
            </p>
          </div>
        </div>
      </footer>
    );
  }
  
  export default Footer;
  