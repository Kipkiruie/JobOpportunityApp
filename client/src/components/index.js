/** @jsxImportSource https://esm.sh/react@18.2.0 */
import React from "https://esm.sh/react@18.2.0";
import { createRoot } from "https://esm.sh/react-dom@18.2.0/client";
import App from './App.js';

function client() {
  createRoot(document.getElementById("root")).render(<App />);
}

if (typeof document !== "undefined") { client(); }