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
        className="bg-gray-800 p-5 rounded-lg w-1/2 max-w-xl"
        onClick={handleModalClick}
      >
        <button onClick={onClose} className="text-white float-right text-lg">
          <FaTimes />
        </button>
        <h2 className="text-lg text-white mb-4">Mint a new world:</h2>
        <form onSubmit={onSubmit}>
          <textarea
            value={inputText}
            onChange={onInputChange}
            placeholder="Enter the story to start a new world..."
            className="form-input mt-1 block w-full h-32 rounded-md bg-gray-700 border-gray-600"
            autoFocus
          />
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewWorldModal;
