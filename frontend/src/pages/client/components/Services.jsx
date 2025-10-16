import React from "react";

const WasteSolutions = () => {
  const solutions = [
    {
      title: "IoT Smart Bins",
      description:
        "Connect IoT devices to your bins for automatic waste level monitoring and optimized collection scheduling with real-time alerts.",
      image:
        "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Smart waste bin with digital display",
    },
    {
      title: "Service Area Marketplace",
      description:
        "Multiple waste management authorities compete in your area. Choose based on pricing, ratings, and service quality - transparency guaranteed.",
      image:
        "https://images.unsplash.com/photo-1726137569772-791c3b20b4cf?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Digital map showing different pricing zones",
    },
    {
      title: "Authority Dashboard",
      description:
        "Powerful management portal for waste authorities. Register, manage service areas, assign collectors, and track operations seamlessly.",
      image:
        "https://plus.unsplash.com/premium_photo-1663040117567-ab8441cb7b04?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Registration portal interface",
    },
    {
      title: "Live Collector Tracking",
      description:
        "Track your assigned collector's location in real-time. Get accurate ETAs and instant notifications when collection is complete.",
      image:
        "https://plus.unsplash.com/premium_photo-1661963024527-c855211ad31d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Vehicle tracking system interface",
    },
  ];

  return (
    <div className="w-full bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-emerald-600 text-lg uppercase font-semibold tracking-wide mb-">
            ZEROBIN PLATFORM FEATURES
          </h3>
          <h2 className="text-[3.5rem] font-semibold text-gray-900 ">
            Digital Solutions
          </h2>
        </div>
        <div className="mt- text-center mb-10">
          <p className="text-gray-500 max-w-2xl mx-auto">
            Experience next-generation waste management with our integrated digital platform. Connect residents, authorities, and collectors for seamless, transparent, and efficient service delivery.
          </p>
          <button className="mt-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            Explore Features
          </button>
        </div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 hover:transform hover:-translate-y-2"
            >
              <div className="aspect-w-16 aspect-h-12">
                <img
                  src={solution.image}
                  alt={solution.alt}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-emerald-600 mb-2">
                  {solution.title}
                </h3>
                <p className="text-gray-600 text-sm">{solution.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
      </div>
    </div>
  );
};

export default WasteSolutions;
