import React from "react";

const AboutPage = () => {
  return (
    <div className="bg-white text-gray-800">
      {/* Hero Section */}
      <section className="text-center py-16 bg-[#d6f0ff]">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          We’re making a difference <br /> to people’s lives
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Providing trusted service providers like cleaners, cooks, and nannies
          to make life easier and stress-free for families and businesses.
        </p>
        <div className="mt-8">
          <img
            src="workers.png" // replace with your image
            alt="Our Team"
            className="mx-auto rounded-2xl shadow-md max-h-[400px] object-cover"
          />
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-2xl font-bold mb-4">Our mission</h2>
          <p className="text-gray-600 mb-4">
            Our mission is to connect families and businesses with trusted and
            skilled service providers. Whether it’s home cleaning, cooking, or
            childcare, we aim to make everyday life smoother.
          </p>
          <p className="text-gray-600">
            We believe in professionalism, reliability, and making life stress-free
            for our clients.
          </p>
        </div>
        <div>
          <img
            src="mission.jpg" // replace with your image
            alt="Our mission"
            className="rounded-2xl shadow-md"
          />
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="bg-yellow-100 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center md:text-left">
          <h2 className="text-2xl font-bold mb-6">Who we are & how we arrived here</h2>
          <p className="text-gray-700 mb-4">
            Founded in 2025, ServEaso was built to make everyday life easier for
            families and businesses. We realized how difficult it was for people
            to find trusted and reliable service providers.
          </p>
          <p className="text-gray-700 mb-4">
            Our platform connects skilled professionals with those who need them,
            offering reliable, affordable, and timely services.
          </p>
          <p className="text-gray-700">
            Today, we are proud to serve hundreds of families and businesses while
            expanding our team of professionals every day.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-orange-500 text-white text-center">
        <h2 className="text-2xl font-bold mb-6">We’re here, there, everywhere</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {["John", "Sara", "Kenio", "Miguel", "Sierra", "Evelyn"].map(
            (name, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center bg-white text-gray-800 px-4 py-6 rounded-xl shadow-md w-32"
              >
                <img
                  src={`https://i.pravatar.cc/100?img=${idx + 1}`}
                  alt={name}
                  className="w-16 h-16 rounded-full mb-3"
                />
                <p className="font-medium">{name}</p>
              </div>
            )
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 max-w-5xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-center mb-8">
          Got any questions? We have got answers.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">How do I book a service?</h3>
            <p className="text-gray-600 mb-4">
              Simply sign up, choose the service you need, and schedule at your
              convenience.
            </p>
            <h3 className="font-semibold mb-2">Are the providers verified?</h3>
            <p className="text-gray-600">
              Yes, all our service providers go through strict verification and
              background checks.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Do you offer support?</h3>
            <p className="text-gray-600 mb-4">
              Yes, we provide customer support for all bookings to ensure a smooth
              experience.
            </p>
            <h3 className="font-semibold mb-2">Where are you located?</h3>
            <p className="text-gray-600">
              We currently serve customers in India and USA with plans to expand
              further.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-[#d6f0ff] text-center">
        <h2 className="text-2xl font-bold mb-4">
          Become a ServEaso member like you want!
        </h2>
        <p className="text-gray-700 max-w-2xl mx-auto mb-8">
          Join our growing community of satisfied customers and trusted
          professionals. Sign up today to experience stress-free services at your
          convenience.
        </p>
        <button className="bg-orange-500 text-white px-6 py-3 rounded-xl shadow-md hover:bg-orange-600">
          Join Now
        </button>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t text-center text-sm text-gray-600">
        ©2025 <span className="font-semibold">ServEaso</span>. All rights reserved.
      </footer>
    </div>
  );
};

export default AboutPage;
