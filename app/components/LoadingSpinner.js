import { FaSpinner } from "react-icons/fa";

const LoadingSpinner = () => (
  <div className="flex justify-center items-center">
    <FaSpinner className="animate-spin text-4xl text-white" />
  </div>
);

export default LoadingSpinner;
