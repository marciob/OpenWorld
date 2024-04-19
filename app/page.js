"use client";

import { useState } from "react";
import { FaSpinner } from "react-icons/fa"; // Import spinner icon

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [texts, setTexts] = useState([]); // Store generated story parts
  const [currentPage, setCurrentPage] = useState(1);
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
      setTexts(
        texts.concat({
          content: data.result,
          page: data.page,
          forkId: data.forkId,
          arweaveId: data.arweaveId,
          imageUrl: data.image,
        })
      );
      setCurrentPage(data.page + 1);
    } else {
      console.error("Failed to fetch story:", data.error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = inputText.trim() ? inputText : "";
    if (!text) return;

    await fetchStory(text, currentPage, currentFork);
    setInputText("");
  };

  const handleForkSubmit = async (e) => {
    e.preventDefault();
    if (!forkInput) return;

    const newForkId = currentFork + "-fork" + new Date().getTime();
    setCurrentFork(newForkId);
    setCurrentPage(currentPage);

    await fetchStory(forkInput, currentPage, newForkId);
    setForkInput("");
    setShowModal(false);
  };

  const handleForkClick = (page, forkId) => {
    setCurrentPage(page);
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

      {isLoading && (
        <div className="flex justify-center items-center">
          <FaSpinner className="animate-spin text-4xl text-white" />
        </div>
      )}

      {showModal && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 p-5 rounded-lg">
          <h2 className="text-lg text-white mb-2">
            Enter input for the new fork:
          </h2>
          <form onSubmit={handleForkSubmit}>
            <input
              type="text"
              value={forkInput}
              onChange={handleForkInputChange}
              placeholder="New fork input..."
              className="form-input mt-1 block w-full rounded-md bg-gray-700 border-gray-600"
            />
            <button
              type="submit"
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
            >
              Submit Fork
            </button>
          </form>
          <button
            onClick={() => setShowModal(false)}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
          >
            Close
          </button>
        </div>
      )}

      <div className="mt-8 w-full max-w-lg space-y-4">
        {texts.map((item, index) => (
          <article
            key={index}
            className="p-4 bg-gray-800 rounded shadow-xl border border-gray-700"
          >
            <h2 className="text-lg font-semibold text-blue-300 mb-2">
              Page {item.page} - Fork: {item.forkId}
            </h2>
            <img
              src={item.imageUrl}
              alt="Generated visual representation"
              className="w-full h-auto rounded my-2"
            />
            <p className="text-gray-400">{item.content}</p>
            <span className="text-blue-300">Arweave ID: </span>
            <a
              href={`https://arweave.net/${item.arweaveId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 hover:underline"
            >
              {item.arweaveId}
            </a>
            <button
              onClick={() => handleForkClick(item.page + 1, item.forkId)}
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
