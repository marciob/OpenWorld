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
  const [showNewWorldModal, setShowNewWorldModal] = useState(false); // Controls visibility of the new world modal
  const [isContinuation, setIsContinuation] = useState(false); // Determines if the modal is for continuation
  const [showForkModal, setShowForkModal] = useState(false); // Controls visibility of the fork modal
  const [forkInput, setForkInput] = useState("");
  const [isLoading, setIsLoading] = useState(false); // State to handle loading

  const handleInputChange = (e) => setInputText(e.target.value);
  const handleForkInputChange = (e) => setForkInput(e.target.value);

  const fetchStory = async (text, page, forkId) => {
    setIsLoading(true);
    setShowNewWorldModal(false); // Close modal immediately upon form submission
    setShowForkModal(false); // Close modal immediately upon form submission
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

    await fetchStory(inputText, 1, "main");
    setInputText("");
    setIsContinuation(false); // Reset the continuation flag
  };

  const handleMintContinuationClick = () => {
    setIsContinuation(true); // Set the modal to continuation mode
    setShowNewWorldModal(true);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 text-white bg-black">
      <WalletConnect />
      <button
        onClick={() => {
          setIsContinuation(false); // Ensure modal is in "new world" mode
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
            onFork={() => setShowForkModal(true)}
            onMintContinuation={handleMintContinuationClick}
            isLatestPage={index === texts.length - 1}
          />
        ))}
      </div>
    </main>
  );
}
