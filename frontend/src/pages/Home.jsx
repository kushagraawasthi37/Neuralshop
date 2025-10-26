import React, { useEffect, useState } from "react";
import Nav from "../components/Nav";
import Backgound from "../components/Backgound";
import Hero from "../components/Hero";
import Product from "./Product";
import OurPolicy from "../components/OurPolicy";
import NewLetterBox from "../components/NewLetterBox";
import Footer from "../components/Footer";

function Home() {
  let heroData = [
    { text1: "30% OFF Limited Offer", text2: "Style that" },
    { text1: "Discover the Best of Bold Fashion", text2: "Limited Time Only!" },
    { text1: "Explore Our Best Collection ", text2: "Shop Now!" },
    { text1: "Choose your Perfect Fashion Fit", text2: "Now on Sale!" },
  ];

  let [heroCount, setHeroCount] = useState(0);

  useEffect(() => {
    let interval = setInterval(() => {
      setHeroCount((prevCount) => (prevCount === 3 ? 0 : prevCount + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      <Nav />

      <div className="overflow-x-hidden relative top-[45px] md:top-[70px]  bg-gradient-to-br from-[#10121a] via-[#1a1f2e] to-[#252940]">
        {/* Hero Section */}
        <div className="relative w-screen lg:h-screen md:h-[60vh]  h-[30vh] rounded-b-8 overflow-hidden">
          {/* Background Image */}
          <Backgound heroCount={heroCount} />

          {/* Text Layer */}
          <Hero
            heroCount={heroCount}
            setHeroCount={setHeroCount}
            heroData={heroData[heroCount]}
          />
        </div>

        <Product />
        <OurPolicy />
        <NewLetterBox />
        <Footer />
      </div>
    </div>
  );
}

export default Home;
