import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import cities from "./data/usCities.json"; // Updated to cities with population >75k
import { Input } from "./components/ui/input.jsx";
import { Button } from "./components/ui/button.jsx";
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
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const filteredSuggestions = cities.filter((city) =>
    city.name.toLowerCase().startsWith(guess.toLowerCase()) && guess.length > 0
  );

  useEffect(() => {
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    setSelectedCity(randomCity);
  }, []);

  useEffect(() => {
    if (selectedCity && mapContainer.current) {
      // console.log("Selected city:", selectedCity);
      // console.log("Coordinates:", selectedCity.coords);
      setMapLoaded(false);
      setMapError(null);
      
      if (map.current) map.current.remove();
      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/satellite-streets-v12",
          center: selectedCity.coords,
          zoom: zoomLevel,
          interactive: false
        });
        
        map.current.on('load', () => {
          console.log("Map loaded successfully!");
          setMapLoaded(true);
        });
        
        map.current.on('error', (e) => {
          console.error("Map error:", e);
          setMapError(e.error?.message || "Failed to load map");
        });
      } catch (err) {
        console.error("Mapbox failed to load:", err);
        setMapError(err.message);
      }
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
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: 'red' }}>React is working</h2>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>🌆 CityScope</h1>
      <p style={{ color: '#4B5563' }}>Can you name the city from just the map?</p>
      {selectedCity && selectedCity.population && (
        <p style={{ fontSize: '14px', color: '#6B7280' }}>Population: {selectedCity.population.toLocaleString()}</p>
      )}
      <div style={{ position: 'relative' }}>
        <div ref={mapContainer} style={{ width: '100%', height: '400px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', backgroundColor: '#f0f0f0' }} />
        {!mapLoaded && !mapError && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '18px', color: '#666' }}>
            Loading map...
          </div>
        )}
        {mapError && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '14px', color: 'red', textAlign: 'center', padding: '20px' }}>
            Error loading map: {mapError}
          </div>
        )}
      </div>
      <div style={{ position: 'relative' }}>
        <Input
          placeholder="Enter a US city (population > 75k)"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <ul style={{ position: 'absolute', zIndex: 10, backgroundColor: 'white', border: '1px solid #D1D5DB', width: '100%', maxHeight: '240px', overflow: 'auto', borderRadius: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            {filteredSuggestions.map((city) => (
              <li
                key={city.name}
                style={{ padding: '8px 12px', cursor: 'pointer' }}
                onMouseDown={() => setGuess(city.name)}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
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
