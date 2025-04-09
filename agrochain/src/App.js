import { useContext, useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import MarketplaceAbi from "./frontend/contractsData/Marketplace.json";
import MarketplaceAddress from "./frontend/contractsData/Marketplace-address.json";
import NFTAbi from "./frontend/contractsData/NFT.json";
import NFTAddress from "./frontend/contractsData/NFT-address.json";
import { ethers } from "ethers";

import Navigation from "./Components/Navigation";
import { NFT } from "./Components/NFT";
import { NFTDetails } from "./Components/NFTDetails";
import Profile from "./Components/Profile";
import { Register } from "./Components/Register";
import { Front } from "./Components/Front";
import Certificate from "./Components/Certificate/Certificate";
import { NftContext } from "./frontend/NftContext/NftProvider";

import "./App.scss";
import MainScreen from "./Components";

function App() {
  const {
    setAccount,
    setMarketplace,
    setNFT,
    setBalance,
    setIsLoading,
    account,
    setAccountType,
  } = useContext(NftContext);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false); // Add this line

  const SUPPORTED_NETWORKS = {
    1: "Ethereum Mainnet",
    5: "Goerli Testnet",
    11155111: "Sepolia Testnet",
  };

  const loadContracts = async (signer) => {
    try {
      // Add network check first
      const network = await signer.provider.getNetwork();
      if (!SUPPORTED_NETWORKS[network.chainId]) {
        throw new Error(
          `Unsupported network. Please connect to one of the following: ${Object.values(
            SUPPORTED_NETWORKS
          ).join(", ")}`
        );
      }

      console.log(
        `Connected to ${SUPPORTED_NETWORKS[network.chainId]} (Chain ID: ${
          network.chainId
        })`
      );

      // Verify contract addresses
      if (!MarketplaceAddress.address || !NFTAddress.address) {
        throw new Error("Contract addresses not found");
      }

      // Load Marketplace contract
      const marketplace = new ethers.Contract(
        MarketplaceAddress.address,
        MarketplaceAbi.abi,
        signer
      );

      // Add detailed error handling for contract verification
      try {
        const code = await signer.provider.getCode(MarketplaceAddress.address);
        if (code === "0x") {
          throw new Error("Marketplace contract not deployed on this network");
        }
      } catch (err) {
        throw new Error(
          `Marketplace contract verification failed: ${err.message}`
        );
      }

      setMarketplace(marketplace);

      // Load NFT contract with verification
      const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer);
      const nftCode = await signer.provider.getCode(NFTAddress.address);
      if (nftCode === "0x") {
        throw new Error("NFT contract not deployed on this network");
      }
      setNFT(nft);
    } catch (err) {
      console.error("Contract loading error:", err);
      setNetworkError(true);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const web3Handler = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask extension");
        return;
      }

      // Check if on correct network
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== "0x1" && chainId !== "0x5") {
        // Mainnet or Goerli
        alert("Please connect to Ethereum Mainnet or Goerli TestNet");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      try {
        const balance = await provider.getBalance(accounts[0]);
        const balances = ethers.utils.formatEther(balance);
        setBalance(balances);
      } catch (err) {
        console.error("Balance fetch error:", err);
      }

      await loadContracts(signer);
    } catch (err) {
      console.error("Web3 connection error:", err);
      setNetworkError(true);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });

      window.ethereum.on("accountsChanged", async function (accounts) {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          await web3Handler();
        } else {
          setAccount(null);
          setAccountType(false);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!!localStorage.getItem("account")) {
      (async () => {
        try {
          const account = localStorage.getItem("account");
          setAccount(account);

          if (!window.ethereum) {
            throw new Error("MetaMask not installed");
          }

          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();

          try {
            const balance = await provider.getBalance(account);
            const balances = ethers.utils.formatEther(balance);
            setBalance(balances);
          } catch (err) {
            console.error("Balance fetch error:", err);
          }

          const marketplace = new ethers.Contract(
            MarketplaceAddress.address,
            MarketplaceAbi.abi,
            signer
          );
          setMarketplace(marketplace);

          const nft = new ethers.Contract(
            NFTAddress.address,
            NFTAbi.abi,
            signer
          );
          try {
            const fam = await marketplace.farmers(account);
            setAccountType(fam.name ? true : false);
          } catch (err) {
            console.log("Not registered as farmer:", err);
            setAccountType(false);
          }

          setNFT(nft);
        } catch (err) {
          console.error("Initialization error:", err);
        } finally {
          setIsLoading(true);
        }
      })();
    }
  }, []);

  useEffect(() => {
    if (!!account) {
      localStorage.setItem("account", account);
    }
  }, [account]);

  return (
    <>
      {networkError ? (
        <div className="network-error">
          Network connection error. Please check your connection and refresh.
        </div>
      ) : (
        <>
          <Navigation web3Handler={web3Handler} />
          <Routes>
            <Route path="/" element={<Front />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/register" element={<Register />} />
            <Route path="nft" element={<NFT />} />
            <Route path="nft-details" element={<NFTDetails />} />
            <Route path="certificate" element={<Certificate />} />
            <Route path="payment" element={<MainScreen />} />
            <Route path="*" element={<Front />} />
          </Routes>
        </>
      )}
    </>
  );
}

export default App;
