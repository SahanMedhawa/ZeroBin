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
            className="w-full bg-gradient-to-tr from-green-500 via-green-700 to-green-800 text-white py-12 lg:py-16 min-h-[60vh] sm:min-h-[70vh] rounded-b-[50px] lg:rounded-b-[100px] flex items-center"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 flex flex-col lg:flex-row items-center justify-between">
              <div className="text-center lg:text-left mb-8 lg:mb-0 lg:w-1/2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 leading-tight">
                Digital Garbage Management
              </h1>
              <p className="mb-6 text-sm sm:text-base md:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0">
                We provide innovative solutions to efficiently manage and track
                waste disposal, making our environment cleaner and greener.
              </p>
              <button className="bg-white text-green-600 px-6 py-3 font-semibold rounded-full hover:bg-gray-100 transition-colors duration-300">
                Learn More
              </button>
            </div>
              <div className="w-full lg:w-1/2 flex justify-center">
                <img
                  src="https://plus.unsplash.com/premium_photo-1681488048176-1cd684f6be8a?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Garbage Management"
                  className="w-full max-w-md lg:max-w-lg h-auto rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </>
        <section className="waste-management-section py-12 md:py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32">
            <div className="flex flex-col lg:flex-row w-full justify-between items-center gap-8 lg:gap-12">
              <div className="w-full lg:w-1/2">
                <h3 className="text-green-600 uppercase font-semibold text-sm sm:text-base">
                  About Waste Management
                </h3>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold my-4 leading-tight">
                  We are the leaders in innovative waste management solutions.
                </h2>
                <p className="text-gray-500 mb-8 text-sm sm:text-base leading-relaxed">
                  Managing waste effectively requires comprehensive solutions
                  that adapt to various waste streams and environmental
                  challenges. Our approach focuses on sustainability, maximizing
                  resource recovery, and minimizing environmental impact.
                </p>
              </div>

              <div className="bg-green-50 h-fit rounded-lg w-full lg:w-auto">
                <p className="text-base sm:text-lg text-gray-700 p-6 sm:p-8 lg:p-10 font-medium text-center lg:text-left">
                  Pounds of waste diverted from landfills.
                </p>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl text-center rounded-lg font-bold text-white bg-green-800 p-4">
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
                  <h3 className="text-green-800 text-lg sm:text-xl font-semibold mb-2">
                    Waste Solutions
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Providing tailored solutions for every type of waste,
                    reducing environmental impact.
                  </p>
                </div>

                <div className="text-center">
                  <img
                    src={global}
                    alt="Global Expertise Icon"
                    className="mx-auto mb-4 w-12 h-12 sm:w-16 sm:h-16"
                  />
                  <h3 className="text-lg sm:text-xl font-semibold text-green-800 mb-2">
                    Global Expertise
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    We bring years of global experience to local waste
                    management challenges.
                  </p>
                </div>

                <div className="text-center">
                  <img
                    src={commercial}
                    alt="Commercial Use Icon"
                    className="mx-auto mb-4 w-12 h-12 sm:w-16 sm:h-16"
                  />
                  <h3 className="text-lg sm:text-xl font-semibold text-green-800 mb-2">
                    Commercial Use
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Supporting businesses with sustainable waste disposal and
                    resource recovery services.
                  </p>
                </div>

                <div className="text-center">
                  <img
                    src={residential}
                    alt="Residential Use Icon"
                    className="mx-auto mb-4 w-12 h-12 sm:w-16 sm:h-16"
                  />
                  <h3 className="text-lg sm:text-xl font-semibold text-green-800 mb-2">
                    Residential Use
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Helping households manage waste effectively through
                    convenient recycling and collection.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Features Section */}
        <div className="w-full py-8 lg:py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center w-full text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[200px] 2xl:text-[250px] hidden sm:block text-transparent bg-clip-text bg-gradient-to-b from-green-600 to-white z-[-2] tracking-tight font-bold animate-fade-up overflow-hidden">
              Clean Path
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
