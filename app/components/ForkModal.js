import { useEffect } from "react";
import { FaTimes } from "react-icons/fa";

const ForkModal = ({
  isOpen,
  onClose,
  onForkSubmit,
  forkInput,
  handleForkInputChange,
}) => {
  if (!isOpen) return null;

  // Close modal when clicking outside
  const handleBackdropClick = (event) => {
    if (event.currentTarget === event.target) {
      onClose();
    }
  };

  // Prevent the modal from closing when clicking inside the form
  const handleModalClick = (event) => {
    event.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-gray-800 p-5 rounded-lg w-1/2 max-w-xl"
        onClick={handleModalClick}
      >
        <button onClick={onClose} className="text-white float-right text-lg">
          <FaTimes />
        </button>
        <h2 className="text-lg text-white mb-4">
          Enter input for the new fork:
        </h2>
        <form onSubmit={onForkSubmit}>
          <textarea
            type="text"
            value={forkInput}
            onChange={handleForkInputChange}
            placeholder="New fork input..."
            className="form-input mt-1 block w-full h-32 rounded-md bg-gray-700 border-gray-600"
            autoFocus
          />
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
          >
            Submit Fork
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForkModal;
