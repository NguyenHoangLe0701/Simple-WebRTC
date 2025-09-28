import React from 'react';

function SectionPricing() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-4xl  text-center mb-6">And here’s what you get:</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        <div className="flex items-center">
          <img src="/images/icons/hand.svg" alt="Pricing" className="w-12 h-12 mr-4" />
          <p className="mb-0 text-base">Pricing that lets you control long-term costs as you scale</p>
        </div>
        <div className="flex items-center">
          <img src="/images/icons/group.svg" alt="Users" className="w-12 h-12 mr-4" />
          <p className="mb-0 text-base">Up to 30<sup className="text-xs align-top">†</sup> users concurrently streaming per active conversation</p>
        </div>
        <div className="flex items-center">
          <img src="/images/icons/pink_map.svg" alt="React" className="w-12 h-12 mr-4" />
          <p className="mb-0 text-base">Easy to use React modules</p>
        </div>
        <div className="flex items-center">
          <img src="/images/icons/pink_chat.svg" alt="Rooms" className="w-12 h-12 mr-4" />
          <p className="mb-0 text-base">Unlimited rooms</p>
        </div>
        <div className="flex items-center">
          <img src="/images/icons/icon-notification.svg" alt="Video" className="w-12 h-12 mr-4" />
          <p className="mb-0 text-base">Video, voice, text, and screen sharing<sup>**</sup></p>
        </div>
        <div className="flex items-center">
          <img src="/images/icons/rocket.svg" alt="Hosted" className="w-12 h-12 mr-4" />
          <p className="mb-0 text-base">Fully hosted solution</p>
        </div>
        <div className="flex items-center">
          <img src="/images/icons/computer.svg" alt="No Install" className="w-12 h-12 mr-4" />
          <p className="mb-0 text-base">No installation needed (works right in your browser)</p>
        </div>
        <div className="flex items-center">
          <img src="/images/icons/lock.svg" alt="Encryption" className="w-12 h-12 mr-4" />
          <p className="mb-0 text-base">End-to-end encryption<sup>*</sup></p>
        </div>
      </div>
      <p className=" max-w-prose ml-96 text-sm text-gray-500   text-left mt-8">
        † requires large group subscription<br />
        * requires small group subscription<br />
        ** Screen sharing available in Chrome and Firefox
      </p>
    </div>
  );
}

export default SectionPricing;