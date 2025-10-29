import React, { useContext, useState } from "react";
import ai from "../assets/asset/ai.jpg";
import { shopDataContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import open from "../assets/asset/open.mp3";
import close from "../assets/asset/close.mp3";

function Ai() {
  const adminURL = import.meta.env.VITE_ADMIN_URL;
  const {
    showSearch,
    addtoCart,
    productData,
    setShowSearch,
    size,
    setSize,
    setSearch,
  } = useContext(shopDataContext);
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
    console.log(e);
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
      (transcript.includes("search") &&
        transcript.includes("open") &&
        !showSearch) ||
      (transcript.includes("search") &&
        transcript.includes("kholo") &&
        !showSearch) ||
      (transcript.includes("search") &&
        transcript.includes("karo") &&
        !showSearch)
    ) {
      speak("opening search");
      setShowSearch(true);
      navigate("/collection");
    } else if (
      (transcript.includes("search") &&
        transcript.includes("close") &&
        showSearch) ||
      (transcript.includes("search") &&
        transcript.includes("band") &&
        showSearch)
    ) {
      speak("closing search");
      setShowSearch(false);
    } else if (
      transcript.includes("collection") ||
      transcript.includes("collections")
    ) {
      speak("opening collection page");
      navigate("/collection");
    } else if (
      transcript.includes("about") ||
      transcript.includes("abaut") ||
      transcript.includes("aboot") ||
      transcript.includes("abaot") ||
      transcript.includes("aboutpage")
    ) {
      speak("opening About page");
      navigate("/about");
      setShowSearch(false);
    } else if (
      transcript.includes("place order") ||
      transcript.includes("place oder") ||
      transcript.includes("order place ") ||
      transcript.includes("placeorder")
    ) {
      speak("Ok");
      navigate("/placeorder");
    } else if (
      transcript.includes("order") ||
      transcript.includes("orders") ||
      transcript.includes("orderpage") ||
      transcript.includes("myorder") ||
      transcript.includes("my order") ||
      transcript.includes("my orders") ||
      transcript.includes("myorders") ||
      transcript.includes("mereorder") ||
      transcript.includes("meraorder")
    ) {
      speak("Your order");
      navigate("/order");
      setShowSearch(false);
    } else if (
      transcript.includes("product") ||
      transcript.includes("productpage") ||
      transcript.includes("products") ||
      transcript.includes("Bestseller") ||
      transcript.includes("BestsellerPage ") ||
      transcript.includes("vestseller")
    ) {
      speak("Ok");
      navigate("/collection");
      setShowSearch(false);
    } else if (
      (transcript.includes("login") && transcript.includes("karna")) ||
      (transcript.includes("login") && transcript.includes("page"))
    ) {
      speak("Opening login page");
      navigate("/login");
      setShowSearch(false);
    } else if (
      (transcript.includes("logout") && transcript.includes("karna")) ||
      (transcript.includes("logout") && transcript.includes("kardo")) ||
      (transcript.includes("logout") && transcript.includes("page"))
    ) {
      speak("ok");
      setShowSearch(false);
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
      setShowSearch(false);
      navigate("/signup");
    } else if (
      (transcript.includes("open") && transcript.includes("home")) ||
      (transcript.includes("home") && transcript.includes("page")) ||
      (transcript.includes("home") && transcript.includes("kholo")) ||
      (transcript.includes("home") && transcript.includes("chalo"))
    ) {
      speak("Opening home page");
      setShowSearch(false);
      navigate("/");
    } else if (
      (transcript.includes("adminpage") && transcript.includes("open")) ||
      (transcript.includes("admin") &&
        transcript.includes("page") &&
        transcript.includes("open")) ||
      (transcript.includes("my") &&
        transcript.includes("admin") &&
        transcript.includes("page")) ||
      (transcript.includes("mera") &&
        transcript.includes("admin") &&
        transcript.includes("page")) ||
      (transcript.includes("mera") &&
        transcript.includes("admin") &&
        transcript.includes("dashboard")) ||
      (transcript.includes("kholo") &&
        transcript.includes("admin") &&
        transcript.includes("page")) ||
      (transcript.includes("mode") && transcript.includes("admin")) ||
      (transcript.includes("mod") && transcript.includes("admin"))
    ) {
      speak("Opening Admin Login page");
      setShowSearch(false);
      window.location.href = adminURL;
    } else if (
      transcript.includes("men") ||
      transcript.includes("man") ||
      transcript.includes("woman") ||
      transcript.includes("women") ||
      transcript.includes("tshirt") ||
      transcript.includes("tshit") ||
      transcript.includes("tshat") ||
      transcript.includes("shat") ||
      transcript.includes("pent") ||
      transcript.includes("shirt") ||
      transcript.includes("kids") ||
      transcript.includes("jogger") ||
      transcript.includes("pant") ||
      transcript.includes("jeans") ||
      transcript.includes("hoodie") ||
      transcript.includes("trowser") ||
      transcript.includes("trouser") ||
      transcript.includes("lower") ||
      transcript.includes("upper") ||
      transcript.includes("child") ||
      transcript.includes("children") ||
      transcript.includes("jacket") ||
      transcript.includes("top") ||
      transcript.includes("bottomwaer") ||
      transcript.includes("inner") ||
      transcript.includes("enner") ||
      transcript.includes("innerwear") ||
      transcript.includes("taxido") ||
      transcript.includes("bache") ||
      transcript.includes("aadmi") ||
      transcript.includes("aurat") ||
      transcript.includes("ladke") ||
      transcript.includes("boys") ||
      transcript.includes("girls") ||
      transcript.includes("girl") ||
      transcript.includes("boy") ||
      transcript.includes("clothes") ||
      transcript.includes("kapde") ||
      transcript.includes("cloth") ||
      transcript.includes("cap") ||
      transcript.includes("wollen") ||
      transcript.includes("woolen") ||
      transcript.includes("boolen") ||
      transcript.includes("summer") ||
      transcript.includes("samar") ||
      transcript.includes("winter") ||
      transcript.includes("rainy") ||
      transcript.includes("thand") ||
      transcript.includes("garmi")
    ) {
      speak(transcript);
      setShowSearch(true);
      setSearch(transcript);
    } else if (
      transcript.includes("contact") ||
      transcript.includes("contactpage") ||
      transcript.includes("contact")
    ) {
      speak("Opening contact page");
      navigate("/contact");
      setShowSearch(false);
    } else if (
      transcript.includes("add to cart") ||
      transcript.includes("add to kite") ||
      transcript.includes("addtitude cart") ||
      transcript.includes("add to cut") ||
      transcript.includes("editor cart") ||
      transcript.includes("cart me add karo") ||
      transcript.includes("cart mein add karo") ||
      transcript.includes("add karo cart") ||
      transcript.includes("add karte hain cart")
    ) {
      if (!productData) {
        toast("Please select product first");
        speak("Please select product first");
        return;
      }
      if (!size) {
        speak("Please select a size before adding to cart");
        toast.error("Select a size first");
      } else {
        addtoCart(productData._id, size);
        setSize("");
        speak(`${productData.name} of size ${size} added to cart`);
        toast.success(`${productData.name} added to cart`);
      }
      setShowSearch(false);
    } else if (
      transcript.includes("cart") ||
      transcript.includes("cartPage") ||
      (transcript.includes("open") && transcript.includes("kite")) ||
      transcript.includes("mericart") ||
      transcript.includes("kite") ||
      transcript.includes("meriKart") ||
      transcript.includes("meriKaat") ||
      transcript.includes("meriKaat") ||
      transcript.includes("card") ||
      (transcript.includes("open") && transcript.includes("card")) ||
      transcript.includes("cartpage") ||
      transcript.includes("cartkholo") ||
      transcript.includes("kaat") ||
      transcript.includes("kart")
    ) {
      speak("Your cart");
      navigate("/cart");

      setShowSearch(false);
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
