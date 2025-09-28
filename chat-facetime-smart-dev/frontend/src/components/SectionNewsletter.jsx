import React from "react";

function SectionNewsletter() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl" style={{ marginTop: "40px" }}>
      <section id="newsletter" className="text-center">
        <figure className="section-icon mb-6">
          <img src="/images/icons/icon-tada.jpg" alt="A party popper" className="mx-auto max-w-52 h-32" />
        </figure>
        <h3 className="text-3xl  text-brand-title mb-4">
          In our newsletter, we’ll tell you for free what we tell people in $10k consulting engagements
        </h3>
        <p className="text-lg text-gray-700 mb-6 text-left mt-10">
          We’re committed to helping you make a good business decision with WebRTC, whether you choose to use
          SimpleWebRTC or not. Unsubscribe as soon as it’s not useful to you.
        </p>
        <form
          className="validate contact-form cf"
          id="mc-embedded-subscribe-form"
          action="https://andyet.us9.list-manage.com/subscribe/post?u=faa323952110d5be6830f05f5&id=6428bca796"
          method="post"
          name="mc-embedded-subscribe-form"
          target="_blank"
          noValidate
          style={{ maxWidth: "400px", margin: "0 auto 30px auto" }}
        >
          <input name="success_page" type="hidden" value="thanks" />
          <input name="error_page" type="hidden" value="bademail" />
          <div className="form-element"></div>
          <input
            className="required email form-input tc w-full p-2 border rounded mb-4 text-center"
            id="mce-EMAIL"
            type="email"
            value=""
            name="EMAIL"
            required
            placeholder="Email address"
            aria-required="true"
          />
          <div className="clear" id="mce-responses">
            <div className="response" id="mce-error-response" style={{ display: "none" }}></div>
            <div className="response" id="mce-success-response" style={{ display: "none" }}></div>
          </div>
          <div style={{ position: "absolute", left: "-5000px" }} aria-hidden="true">
            <input type="text" name="b_faa323952110d5be6830f05f5_6428bca796" tabIndex="-1" value="" />
          </div>
          <div className="clear"></div>
          <div className="form-element tc">
            <input
              className="tc button button-large bg-[#00b0eb] text-white text-lg font-semibold py-3 px-12 rounded-3xl hover:bg-[#0077B6] transition duration-300"
              id="mc-embedded-subscribe"
              type="submit"
              value="Join our mailing list"
              name="subscribe"
            />
          </div>
        </form>
      </section>
       
    </div>

    
  );
}

export default SectionNewsletter;