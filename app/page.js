"use client";

import { useState } from "react";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [texts, setTexts] = useState([]); // This will store all the generated story parts
  const [currentPage, setCurrentPage] = useState(1); // Tracks the current page

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      // Send the current page along with the input text
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputText: inputText, page: currentPage }),
      });

      const data = await response.json();

      if (response.ok) {
        setTexts(texts.concat({ content: data.result, page: data.page })); // Add the new story part to the existing texts
        setCurrentPage(currentPage + 1); // Increment the page for the next submission
      } else {
        console.error("Failed to fetch story:", data.error);
      }

      setInputText(""); // Clear the input field after submission
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-lg">
        <div className="flex flex-col items-center">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Enter some text..."
            className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            Generate Story
          </button>
        </div>
      </form>

      <div className="mt-8 w-full max-w-lg space-y-4">
        {texts.map((item, index) => (
          <div
            key={index}
            className="text-center p-2 bg-gray-100 rounded shadow"
          >
            {item.content} (Page: {item.page})
          </div>
        ))}
      </div>
    </main>
  );
}
