import { FaTimes } from "react-icons/fa";

const NewWorldModal = ({
  isOpen,
  onClose,
  onSubmit,
  inputText,
  onInputChange,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (event) => {
    if (event.currentTarget === event.target) {
      onClose();
    }
  };

  const handleModalClick = (event) => event.stopPropagation();

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-gray-800 p-5 rounded-lg w-1/2 max-w-xl flex flex-col items-center"
        onClick={handleModalClick}
      >
        <button onClick={onClose} className="self-end text-white text-lg">
          <FaTimes />
        </button>
        <h2 className="text-lg text-white mb-4">Start a New World</h2>
        <p className="text-sm text-gray-400 mb-4">
          Enter the first few lines of a story to mint a new world. Your input
          will set the stage for an evolving narrative.
        </p>
        <form onSubmit={onSubmit} className="w-full flex flex-col items-center">
          <textarea
            value={inputText}
            onChange={onInputChange}
            placeholder="Begin the adventure... What happens first?"
            className="form-input mt-1 block w-full h-32 rounded-md bg-gray-700 border-gray-600"
            autoFocus
          />
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white rounded hover:scale-105 transform transition duration-200 ease-out flex items-center justify-center"
          >
            Mint
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewWorldModal;
