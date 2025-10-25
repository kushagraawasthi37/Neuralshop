import React, { useEffect, useState, useSyncExternalStore } from "react";
import Nav from "../components/Nav";
import Backgound from "../components/Backgound";
import Hero from "../components/Hero";
// import Product from "./Product";
// import OurPolicy from "../component/OurPolicy";
// import NewLetterBox from "../component/NewLetterBox";
// import Footer from "../component/Footer";

function Home() {
  let heroData = [
    { text1: "30% OFF Limited Offer", text2: "Style that" },
    { text1: "Discover the Best of Bold Fashion", text2: "Limited Time Only!" },
    { text1: "Explore Our Best Collection ", text2: "Shop Now!" },
    { text1: "Choose your Perfect Fasion Fit", text2: "Now on Sale!" },
  ];

  let [heroCount, setHeroCount] = useState(0);

  useEffect(() => {
    let interval = setInterval(() => {
      setHeroCount((prevCount) => (prevCount === 3 ? 0 : prevCount + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  



  return (
    <>
      <Nav />
      <div className="overflow-x-hidden relative top-[45px] md:top-[70px]">
        <div className=" w-screen lg:h-screen md:h-[50vh] sm:h-[30vh]   bg-gradient-to-l from-[#141414] to-[#0c2025] rounded-md">
          <Backgound heroCount={heroCount} />
          <Hero
            heroCount={heroCount}
            setHeroCount={setHeroCount}
            heroData={heroData[heroCount]}
          />
        </div>
        {/* <Product/>
    <OurPolicy/>
    <NewLetterBox/>
    <Footer/> */}
      </div>
    </>
  );
}

export default Home;
