import React from "react";

function Features() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        {/* Title */}
        <h2 className="text-2xl md:text-4xl font-semibold text-center text-gray-900 max-w-3xl mx-auto leading-snug">
          Easy, fun, and cost-effective way for devs of all skill levels to
          build advanced realtime apps with React
        </h2>

        {/* Features grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-10 max-w-xl mx-auto">
          {/* Feature 1 */}
          <div className="flex flex-col items-center text-center">
            <img
              src="/images/icons/reactChat.svg"
              alt="React modules"
              className="w-18 h-18 mb-3"
            />
            <p className="text-gray-600 text-lg">React based modules</p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col items-center text-center">
            <img
              src="/images/icons/lock.svg"
              alt="HIPAA compliant"
              className="w-18 h-18 mb-3"
            />
            <p className="text-gray-600 text-lg">HIPAA compliant*</p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col items-center text-center">
            <img
              src="/images/icons/hand.svg"
              alt="Customizable pricing"
              className="w-18 h-18 mb-3"
            />
            <p className="text-gray-600 text-lg">
              Customizable pricing that <br /> grows as you scale
            </p>
          </div>

          {/* Feature 4 */}
          <div className="flex flex-col items-center text-center">
            <img
              src="/images/icons/chat-bubble.svg"
              alt="Video, voice, text"
              className="w-18 h-18 mb-3"
            />
            <p className="text-gray-600 text-lg">
              Video, voice, text and screen sharing
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Features;
