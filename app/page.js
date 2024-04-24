"use client";

import { useState } from "react";
import { IoMdPlanet } from "react-icons/io";
import LoadingSpinner from "./components/LoadingSpinner";
import StoryCard from "./components/StoryCard";
import ForkModal from "./components/ForkModal";
import NewWorldModal from "./components/NewWorldModal";
import WalletConnect from "./components/WalletConnect";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [texts, setTexts] = useState([]); // Store generated story parts
  const [currentFork, setCurrentFork] = useState("main"); // Handle different story forks
  const [currentPage, setCurrentPage] = useState(1); // Keep track of the current page for forks
  const [showNewWorldModal, setShowNewWorldModal] = useState(false);
  const [isContinuation, setIsContinuation] = useState(false);
  const [showForkModal, setShowForkModal] = useState(false);
  const [forkInput, setForkInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => setInputText(e.target.value);
  const handleForkInputChange = (e) => setForkInput(e.target.value);

  const onFork = (page, forkId) => {
    setCurrentPage(page);
    setCurrentFork(forkId);
    setShowForkModal(true);
  };

  const fetchStory = async (text, page, forkId, isNewFork = false) => {
    setIsLoading(true);
    setShowNewWorldModal(false);
    setShowForkModal(false);

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inputText: text,
        page: page,
        forkId: forkId,
        isNewFork: isNewFork, // Make sure to send this to the backend
      }),
    });

    const data = await response.json();
    setIsLoading(false);

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

  const handleNewWorldSubmit = async (e) => {
    e.preventDefault();
    if (!inputText) return;

    await fetchStory(inputText, currentPage, currentFork); // Use the updated currentPage
    setInputText("");
    setIsContinuation(false);
  };

  const handleMintContinuationClick = () => {
    setIsContinuation(true);
    setShowNewWorldModal(true);
    // Assuming `texts` contains all current story parts and they are ordered correctly:
    const lastStoryPart = texts[texts.length - 1];
    setCurrentPage(lastStoryPart.page + 1); // Increment to next page number
  };

  const handleForkSubmit = async (e) => {
    e.preventDefault();
    if (!forkInput) return;

    setShowForkModal(false);
    setIsLoading(true);
    // Ensure isNewFork is set to true when creating a new fork
    await fetchStory(forkInput, currentPage + 1, currentFork, true);
    setForkInput("");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 text-white bg-black">
      <WalletConnect />
      <button
        onClick={() => {
          setIsContinuation(false);
          setShowNewWorldModal(true);
        }}
        className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white rounded flex items-center justify-center gap-2 transition duration-300 ease-in-out transform hover:scale-105"
      >
        <IoMdPlanet /> Mint a new world
      </button>

      {showNewWorldModal && (
        <NewWorldModal
          isOpen={showNewWorldModal}
          onClose={() => setShowNewWorldModal(false)}
          onSubmit={handleNewWorldSubmit}
          inputText={inputText}
          onInputChange={handleInputChange}
          isContinuation={isContinuation}
        />
      )}

      {showForkModal && (
        <ForkModal
          isOpen={showForkModal}
          onClose={() => setShowForkModal(false)}
          onForkSubmit={handleForkSubmit}
          forkInput={forkInput}
          handleForkInputChange={handleForkInputChange}
        />
      )}

      {isLoading && <LoadingSpinner />}

      <div className="mt-8 w-full max-w-lg space-y-4">
        {texts.map((item, index) => (
          <StoryCard
            key={index}
            item={item}
            onFork={onFork}
            onMintContinuation={handleMintContinuationClick}
            isLatestPage={index === texts.length - 1}
          />
        ))}
      </div>
    </main>
  );
}
