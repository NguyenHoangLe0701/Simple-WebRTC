import React from "react";

function SectionCallToAction() {
  return (
    <div className="container mx-auto px-4 py-12 text-center bg-hero-gradient">
      <section>
        <h2 className="text-3xl  text-primary mb-4">Ready to get started?</h2>
        <p className="text-lg text-primary mb-10 mt-8">No credit card needed. Your first 2 GB is on us.</p>
        <a
          href="http://accounts.simplewebrtc.com"
          className="mb-20 button button-large button-cta inline-block bg-primary text-white font-semibold py-3 px-10 rounded-3xl hover:bg-primaryHover transition duration-300 "
        >
          Sign up now
        </a>
      </section>
    </div>
  );
}

export default SectionCallToAction;