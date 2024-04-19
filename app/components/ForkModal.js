const ForkModal = ({
  isOpen,
  onClose,
  onForkSubmit,
  forkInput,
  handleForkInputChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 p-5 rounded-lg">
      <h2 className="text-lg text-white mb-2">Enter input for the new fork:</h2>
      <form onSubmit={onForkSubmit}>
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
        onClick={onClose}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
      >
        Close
      </button>
    </div>
  );
};

export default ForkModal;
