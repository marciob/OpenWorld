import { useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { CgGitFork } from "react-icons/cg";

const ForkModal = ({
  isOpen,
  onClose,
  onForkSubmit,
  forkInput,
  handleForkInputChange,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (event) => {
    if (event.currentTarget === event.target) {
      onClose();
    }
  };

  const handleModalClick = (event) => {
    event.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-gray-800 p-5 rounded-lg w-1/2 max-w-xl shadow-xl relative"
        onClick={handleModalClick}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white text-lg"
        >
          <FaTimes />
        </button>
        <h2 className="text-lg text-white mb-4 text-center">Start a fork</h2>
        <p className="text-white text-sm text-center mb-2">
          Create a new pathway for the story.
        </p>
        <form
          onSubmit={onForkSubmit}
          className="flex flex-col items-center w-full"
        >
          <textarea
            type="text"
            value={forkInput}
            onChange={handleForkInputChange}
            placeholder="Where does it go from here?"
            className="form-input mt-1 block w-full h-32 rounded-md bg-gray-700 border-gray-600 focus:border-gray-600 focus:ring-0" // Adjusted focus styles
            autoFocus
          />
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white rounded hover:scale-105 transform transition duration-200 ease-out flex items-center justify-center"
          >
            <CgGitFork
              className="mr-1 text-lg"
              style={{ display: "inline-block" }}
            />
            Fork
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForkModal;
