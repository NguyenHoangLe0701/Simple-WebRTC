import React from "react";
import { Route } from "react-router-dom";

function Consulting() {
  return (
    <div className="container  mx-auto px-4 py-12">
      
     {/* Intro Section */}
     <section className="intro text-center mb-12">
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-24rem)]">
          <h2 className="text-[40px] text-gray-900 mb-6">
            We want to help you accelerate your progress with our fast-to-market realtime solutions.
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Whether you are starting from scratch, have a demo, or have already started building your application, we can help bring your vision to life—sooner.
          </p>
          <div className="w-96 mx-auto h-1 bg-hero-gradient"  />
        </div>
      </section>


      {/* Service Section */}
      <section className="center mb-12">
        <div className="service-item">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <img
                className="illo mx-auto mb-4 w-24 h-24 object-contain"
                src="/images/icons/blue_ship.svg"
                alt="WebRTC Integration"
              />
              <h3 className="text-xl font-semibold text-gray-800">WebRTC <br />Integration</h3>
            </div>
            <div className="text-center">
              <img
                className="illo mx-auto mb-4 w-24 h-24 object-contain"
                src="/images/icons/pink_map.svg"
                alt="Application Assessment"
              />
              <h3 className="text-xl font-semibold text-gray-800">Application <br />Assessment</h3>
            </div>
            <div className="text-center">
              <img
                className="illo mx-auto mb-4 w-24 h-24 object-contain"
                src="/images/icons/purple_computer.svg"
                alt="Custom Development"
              />
              <h3 className="text-xl font-semibold text-gray-800">Custom <br />Development</h3>
            </div>
            <div className="text-center">
              <img
                className="illo mx-auto mb-4 w-24 h-24 object-contain"
                src="/images/icons/pink_chat.svg"
                alt="WebRTC Testing"
              />
              <h3 className="text-xl font-semibold text-gray-800">WebRTC <br />Testing</h3>
            </div>
          </div>
        </div>
        <h3 className="text-3xl font-semibold text-gray-800 text-center mb-4 mt-20">
          We’re here to make WebRTC pain-free.
        </h3>
        <p className="text-lg text-gray-600 text-center mb-10 mt-10">
          We’d like to hear about your project and see how we can help.
        </p>
        <div className="text-center mb-28">
          <a
            href="#form"
            className="button mx-auto inline-block bg-primary text-xl text-white font-semibold py-3 px-10 rounded-3xl hover:bg-primaryHover transition duration-300 text-center"
          >
            Get in touch
          </a>
        </div>
        <hr className=" w-1/2 mx-auto h-1 bg-hero-gradient" />
      </section>

      {/* Portfolio Section */}
      <section className="mb-12">
        <h3 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Some of our work</h3>
        <div className="portfolio-section flex flex-col gap-12">
          <div className="portfolio-item flex flex-col items-center">
            <img
              src="/images/icons/web-talky-2018-2.jpg"
              alt="Talky"
              className="w-[678px] h-[422px] object-fit rounded-lg" // Tăng kích thước: w-128 (512px), h-96 (384px)
            />
            <small className="caption block text-sm text-gray-600 mt-4 text-center">
              <a
                href="//talky.io"
                className="text-brand-Blue hover:text-[#0077B6] transition duration-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                Talky
              </a>{" "}
              is a truly simple video chat and screen sharing application.
            </small>
          </div>
          <div className="portfolio-item flex flex-col items-center">
            <img
              src="/images/icons/web-tutoring.jpg"
              alt="Web Tutoring"
              className="w-[678px] h-[422px] object-fit rounded-lg"
            />
            <small className="caption block text-sm text-gray-600 mt-5 text-center">
              A web tutoring app including scheduling, text and video chat, and screensharing.
            </small>
          </div>
          <div className="portfolio-item flex flex-col items-center">
            <img
              src="/images/icons/web-shippy.jpg"
              alt="Shippy"
              className="w-[678px] h-[422px] object-fit rounded-lg"
              data-first-enter-image="true"
            />
            <small className=" mx-auto caption block text-sm text-gray-600 mt-4 text-center">
              Shippy was a team collaboration tool featuring group chat, direct messaging, task delegation, and project management.
            </small>
          </div>
        </div>
        <hr className=" w-1/2 mx-auto h-1 bg-hero-gradient mt-20" />
      </section>

      {/* Form Section */}
      <section id="form" className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Get in touch</h2>
        <p className="text-lg text-gray-600 mb-6">We’d love to hear what you’re working on!</p>
        <div
          className="pipedriveWebForms"
          data-pd-webforms="https://pipedrivewebforms.com/form/c2e78b00792cef1ea3f58d03de8394746287211"
          data-script-id="id9iwn1i"
          id="idg4hmsb"
        >
          <script src="https://cdn.pipedriveassets.com/web-form-assets/webforms.min.js"></script>
          <script src="https://webforms.pipedrive.com/f/loader"></script>
          <iframe
            src="https://pipedrivewebforms.com/form/c2e78b00792cef1ea3f58d03de8394746287211?embeded=1&amp;uuid=idg4hmsb"
            name="https://www.simplewebrtc.com/consulting-idg4hmsb"
            scrolling="no"
            title="Web Forms"
            className="w-full h-96 border-0"
          ></iframe>
        </div>
      </section>
    </div>
  );
}

export default Consulting;