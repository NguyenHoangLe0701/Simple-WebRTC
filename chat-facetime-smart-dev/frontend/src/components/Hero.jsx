
function Hero() {
  return (
    <section className="bg-hero-gradient py-20">
    <div className="mx-auto px-6 md:px-12 max-w-6xl grid md:grid-cols-2 items-center gap-14">
      {/* Left content */}
      <div className="text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-bold text-brand-title mb-6 whitespace-nowrap ">
          Affordable realtime <br /> for React
        </h1>
        <p className="text-xl text-black max-w-xl mb-8">
          Empowering developers of all skill levels to build advanced realtime apps
          without breaking the bank.
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
          <button className="px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primaryHover">
            Try SimpleWebRTC for free
          </button>
        </div>
        <a href="#" className="font-medium text-primary hover:text-black w-96" >
          See pricing calculator »
        </a>
      </div>
  
      {/* Right image */}
      <div className="flex justify-center md:justify-end">
        <img
          src="/images/icons/hero_home.png"
          alt="Hero"
          className="max-xl rounded-xl shadow-lg"
        />
      </div>
    </div>
  </section>
  );
}

export default Hero;
