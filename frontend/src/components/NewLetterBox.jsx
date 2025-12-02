import React from "react";

function NewLetterBox() {
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div
      className="
      w-full py-16 px-6 md:px-16 
      bg-[#0c2025] select-none
      flex flex-col items-center gap-6
    "
    >
      <p className="text-[20px] md:text-[30px] text-[#a5faf7] font-semibold text-center">
        Subscribe now & get 20% off
      </p>

      <p
        className="
        text-[14px] md:text-lg text-blue-200 text-center 
        max-w-2xl leading-relaxed
      "
      >
        Stay updated with exclusive offers, early product drops, and
        personalized recommendations.
      </p>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl flex flex-col md:flex-row items-center gap-4"
      >
        <input
          type="email"
          required
          placeholder="Enter Your Email"
          className="
            w-full md:flex-1 h-12 px-5 rounded-lg
            bg-[#072125] border border-[#2dd4bf]/40
            text-white placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-[#2dd4bf]/70
            transition hover:shadow-[0_0_12px_rgba(45,212,191,0.3)]
          "
        />

        <button
          type="submit"
          className="
            w-full md:w-auto px-6 py-3
            text-lg font-semibold rounded-lg 
            bg-[#2dd4bf] text-black
            hover:bg-[#22c6b7]
            hover:shadow-[0_0_14px_rgba(45,212,191,0.5)]
            active:scale-95 transition
          "
        >
          Subscribe
        </button>
      </form>
    </div>
  );
}

export default NewLetterBox;
