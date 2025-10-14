import Navbar from "./components/Navbar";
import waste from "../../assets/1.png";
import global from "../../assets/2.png";
import commercial from "../../assets/3.png";
import residential from "../../assets/4.png";
import Footer from "./components/Footer";
import ContactForm from "./components/ContactForm";
import WasteManagementStats from "./components/Testimonial";
import WasteSolutions from "./components/Services";

const Home = () => {
  return (
    <>
      <Navbar />
      <div className="overflow-x-hidden w-full">
        <>
          <div
            className="w-full bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 text-gray-900 py-12 lg:py-16 min-h-[60vh] sm:min-h-[70vh] rounded-b-[50px] lg:rounded-b-[100px] flex items-center"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 flex flex-col lg:flex-row items-center justify-between">
              <div className="text-center lg:text-left mb-8 lg:mb-0 lg:w-1/2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 leading-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Smart Waste Management
              </h1>
              <p className="mb-6 text-sm sm:text-base md:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 text-gray-700">
                Achieve zero waste, create maximum impact with <strong className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">ZeroBin</strong>. Transform your waste management experience with intelligent tracking, seamless collection scheduling, and real-time monitoring for a sustainable future.
              </p>
              <button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                Learn More
              </button>
            </div>
              <div className="w-full lg:w-1/2 flex justify-center">
                <img
                  src="https://plus.unsplash.com/premium_photo-1681488048176-1cd684f6be8a?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Garbage Management"
                  className="w-full max-w-md lg:max-w-lg h-auto rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </>
        <section className="waste-management-section py-12 md:py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32">
            <div className="flex flex-col lg:flex-row w-full justify-between items-center gap-8 lg:gap-12">
              <div className="w-full lg:w-1/2">
                <h3 className="text-emerald-600 uppercase font-semibold text-sm sm:text-base">
                  About ZeroBin
                </h3>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold my-4 leading-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Revolutionizing waste management through digital innovation.
                </h2>
                <p className="text-gray-500 mb-8 text-sm sm:text-base leading-relaxed">
                  ZeroBin leverages cutting-edge technology to streamline waste collection and disposal. Our platform connects residents, waste management authorities, and collectors in real-time, ensuring efficient service delivery while promoting environmental sustainability and accountability.
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 h-fit rounded-xl w-full lg:w-auto shadow-lg">
                <p className="text-base sm:text-lg text-gray-700 p-6 sm:p-8 lg:p-10 font-medium text-center lg:text-left">
                  Waste successfully diverted from landfills through smart management.
                </p>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl text-center rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 p-4">
                  412,000+
                </h3>
              </div>
            </div>
            <div className="mt-12 md:mt-16 lg:mt-20">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-12">
                <div className="text-center">
                  <img
                    src={waste}
                    alt="Waste Solutions Icon"
                    className="mx-auto mb-4 w-12 h-12 sm:w-16 sm:h-16"
                  />
                  <h3 className="text-emerald-600 text-lg sm:text-xl font-semibold mb-2">
                    Smart Solutions
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Intelligent waste categorization and collection scheduling tailored to your needs.
                  </p>
                </div>

                <div className="text-center">
                  <img
                    src={global}
                    alt="Global Expertise Icon"
                    className="mx-auto mb-4 w-12 h-12 sm:w-16 sm:h-16"
                  />
                  <h3 className="text-lg sm:text-xl font-semibold text-teal-600 mb-2">
                    Real-Time Tracking
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Monitor your waste collection requests and track collectors in real-time.
                  </p>
                </div>

                <div className="text-center">
                  <img
                    src={commercial}
                    alt="Commercial Use Icon"
                    className="mx-auto mb-4 w-12 h-12 sm:w-16 sm:h-16"
                  />
                  <h3 className="text-lg sm:text-xl font-semibold text-emerald-600 mb-2">
                    Business Integration
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Seamless waste management solutions for commercial establishments and enterprises.
                  </p>
                </div>

                <div className="text-center">
                  <img
                    src={residential}
                    alt="Residential Use Icon"
                    className="mx-auto mb-4 w-12 h-12 sm:w-16 sm:h-16"
                  />
                  <h3 className="text-lg sm:text-xl font-semibold text-teal-600 mb-2">
                    Residential Services
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Easy-to-use platform for households to schedule pickups and manage waste efficiently.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Features Section */}
        <div className="w-full py-8 lg:py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center w-full text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[200px] 2xl:text-[250px] hidden sm:block text-transparent bg-clip-text bg-gradient-to-b from-emerald-600 to-white z-[-2] tracking-tight font-bold animate-fade-up overflow-hidden">
              ZeroBin
            </div>
          </div>
        </div>
        <WasteSolutions />

        {/* Testimonials Section */}
        <WasteManagementStats />

        {/* Contact Section */}
        <ContactForm />
      </div>
      <Footer />
    </>
  );
};

export default Home;
