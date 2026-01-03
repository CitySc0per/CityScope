import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import cities from "./data/usCities.json"; // Updated to cities with population >75k
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import * as turf from "@turf/turf";

mapboxgl.accessToken = "pk.eyJ1Ijoic2VhbmthbmU5NyIsImEiOiJjbWVjdmd0anUwMGFxMmxvcGE4eG90aXRwIn0.LaEMx3TnFSQWP65NEfRYcw";

export default function CityGuessGame() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [guessCount, setGuessCount] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(12);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const filteredSuggestions = cities.filter((city) =>
    city.name.toLowerCase().startsWith(guess.toLowerCase()) && guess.length > 0
  );

  useEffect(() => {
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    setSelectedCity(randomCity);
  }, []);

  useEffect(() => {
    if (selectedCity && mapContainer.current) {
      if (map.current) map.current.remove();
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/seankane97/cmecw2dm600js01qqf6mpb6rr",
        center: selectedCity.coords,
        zoom: zoomLevel,
        interactive: false,
      });
    }
  }, [selectedCity, zoomLevel]);

  const handleGuess = () => {
    const correctCity = selectedCity.name.toLowerCase();
    const guessCity = guess.trim().toLowerCase();
    const guessedCityData = cities.find(
      (c) => c.name.toLowerCase() === guessCity
    );

    if (!guessedCityData) {
      setFeedback("City not found in list. Please try again.");
      return;
    }

    if (guessCity === correctCity) {
      setFeedback("🎉 Correct! You guessed the city!");
    } else {
      const from = turf.point(guessedCityData.coords);
      const to = turf.point(selectedCity.coords);
      const distance = turf.distance(from, to, { units: "miles" }).toFixed(1);

      const newGuessCount = guessCount + 1;
      setGuessCount(newGuessCount);

      if (newGuessCount >= 3) {
        setFeedback(`❌ Incorrect. You're ${distance} miles away. You've used all 3 guesses. You lost! The correct answer was ${selectedCity.name}.`);
        return;
      }

      setFeedback(`❌ Incorrect. You're ${distance} miles away.`);

      if (newGuessCount === 2) {
        setZoomLevel(10); // Zoom out slightly to give a hint
      }
    }
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <head>
        <title>CityScope</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <h1 className="text-xl font-bold">🌆 CityScope</h1>
      <p className="text-gray-600">Can you name the city from just the map?</p>
      {selectedCity && selectedCity.population && (
        <p className="text-sm text-gray-500">Population: {selectedCity.population.toLocaleString()}</p>
      )}
      <div ref={mapContainer} className="w-full h-96 rounded-xl shadow" />
      <div className="relative">
        <Input
          placeholder="Enter a US city (population > 75k)"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <ul className="absolute z-10 bg-white border border-gray-300 w-full max-h-60 overflow-auto rounded shadow">
            {filteredSuggestions.map((city) => (
              <li
                key={city.name}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onMouseDown={() => setGuess(city.name)}
              >
                {city.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Button onClick={handleGuess}>Guess</Button>
      <Button onClick={() => window.location.reload()}>Next Round</Button>
      <p>{feedback}</p>
    </div>
  );
}
