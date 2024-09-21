"use client";
import Image from "next/image";
import React, { useState } from "react";
import axios from "axios";
import clear from "../../../public/Images/clear.png";
import clouds from "../../../public/Images/clouds.png";
import drizzle from "../../../public/Images/drizzle.png";
import humidity from "../../../public/Images/humidity.png";
import mist from "../../../public/Images/mist.png";
import rain from "../../../public/Images/rain.png";
import snow from "../../../public/Images/snow.png";
import wind from "../../../public/Images/wind.png";
import { MdMyLocation } from "react-icons/md";

function Card() {
  const [cityName, setCityName] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);

  const getWeatherData = async (city, lat, lon) => {
    try {
      const params = {
        appid: process.env.NEXT_PUBLIC_WEATHER_API_KEY,
        units: "metric",
      };

      if (lat && lon) {
        params.lat = lat;
        params.lon = lon;
      } else if (city) {
        params.q = city;
      } else {
        throw new Error("No city or coordinates provided");
      }

      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather`,
        { params }
      );

      setWeatherData(response.data);
      setError(null);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setError("Location not found");
      } else {
        setError("An error occurred while fetching the data.");
      }
      setWeatherData(null);
      console.error(error);
    }
  };

  const handleSearch = () => {
    if (cityName.trim()) {
      getWeatherData(cityName);
    } else {
      setError("Please enter a city name.");
      setWeatherData(null);
    }
  };

  const handleLocationClick = async () => {
    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        const { latitude, longitude } = position.coords;

        const response = await axios.get(
          "https://nominatim.openstreetmap.org/reverse",
          {
            params: {
              format: "jsonv2",
              lat: latitude,
              lon: longitude,
            },
          }
        );

        const address = response.data.address;
        const suburb =
          address.suburb ||
          address.neighbourhood ||
          address.village ||
          address.town ||
          address.city ||
          address.county;

        if (suburb) {
          setCityName(suburb);
          getWeatherData(null, latitude, longitude);
          setError(null);
        } else {
          setError("Unable to determine suburb from your location.");
        }
      } catch (error) {
        console.error(error);
        setError("Unable to retrieve your location.");
      }
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="flex flex-col gap-5 justify-center items-center p-10 shadow-2xl border border-cyan-500 w-fit rounded-3xl md:h-auto h-screen">
      <label className="input md:w-[400px] flex items-center gap-2 rounded-3xl bg-white text-cyan-50">
        <input
          type="text"
          className="grow text-gray-800"
          placeholder="Enter a city name to know the weather"
          value={cityName}
          onChange={(e) => setCityName(e.target.value)}
          autoComplete="off"
        />

        <div className="text-gray-800" onClick={handleLocationClick}>
          <MdMyLocation />
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="text-cyan-50"
          className="h-5 w-5 opacity-70"
          onClick={handleSearch}
        >
          <path
            fillRule="evenodd"
            d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
            clipRule="evenodd"
          />
        </svg>
      </label>
      {weatherData ? (
        <>
          <Image
            src={
              weatherData.weather[0].main === "Clouds"
                ? clouds
                : weatherData.weather[0].main === "Clear"
                ? clear
                : weatherData.weather[0].main === "Rain"
                ? rain
                : weatherData.weather[0].main === "Drizzle"
                ? drizzle
                : weatherData.weather[0].main === "Mist"
                ? mist
                : weatherData.weather[0].main === "Snow"
                ? snow
                : clear
            }
            alt="weather image"
            className="md:w-44 w-40"
          />
          <h1 className="text-cyan-50 md:text-7xl text-5xl font-medium">
            {Math.round(weatherData.main.temp)}°c
          </h1>
          <h2 className="text-cyan-50 md:text-5xl text-3xl">
            {weatherData.name}
          </h2>
          <div className="flex justify-between md:w-[400px] pt-10 md:px-5 md:gap-0 gap-10">
            <div className="flex gap-3">
              <Image
                src={humidity}
                alt="weather image"
                className="md:w-10 md:h-8 w-7 h-6 mt-1"
              />
              <div>
                <p className="text-cyan-50 md:text-3xl text-xl">
                  {weatherData.main.humidity}%
                </p>
                <p className="text-cyan-50 md:text-md text-sm">Humidity</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Image
                src={wind}
                alt="weather image"
                className="md:w-10 md:h-8 w-7 h-6 mt-1"
              />
              <div>
                <p className="text-cyan-50 md:text-3xl text-xl">
                  {weatherData.wind.speed}km/h
                </p>
                <p className="text-cyan-50 md:text-md text-sm">Wind Speed</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p className="text-red-500">{error}</p>
      )}
    </div>
  );
}

export default Card;
