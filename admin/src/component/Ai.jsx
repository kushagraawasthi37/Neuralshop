import React, { useContext, useState } from "react";
import ai from "../assets/ai.jpg";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import open from "../assets/open.mp3";
import close from "../assets/close.mp3";

function Ai() {
  const adminURL = import.meta.env.VITE_USER_URL;

  let navigate = useNavigate();
  let openingSound = new Audio(open);
  let closingSound = new Audio(close);
  let [activeAi, setActiveAi] = useState(false);

  function speak(message) {
    let utterence = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(utterence); // window ka fucntion hai jo humare window mai hoga wo bol ke bta dega
  }

  const speechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const recognition = new speechRecognition();

  if (!recognition) {
    toast.error("Please speak something ");
    // console.log("not supported");
  }

  recognition.onresult = (e) => {
    // console.log(e);
    let transcript;

    if (e.results) {
      transcript = e.results[0][0].transcript.trim();
    }
    console.log(transcript);

    transcript = transcript.toLowerCase();

    // Debug context values
    // console.log("Current selected productData:", productData);
    // console.log("Current selected size:", size);

    if (
      (transcript.includes("add") && transcript.includes("items")) ||
      transcript.includes("add")
    ) {
      speak("Ok");
      navigate("/add");
    } else if (
      transcript.includes("order") ||
      transcript.includes("myorder") ||
      transcript.includes("orderpage") ||
      transcript.includes("oder") ||
      (transcript.includes("view") && transcript.includes("orders")) ||
      (transcript.includes("view") && transcript.includes("order"))
    ) {
      speak("Opening order page ");
      navigate("/orders");
    } else if (
      transcript.includes("list") ||
      transcript.includes("items") ||
      (transcript.includes("list") && transcript.includes("items"))
    ) {
      speak("Showing all items");
      navigate("/lists");
    } else if (
      (transcript.includes("login") && transcript.includes("karna")) ||
      (transcript.includes("login") && transcript.includes("page"))
    ) {
      speak("Opening login page");
      navigate("/login");
    } else if (
      (transcript.includes("logout") && transcript.includes("karna")) ||
      (transcript.includes("logout") && transcript.includes("kardo")) ||
      (transcript.includes("logout") && transcript.includes("page"))
    ) {
      speak("ok");
      navigate("/login");
    } else if (
      (transcript.includes("signup") && transcript.includes("karna")) ||
      (transcript.includes("signup") && transcript.includes("kardo")) ||
      (transcript.includes("register") && transcript.includes("page")) ||
      (transcript.includes("register") && transcript.includes("page")) ||
      (transcript.includes("register") && transcript.includes("kardo")) ||
      (transcript.includes("registeration") && transcript.includes("kardo")) ||
      (transcript.includes("registeration") && transcript.includes("page"))
    ) {
      speak("opening signup page");
      navigate("/signup");
    } else if (
      (transcript.includes("open") && transcript.includes("home")) ||
      (transcript.includes("home") && transcript.includes("page")) ||
      (transcript.includes("home") && transcript.includes("kholo")) ||
      (transcript.includes("home") && transcript.includes("chalo"))
    ) {
      speak("Opening home page");
      navigate("/");
    } else if (
      (transcript.includes("userpage") && transcript.includes("open")) ||
      (transcript.includes("user") &&
        transcript.includes("page") &&
        transcript.includes("open")) ||
      (transcript.includes("my") &&
        transcript.includes("user") &&
        transcript.includes("page")) ||
      (transcript.includes("mera") &&
        transcript.includes("user") &&
        transcript.includes("page")) ||
      (transcript.includes("mera") &&
        transcript.includes("user") &&
        transcript.includes("dashboard")) ||
      (transcript.includes("kholo") &&
        transcript.includes("user") &&
        transcript.includes("page")) ||
      (transcript.includes("mode") && transcript.includes("user")) ||
      (transcript.includes("mod") && transcript.includes("user"))
    ) {
      speak("Opening User Login page");
      window.location.href = adminURL;
    } else {
      speak("Try again");
      toast.error("Try Again");
    }
  };

  recognition.onnomatch = () => {
    speak("I did not catch that, please try again.");
    toast.error("No speech detected. Please try again.");
  };

  recognition.onerror = (e) => {
    speak("There was an error with speech recognition.");
    toast.error("Speech recognition error: " + e.error);
  };

  recognition.onend = () => {
    setActiveAi(false);
    closingSound.play();
  };

  return (
    <div
      className="fixed right-[2%] lg:bottom-[20px] md:bottom-[40px] bottom-[80px] z-50 cursor-pointer"
      onClick={() => {
        recognition.start();
        openingSound.play();
        setActiveAi(true);
      }}
    >
      <img
        src={ai}
        alt="AI Assistant"
        className={`w-[60px] md:w-[80px] lg:w-[100px] 
        rounded-full 
        ${
          activeAi
            ? "translate-x-[10%] translate-y-[-10%] scale-125"
            : "translate-x-0 translate-y-0 scale-100"
        } 
        transition-transform duration-300 ease-in-out 
        shadow-lg
       `}
        style={{
          filter: activeAi
            ? "drop-shadow(0 0 30px #00d2fc)"
            : "drop-shadow(0 0 20px rgba(0,0,0,0.6))",
        }}
      />
    </div>
  );
}

export default Ai;
