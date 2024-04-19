const StoryCard = ({ item, onFork }) => (
  <article className="p-4 bg-gray-800 rounded shadow-xl border border-gray-700">
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
      onClick={() => onFork(item.page + 1, item.forkId)}
      className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
    >
      Fork
    </button>
  </article>
);

export default StoryCard;
