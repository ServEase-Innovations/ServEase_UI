import React from "react";

interface AboutPageProps {
  onBack: () => void;
}

const teamMembers = [
  {
    name: "David Kivitz",
    role: "CEO",
    img: "https://via.placeholder.com/100",
    desc: "As head of the company, my job is to ensure everyone",
  },
  {
    name: "Antony Radbod",
    role: "CFO",
    img: "https://via.placeholder.com/100",
    desc: "As head of the company, my job is to ensure everyone",
  },
  {
    name: "Justin Vuong",
    role: "CIO",
    img: "https://via.placeholder.com/100",
    desc: "As head of the company, my job is to ensure everyone",
  },
  {
    name: "Jim Bates",
    role: "Director of Credit & Risk",
    img: "https://via.placeholder.com/100",
    desc: "As head of the company, my job is to ensure everyone",
  },
];

const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  return (
    <div className="font-sans text-gray-800">
      {/* Back Button */}
      <div className="p-4 bg-gray-100">
        <button 
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <span className="mr-2">←</span> Back to Home
        </button>
      </div>

      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center text-white"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?fit=crop&w=1600&q=80')",
        }}
      >
        <div className="bg-black bg-opacity-50 p-16">
          <h1 className="text-4xl font-bold">About Us</h1>
          <p className="mt-4 max-w-2xl">
            We are <strong>ServEaso</strong> – a house helps service provider.
            "ServEaso" collectively means "Service Made Easy" or "Easy Services."
            We simplify the process of connecting customers who need home
            services with reliable and verified professionals.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 px-8 text-center bg-gray-50">
        <h2 className="text-3xl font-bold mb-10">Our Story</h2>
        <div className="max-w-5xl mx-auto text-left text-gray-700 space-y-6">
          <p>
            ServEaso provides trained and verified house helps to simplify the
            lives of individuals and families who struggle to balance their
            professional commitments with household responsibilities.
          </p>
          <p>
            ServEaso offers a convenient and reliable solution for those in need
            of house care services, ensuring peace of mind and quality care for
            customers.
          </p>
          <h3 className="text-xl font-semibold mt-8 mb-4">
            Challenges We Solve
          </h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>High Turnover:</strong> Difficulty in retaining house helps
              due to factors like demanding work conditions, low wages, or lack
              of work-life balance.
            </li>
            <li>
              <strong>Skills Gap:</strong> Lack of necessary skills or training
              for specific tasks, leading to subpar performance or safety
              concerns.
            </li>
            <li>
              <strong>Communication Barriers:</strong> Language or cultural
              differences hindering effective communication.
            </li>
            <li>
              <strong>Trust and Security:</strong> Concerns about theft, privacy
              violations, or family safety.
            </li>
            <li>
              <strong>Dependence and Entitlement:</strong> Overreliance on
              employers, reducing household independence.
            </li>
            <li>
              <strong>Lack of Legal Protection:</strong> Exploitation due to
              unclear legal frameworks or poor enforcement.
            </li>
            <li>
              <strong>Social Isolation:</strong> Loneliness from living away
              from families and communities.
            </li>
            <li>
              <strong>Employer-Maid Relationship Dynamics:</strong> Difficulty in
              building respectful, trust-based relationships.
            </li>
            <li>
              <strong>Limited Access to Healthcare:</strong> Lack of affordable
              healthcare or insurance coverage.
            </li>
            <li>
              <strong>Lack of Standardized Practices:</strong> No clear
              guidelines for hiring, training, and managing domestic workers.
            </li>
          </ul>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-8 text-center">
        <h2 className="text-3xl font-bold mb-10">Meet Our Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {teamMembers.map((member, idx) => (
            <div
              key={idx}
              className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition"
            >
              <img
                src={member.img}
                alt={member.name}
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
              />
              <h4 className="text-lg font-semibold">{member.name}</h4>
              <p className="text-sm text-gray-500">{member.role}</p>
              <p className="mt-2 text-sm text-gray-600">{member.desc}</p>
              <a
                href="#!"
                className="text-blue-600 text-sm mt-3 inline-block hover:underline"
              >
                Read More
              </a>
              <div className="mt-2">
                <a href="#!" className="text-blue-700 text-sm">
                  LinkedIn
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutPage;