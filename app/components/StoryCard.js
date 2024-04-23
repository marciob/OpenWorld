import { CgGitFork } from "react-icons/cg";
import { FaPlay } from "react-icons/fa"; // Import the icon

const StoryCard = ({ item, onFork, onMintContinuation, isLatestPage }) => (
  <article className="p-4 bg-gray-800 rounded shadow-xl border border-gray-700">
    <h2 className="text-lg font-semibold text-blue-300 mb-2">
      Page {item.page} - Fork: {item.forkId}
    </h2>
    <img
      src={item.imageUrl}
      alt="Generated visual representation"
      className="w-full h-auto rounded my-2"
    />
    <p className="text-white text-base font-medium leading-relaxed mb-4">
      {item.content}
    </p>
    <div className="mt-2 flex items-center justify-start">
      <a
        href={`https://arweave.net/${item.arweaveId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-2 py-1 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white rounded hover:scale-105 transform transition duration-200 ease-out flex items-center text-sm"
      >
        <img
          src="/glyph_dark@1x.png"
          alt="Arweave logo"
          className="w-3 h-3 mr-1"
        />
        View on Arweave
      </a>
    </div>
    <div className="flex justify-center w-full">
      {isLatestPage ? (
        <button
          onClick={onMintContinuation}
          className="mt-4 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white rounded hover:scale-105 transform transition duration-200 ease-out flex items-center justify-center"
        >
          <FaPlay className="mr-1" /> Mint a continuation
        </button>
      ) : (
        <button
          onClick={() => onFork(item.page, item.forkId)}
          className="mt-4 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white rounded hover:scale-105 transform transition duration-200 ease-out flex items-center justify-center"
        >
          <CgGitFork className="mr-1" />
          Fork
        </button>
      )}
    </div>
  </article>
);

export default StoryCard;
