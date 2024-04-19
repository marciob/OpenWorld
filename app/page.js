"use client";

import { useState } from "react";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [texts, setTexts] = useState([]); // Store generated story parts
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFork, setCurrentFork] = useState("main"); // Handle different story forks

  const handleInputChange = (e) => setInputText(e.target.value);

  const fetchStory = async (text, page, forkId) => {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inputText: text,
        page: page,
        forkId: forkId,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      setTexts(
        texts.concat({
          content: data.result,
          page: data.page,
          forkId: data.forkId,
        })
      );
      setCurrentPage(data.page + 1);
    } else {
      console.error("Failed to fetch story:", data.error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = inputText.trim() ? inputText : ""; // Directly use inputText
    if (!text) return;

    await fetchStory(text, currentPage, currentFork);
    setInputText("");
  };

  const handleFork = async (page, forkId) => {
    const newForkId = forkId + "-fork" + new Date().getTime(); // Create a new unique fork ID
    setCurrentFork(newForkId);
    setCurrentPage(page);
    const userForkInput = prompt("Enter your input for the new fork:");
    if (userForkInput) {
      await fetchStory(userForkInput, page, newForkId); // Directly use the fork input to fetch story
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 text-white bg-black">
      <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-4">
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Enter some text..."
          className="form-input mt-1 block w-full rounded-md bg-gray-800 border-gray-600"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Generate Story
        </button>
      </form>

      <div className="mt-8 w-full max-w-lg space-y-4">
        {texts.map((item, index) => (
          <article
            key={index}
            className="p-4 bg-gray-800 rounded shadow-xl border border-gray-700"
          >
            <h2 className="text-lg font-semibold text-blue-300 mb-2">
              Page {item.page} - Fork: {item.forkId}
            </h2>
            <p className="text-gray-400">{item.content}</p>
            <button
              onClick={() => handleFork(item.page + 1, item.forkId)}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
            >
              Fork
            </button>
          </article>
        ))}
      </div>
    </main>
  );
}
