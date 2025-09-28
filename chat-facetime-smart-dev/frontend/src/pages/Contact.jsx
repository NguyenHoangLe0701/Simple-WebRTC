import React from "react";
import { Route } from "react-router-dom";
function Contact() {
  return (
    <>
      <div className="container mx-auto px-4 py-16 bg-white">
        <section className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl  text-gray-900 mb-6">Have questions?</h2>
          <p className="text-lg text-gray-600 mb-10 text-left">
            We’d love to hear what you’re working on and how we might be able to help.
          </p>
          <form
            className="contact-form bg-gray-50 p-6 rounded-lg shadow-md"
            action="https://howdy-stage.talky.io/contact/simplewebrtc/main"
            method="post"
            data-hook="howdy-form"
          >
            <input name="success_page" type="hidden" value="thanks" />
            <input name="error_page" type="hidden" value="bademail" />
            <div className="mb-6">
              <label htmlFor="fieldName" className="block text-left text-sm font-medium text-gray-700 mb-2">
                Your Name*
              </label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="fieldName"
                name="name"
                type="text"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="fieldEmail" className="block text-left text-sm font-medium text-gray-700 mb-2">
                Your Email Address*
              </label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="fieldEmail"
                name="email"
                type="email"
                required
                data-listener-added_64969bfa="true"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="fieldCompany" className="block text-left text-sm font-medium text-gray-700 mb-2">
                Your Company*
              </label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="fieldCompany"
                name="company"
                type="text"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="fieldMessage" className="block text-left text-sm font-medium text-gray-700 mb-2">
                How can we help your team?*
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                id="fieldMessage"
                name="message"
                required
              ></textarea>
            </div>
            <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="captcha w-full md:w-auto" data-hook="recaptcha-container" data-sitekey="6Lc_L7YUAAAAACo2_90zlgZjsroXQSavEmR6NRGr">
                <div className="flex items-center">
                  <input type="checkbox" id="recaptcha" className="mr-2" />
                  <label htmlFor="recaptcha" className="text-sm text-gray-700">
                    Tôi không phải là người máy
                  </label>
                </div>
              </div>
              <input
                className="w-60 md:w-auto button border-2 border-brand-Blue hover:border-[#0077B6] bg-white text-brand-Blue font-semibold py-1 px-6 rounded-2xl  transition duration-300 disabled:opacity-50"
                type="submit"
                value="Send"
                disabled
              />
            </div>
            <input type="hidden" name="source" value="https://www.simplewebrtc.com/contact" />
            <input type="hidden" name="referer" value="https://www.simplewebrtc.com/newsletter" />
          </form>
        </section>
      </div>
    </>
  );
}

export default Contact;