import React, { useState } from "react";
import WeatherBackground from "./components/WeatherBackground";
import { convertTemperature, getHumidityValue, getVisibilityValue, getWindDirection } from "./components/Helper";

import { HumidityIcon, WindIcon, VisibilityIcon, SunriseIcon, SunsetIcon } from "./components/Icons";

function App() {
  const API_KEY = "5b45bdde23b49f234483e750619d8b20";

  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState("");
  const [unit, setUnit] = useState("C");
  const [error, setError] = useState("");

  const fetchWeatherData = async (url, name = "") => {
    setError("");
    setWeather(null);
    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error((await response.json()).message || "City not Found");

      const data = await response.json();
      setWeather(data);
      setCity(name || data.name);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) return setError("Please enter a valid city name");
    await fetchWeatherData(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`,
      city
    );
  };

  // Helper: check the weather condition
  const getWeatherCondition = () =>
    weather && {
      main: weather.weather[0].main,
      isDay:
        Date.now() / 1000 > weather.sys.sunrise &&
        Date.now() / 1000 < weather.sys.sunset,
    };

  return (
    <>
      <div className="min-h-screen">
        <WeatherBackground condition={getWeatherCondition()} />

        <div className="flex items-center justify-center p-6 min-h-screen">
          <div className="bg-transparent backdrop-filter backdrop-blur-md rounded-xl shadow-2xl p-8 max-w-md text-white w-full border border-white/30 relative z-10">
            <h1 className="text-4xl font-extrabold text-center mb-6">
              Weather App
            </h1>

            {!weather ? (
              <form onSubmit={handleSearch} className="flex flex-col relative">
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city/country name"
                  className="mb-4 p-3 rounded border border-white bg-transparent text-white placeholder:text-white focus:outline-none focus:border-blue-300 transition duration-300"
                />
                <button
                  type="submit"
                  className="bg-purple-700 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                >
                  Get Weather
                </button>
              </form>
            ) : (
              <div className="text-center mt-6 transition-opacity duration-500">
                <button
                  onClick={() => {
                    setWeather(null);
                    setCity("");
                  }}
                  className="mb-4 bg-purple-700 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded transition-colors"
                >
                  New Search
                </button>

                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold">{weather.name}</h2>
                  <button
                    onClick={() => setUnit((u) => (u === "C" ? "F" : "C"))}
                    className="bg-purple-700 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded transition-colors"
                  >
                    &deg;{unit}
                  </button>
                </div>

                <img
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                  alt={weather.weather[0].description}
                  className="mx-auto my-4 animate-bounce"
                />

                <p className="text-4xl">
                  {convertTemperature(weather.main.temp, unit)} &deg;{unit}
                </p>
                <p className="capitalize">{weather.weather[0].description}</p>

                {/* Weather Details */}
                <div className="flex flex-wrap mt-6 justify-around">
                  {[
                    [
                      HumidityIcon,
                      "Humidity",
                      `${weather.main.humidity}% (${getHumidityValue(
                        weather.main.humidity
                      )})`,
                    ],
                    [
                      WindIcon,
                      "Wind",
                      `${weather.wind.speed} m/s ${
                        weather.wind.deg
                          ? `(${getWindDirection(weather.wind.deg)})`
                          : ""
                      }`,
                    ],
                    [
                      VisibilityIcon,
                      "Visibility",
                      getVisibilityValue(weather.visibility),
                    ],
                  ].map(([Icon, label, value]) => (
                    <div key={label} className="flex flex-col items-center m-2">
                      <Icon />
                      <p className="mt-1 font-semibold">{label}</p>
                      <p className="text-sm">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Sunrise / Sunset */}
                <div className="flex flex-wrap justify-around mt-6">
                  {[
                    ["Sunrise", weather.sys.sunrise, SunriseIcon],
                    ["Sunset", weather.sys.sunset, SunsetIcon],
                  ].map(([label, time, Icon]) => (
                    <div key={label} className="flex flex-col items-center m-2">
                      <Icon />
                      <p className="mt-1 font-semibold">{label}</p>
                      <p className="text-sm">
                        {new Date(time * 1000).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-sm">
                  <p>
                    <strong>Feels Like:</strong>{" "}
                    {convertTemperature(weather.main.feels_like, unit)} &deg;
                    {unit}
                  </p>
                  <p>
                    <strong>Pressure:</strong> {weather.main.pressure} hPa
                  </p>
                </div>
              </div>
            )}

            {error && (
              <p className="text-red-400 text-center mt-4">{error}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
