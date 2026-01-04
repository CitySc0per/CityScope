import React from "react";
import ReactDOM from "react-dom/client";
import CityGuessGame from "./CityGuessGame";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  React.createElement(
    React.StrictMode,
    null,
    React.createElement(CityGuessGame)
  )
);
