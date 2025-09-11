function Hero() {
  return (
    <section className="flex flex-col items-center justify-center text-center py-20 bg-gradient-to-r from-pink-100 to-blue-100">
      <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
        Affordable realtime <br /> for React
      </h2>
      <p className="text-lg text-gray-600 max-w-xl mb-8">
        Empowering developers of all skill levels to build advanced realtime apps
        without breaking the bank.
      </p>
      <button className="px-6 py-3 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700">
        Try SimpleWebRTC for free
      </button>
    </section>
  );
}

export default Hero;