import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Header = () => {
  const navigate = useNavigate();
  const { userData, isLoggedin } = useContext(AppContext);
  return (
    <div className="flex flex-col items-center mt-20 px-4 text-center text-gray-800">
      <img
        src={assets.header_img}
        alt=""
        className="w-36 h-36 rounded-full mb-6 "
      />
      <h1 className="flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2">
        Hey {userData ? userData.name : " "}!
        <img className="w-8 aspect-square" src={assets.hand_wave} alt="" />
      </h1>
      <h2 className="text-3xl sm:text-5xl font-semibold mb-4">
        Welcome to GiftFrenz
      </h2>
      <p className="mb-8 max-w-md">Gifting made easy, memories made forever</p>
      {userData && isLoggedin ? (
        <button
          onClick={() => navigate("/user-dashboard")}
          className="border border-gray-500 rounded-full px-8 py-2.5 hover:bg-blue-600"
        >
          Get Started
        </button>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="border border-gray-500 rounded-full px-8 py-2.5 hover:bg-blue-600"
        >
          Create Account Here
        </button>
      )}
    </div>
  );
};

export default Header;
