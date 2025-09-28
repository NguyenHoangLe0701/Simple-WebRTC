import React from "react";
import { Route } from "react-router-dom";
function FAQ() {
  return (
    <div className="container mx-auto px-4 py-12">
      <section className="max-w-3xl mx-auto">
        <h2 className="text-4xl text-gray-900 mb-10 text-center">Frequently Asked Questions</h2>
        
        <div className="space-y-8">
          <div>
            <h4 className="text-3xl font-semibold text-gray-800 mb-2">What happens after I sign up?</h4>
            <p className="text-gray-600 mb-2 text-base">
              You’ll get a key and a link to download our components so that you can start coding right away. We’ll even give you 2 GB free bandwidth so you can test everything out.
            </p>
            <p className="text-gray-600 text-lg">If you love using it, you can pay us.</p>
          </div>

          <div>
            <h4 className="text-3xl font-semibold text-gray-800 mb-2">I don’t want to sign up for anything yet…</h4>
            <p className="text-gray-600 text-lg">
              Don’t! Just try out the modules. We won’t take your credit card, and you still get full use of our service.
            </p>
          </div>

          <div>
            <h4 className="text-3xl font-semibold text-gray-800 mb-2">How many people can I have in SimpleWebRTC chat session?</h4>
            <p className="text-gray-600">
              Our <a href="/pricing" className="text-brand-Blue hover:text-[#0077B6] transition duration-300">small-group plans</a> offer support for up to 6 participants and our <a href="/pricing" className="text-brand-Blue hover:text-[#0077B6] transition duration-300">large-group plans</a> offer support for up to 30.
            </p>
          </div>

          <div>
            <h4 className="text-3xl font-semibold text-gray-800 mb-2">Why are small group plans and large group plans priced differently?</h4>
            <p className="text-gray-600">
              Small groups and large group plans are priced differently because of the way that bandwidth is measured. Our small group plans include a key feature that can only be supported with small groups: end-to-end encryption. 60% - 80% of the sessions on our small group plans run peer-to-peer which means your media streams never touch our servers. We don't charge you anything for peer-to-peer sessions! Large group plans are routed through a server called an SFU (Selective Forwarding Unit) and all streams are metered.
            </p>
          </div>

          <div>
            <h4 className="text-3xl font-semibold text-gray-800 mb-2">Does SimpleWebRTC include recording or broadcasting?</h4>
            <p className="text-gray-600">
              Regular SimpleWebRTC plans do not include recording or broadcasting but we can still help! <a href="/contact" className="text-brand-Blue hover:text-[#0077B6] transition duration-300">Contact us</a> to discuss custom recording and broadcast solutions.
            </p>
          </div>

          <div>
            <h4 className="text-3xl font-semibold text-gray-800 mb-2">Is SimpleWebRTC compatible with mobile platforms?</h4>
            <p className="text-gray-600">
              Yes! Apps built with SimpleWebRTC can be compatible on iOS devices in the Safari browser, and on Android devices in the Chrome and Firefox browsers.
            </p>
          </div>

          <div>
            <h4 className="text-3xl font-semibold text-gray-800 mb-2">Is SimpleWebRTC secure? Can anyone see my streams? What about HIPAA compliance?</h4>
            <p className="text-gray-600">
              Our small group plans are end-to-end encrypted and meet all requirements for HIPAA compliance. All plans are covered by our robust <a href="https://www.simplewebrtc.com/privacy-policy" className="text-brand-Blue hover:text-[#0077B6] transition duration-300" target="_blank" rel="noopener noreferrer">privacy policy.</a> We do not record or view any of the media sent over SimpleWebRTC.
            </p>
          </div>

          <div>
            <h4 className="text-3xl font-semibold text-gray-800 mb-2">Can I depend on this service?</h4>
            <p className="text-gray-600 mb-2">
              We are a privately owned and fully bootstrapped company who’s been around for 11 years. Over six years ago (before any of our competitors were offering WebRTC services) we created the first version of SimpleWebRTC and built <a href="https://talky.io" className="text-brand-Blue hover:text-[#0077B6] transition duration-300" target="_blank" rel="noopener noreferrer">Talky</a>, which is used to make millions of calls. SimpleWebRTC and the underlying open source tools our team has created are used in scores of products in production. We have been continuously improving our platform since we first built it.
            </p>
            <p className="text-gray-600">
              We guarantee 99% uptime. If we fail to meet that standard, we’ll credit your subscription during the month the outage occurred.
            </p>
          </div>

          <div>
            <h4 className="text-3xl font-semibold text-gray-800 mb-2">What if I’d rather have you build it for me? Do you offer custom development services?</h4>
            <p className="text-gray-600">
              Yes, we do! We can build your app from scratch or integrate WebRTC technology into your existing project. <a href="/consulting" className="text-brand-Blue hover:text-[#0077B6] transition duration-300" target="_blank" rel="noopener noreferrer">Read more.</a>
            </p>
          </div>

          <div>
            <h4 className="text-3xl font-semibold text-gray-800 mb-2">I am already using WebRTC. Can you help me even if I am not using SimpleWebRTC?</h4>
            <p className="text-gray-600">
              We offer <a href="/consulting" className="text-brand-Blue hover:text-[#0077B6] transition duration-300" target="_blank" rel="noopener noreferrer">WebRTC consulting and development</a> and can help you with many common realtime woes. <a href="http://andyet.com/webrtc" className="text-brand-Blue hover:text-[#0077B6] transition duration-300" target="_blank" rel="noopener noreferrer">Read more.</a>
            </p>
          </div>

          <div>
            <h4 className="text-3xl font-semibold text-gray-800 mb-2">I still want to explore other options.</h4>
            <p className="text-gray-600 mb-2">
              We encourage you to! Our competitors do great things, and we want you to consider your options before you make a commitment. <strong className="text-gray-800 bg-hero-gradient">We feel confident in the value of SimpleWebRTC because of our transparent pricing model and easy to use React modules.</strong>
            </p>
            <p className="text-gray-600">
              Here are some of the most popular competing services: <a href="https://xirsys.com/" className="text-brand-Blue hover:text-[#0077B6] transition duration-300" target="_blank" rel="noopener noreferrer">Xirsys</a>, <a href="https://www.twilio.com/" className="text-brand-Blue hover:text-[#0077B6] transition duration-300" target="_blank" rel="noopener noreferrer">Twilio</a>, and <a href="https://tokbox.com/" className="text-brand-Blue hover:text-[#0077B6] transition duration-300" target="_blank" rel="noopener noreferrer">Tokbox</a>.
            </p>
            <p className="text-gray-600 italic">* cue elevator music *</p>
          </div>

          <div>
            <h4 className="text-3xl font-semibold text-gray-800 mb-2">Okay, I’m back.</h4>
            <p className="text-gray-600">
              We missed you. <a href="http://accounts.simplewebrtc.com" className="text-brand-Blue hover:text-[#0077B6] transition duration-300" target="_blank" rel="noopener noreferrer">Get started with our free trial</a>.
            </p>
          </div>

          <div>
            <h4 className="text-3xl font-semibold text-gray-800 mb-2">Have questions?</h4>
            <p className="text-gray-600">
              We’re an open book. Email us at <a href="mailto:contact@simplewebrtc.com" className="text-brand-Blue hover:text-[#0077B6] transition duration-300">contact@simplewebrtc.com</a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default FAQ;