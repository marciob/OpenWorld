// WalletConnect.js
import { useState } from "react";
import { ethers } from "ethers";

const WalletConnect = () => {
  const [walletAddress, setWalletAddress] = useState("");

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const account = ethers.utils.getAddress(accounts[0]);
        setWalletAddress(account);
      } catch (err) {
        console.error("Failed to connect wallet", err);
      }
    } else {
      console.log("Install MetaMask");
    }
  };

  const formatAddress = (address) => {
    return address
      ? `${address.substring(0, 4)}...${address.substring(address.length - 4)}`
      : "";
  };

  return (
    <div className="absolute top-4 right-4">
      {walletAddress ? (
        <span className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded">
          {formatAddress(walletAddress)}
        </span>
      ) : (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white rounded flex items-center justify-center gap-2 transition duration-300 ease-in-out transform hover:scale-105"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default WalletConnect;
