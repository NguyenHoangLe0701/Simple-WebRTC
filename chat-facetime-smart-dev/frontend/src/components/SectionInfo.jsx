import React from 'react'

function SectionInfo() {
  return (
    <section className="w-full flex flex-col items-center justify-center px-4 py-12">
      <img
        src="/images/icons/info-home.png"
        alt="Info"
        className="max-w-[600px] w-full h-auto mb-6"
      />
      <div className="text-center max-w-[600px]">
        <h2 className="text-3xl md:text-4xl  text-black mb-8">
          We want to eliminate painpoints, so you can focus on your product.
        </h2>
        <p className="text-gray-800 text-lg md:text-base mb-6 text-left">
          You can build fun demo-ware with open source tools. But then there’s
          the laundry list of complexities and edge-cases involved in making
          your service production quality.
        </p>
        <a
          href="/pricing"
          className="inline-block rounded-full bg-primary px-8 py-3 font-semibold text-white text-xl hover:bg-primaryHover transition w-full"
        >
          See Pricing
        </a>
      </div>
    </section>
  );
}

export default SectionInfo;
