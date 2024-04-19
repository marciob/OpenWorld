"use client";

import { useState, useEffect } from "react";
import { FaSpinner } from "react-icons/fa";
import LoadingSpinner from "./components/LoadingSpinner";
import StoryCard from "./components/StoryCard";
import ForkModal from "./components/ForkModal";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [texts, setTexts] = useState([]); // Store generated story parts
  const [currentFork, setCurrentFork] = useState("main"); // Handle different story forks
  const [showModal, setShowModal] = useState(false);
  const [forkInput, setForkInput] = useState("");
  const [isLoading, setIsLoading] = useState(false); // State to handle loading

  const handleInputChange = (e) => setInputText(e.target.value);
  const handleForkInputChange = (e) => setForkInput(e.target.value);

  const fetchStory = async (text, page, forkId) => {
    setIsLoading(true); // Start loading
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
    setIsLoading(false); // Stop loading
    if (response.ok) {
      setTexts((prevTexts) => [
        ...prevTexts,
        {
          content: data.result,
          page: data.page,
          forkId: data.forkId,
          arweaveId: data.arweaveId,
          imageUrl: data.image,
        },
      ]);
    } else {
      console.error("Failed to fetch story:", data.error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = inputText.trim() ? inputText : "";
    if (!text) return;

    await fetchStory(text, texts.length + 1, currentFork);
    setInputText("");
  };

  const handleForkSubmit = async (e) => {
    e.preventDefault();
    if (!forkInput) return;

    const newForkId = currentFork + "-fork" + new Date().getTime();
    setCurrentFork(newForkId);

    setShowModal(false); // Close modal immediately upon form submission
    await fetchStory(forkInput, texts.length + 1, newForkId);
    setForkInput("");
  };

  const handleForkClick = (page, forkId) => {
    setShowModal(true);
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
          autoFocus
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Generate Story
        </button>
      </form>

      {isLoading && <LoadingSpinner />}

      <ForkModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onForkSubmit={handleForkSubmit}
        forkInput={forkInput}
        handleForkInputChange={handleForkInputChange}
      />

      <div className="mt-8 w-full max-w-lg space-y-4">
        {texts.map((item, index) => (
          <StoryCard
            key={index}
            item={item}
            onFork={() => handleForkClick(item.page, item.forkId)}
            isLatestPage={index === texts.length - 1}
          />
        ))}
      </div>
    </main>
  );
}
