import React from "react";
import Title from "../components/Title";
import contact from "../assets/asset/contact.jpg";
import NewLetterBox from "../components/NewLetterBox";

function Contact() {
  return (
    <div className="w-[99vw] min-h-screen flex flex-col items-center justify-center bg-gradient-to-l from-[#141414] to-[#0c2025] gap-12 pt-20 px-5 md:px-16 select-none">
      <Title text1={"CONTACT"} text2={"US"} />

      <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-10">
        <div className="lg:w-1/2 w-full flex items-center justify-center">
          <img
            src={contact}
            alt="Contact"
            className="w-4/5 lg:w-7/10 rounded-sm shadow-lg shadow-black transition-transform duration-400 hover:scale-105 hover:shadow-[#21263A]"
          />
        </div>
        {/* // Info Section */}
        <div className="lg:w-1/2 w-10/12 flex flex-col gap-5 mt-5 lg:mt-0">
          <p className="lg:w-4/5 w-full text-white font-bold lg:text-lg text-base leading-relaxed">
            Our Store
          </p>
          <p className="lg:w-4/5 w-full text-white md:text-base text-sm leading-relaxed">
            <span>12345 Random Station</span>
            <br />
            <span>Shahjahanpur, uttar pradesh, India</span>
          </p>
          <p className="lg:w-4/5 w-full text-white md:text-base text-sm leading-relaxed">
            <span>Tel: +91-7651804065</span>
            <br />
            <span>Email: kushagrawasthi37@gmail.com</span>
          </p>
          <p className="lg:w-4/5 w-full text-white font-bold lg:text-lg text-base mt-3">
            Careers at NeuralShop
          </p>
          <p className="lg:w-4/5 w-full text-white md:text-base text-sm leading-relaxed">
            Learn more about our teams and job openings
          </p>
          <button className="px-8 py-4 mt-2 max-w-[350px] text-white bg-transparent border border-gray-400 rounded-md shadow-sm shadow-black transition duration-300 hover:bg-slate-600 active:scale-95">
            Explore Jobs
          </button>
        </div>
      </div>

      <NewLetterBox />
    </div>
  );
}

export default Contact;
