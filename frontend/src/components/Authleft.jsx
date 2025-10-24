import React from "react";

const Authleft = () => {
  return (
    <>
      <div className="h-full w-full">
        <div className=" h-screen bg-[linear-gradient(135deg,_#2a2740_0%,_#232526_90%)] w-full bg-cover bg-center flex flex-col place-items-end">
          <div className="w-full h-[70%]">
            <img
              className="h-full w-full object-cover"
              src="https://storage.googleapis.com/uxpilot-auth.appspot.com/44df326f09-1a7914afbe48ed271c92.png"
              alt="E-commerce illustration"
            />
          </div>

          <div className="w-full p-10 h-full">
            <h1 className="text-white text-3xl font-bold mb-4">
              Discover Your Next Favorite Thing.
            </h1>
            <p className="text-white text-lg">
              Sign in to unlock exclusive deals, personalized recommendations,
              and a seamless shopping experience.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Authleft;
