import React from "react";

function NewLetterBox() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // add your submit logic here
  };

  return (
    <div className="w-full h-[40vh] bg-gradient-to-l from-[#141414] to-[#0c2025] flex flex-col items-center justify-center gap-6 px-5 md:px-16 select-none">
      <p className="text-[20px] md:text-3xl text-[#a5faf7] font-semibold text-center drop-shadow-md">
        Subscribe now & get 20% off
      </p>
      <p className="text-[14px] md:text-lg text-blue-200 font-semibold text-center max-w-2xl mx-auto px-4 drop-shadow-sm">
        Subscribe now and enjoy exclusive savings, special deals, and early
        access to new collections.
      </p>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-4"
      >
        <input
          type="email"
          placeholder="Enter Your Email"
          required
          className="
            w-full md:w-3/4 h-10 md:h-12 px-5 rounded-lg bg-[#1a2733] placeholder:text-gray-400
            text-white border border-[#2dd4bf] shadow-md shadow-black/50
            focus:outline-none focus:ring-4 focus:ring-teal-400 focus:ring-opacity-60
            transition duration-300 ease-in-out transform hover:scale-[1.02]
          "
        />
        <button
          type="submit"
          className="
            w-full md:w-auto text-lg md:text-xl px-6 py-3 rounded-lg bg-[#2dd4bf] text-black font-semibold
            hover:bg-[#22c6b7] hover:shadow-sm hover:shadow-teal-400/80 
            focus:outline-none focus:ring-4 focus:ring-teal-400 focus:ring-opacity-80
            transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95
          "
        >
          Subscribe
        </button>
      </form>
    </div>
  );
}

export default NewLetterBox;
