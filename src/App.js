import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Web3 from 'web3';
import './App.css';
import NFTABI from './contracts/NFTABI.json';
import ufo from './images/ufo.gif';
import img1 from "./images/211.png";
import img2 from "./images/212.png";
import img3 from "./images/213.png";
import img4 from "./images/214.png";
import img5 from "./images/215.png";
import img6 from "./images/216.png";

function App() {
  const [account, setAccount] = useState('');
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mintedTokenIds, setMintedTokenIds] = useState([]);
  const [totalSupply, setTotalSupply] = useState(0);
  const [numNFTs, setNumNFTs] = useState(1);
  const [userNFTs, setUserNFTs] = useState([])
  const [nftImages, setNFTImages] = useState([]);

  const handleNumNFTsChange = (event) => {
    setNumNFTs(event.target.value);
  };

  const abi = NFTABI;
  const contractAddress = "0xE6658Ec41bEf9965FD69F193fB8FDe7E31408681";

  const [imagePositions, setImagePositions] = useState([
    { image: img1, top: -200 },
    { image: img2, top: -200 },
    { image: img3, top: -200 },
    { image: img4, top: -200 },
    { image: img5, top: -200 },
    { image: img6, top: -200 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setImagePositions((prevPositions) => {
        const newPositions = [...prevPositions];
        for (let i = 0; i < newPositions.length; i++) {
          const speed = Math.floor(Math.random() * 10) + 5;
          newPositions[i].top += speed;
          if (newPositions[i].top > window.innerHeight) {
            newPositions[i].top = -200;
          }
        }
        return newPositions;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    const initializeWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
  
          const contractInstance = new web3Instance.eth.Contract(abi, contractAddress);
          setContract(contractInstance);
  
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);
        } catch (error) {
          console.error(error);
        }
      } else {
        console.error('Please install MetaMask');
      }
    };
  
    initializeWeb3();
  }, []);
  

  const handleConnectWallet = async () => {
    try {
      await window.ethereum.enable();
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };


  const handleMint = async () => {
    const onlyWhitelisted = false; // Set this value based on your contract
    const preSaleCost = 0.2; // Set this value based on your contract
    const cost = 0.5; // Set this value based on your contract
   // Calculate the amount of Ether required based on the selected quantity
  const _mintAmount = quantity;
  const requiredAmount = onlyWhitelisted ? preSaleCost * _mintAmount : cost * _mintAmount;

    // Convert the required amount to Wei
    const payableAmount = web3.utils.toWei(requiredAmount.toString(), "ether");

    try {
      const tokenIdsToMint = [];
      for (let i = 0; i < quantity; i++) {
        const mintResult = await contract.methods.mint(quantity).send({
          from: account,value: payableAmount,gas: 3000000,
        });
        const mintedTokenId = mintResult.events.Transfer.returnValues.tokenId;
        tokenIdsToMint.push(mintedTokenId);
      }
      setMintedTokenIds(tokenIdsToMint);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    console.log("starting get total supply");
    async function getTotalSupply() {
      if (contract) {
        const supply = await contract.methods.totalSupply().call();
        console.log("Total supply:", supply);
        setTotalSupply(supply);
      }
    }
    getTotalSupply();
  }, [contract]);


  const maxSupply =666

  useEffect(() => {
    async function updateNFTs() {
      if (web3 && account.length > 0 && contract) {
        const userAddress = account; 
        const contractABI = NFTABI;
        const contractAddress = "0xE6658Ec41bEf9965FD69F193fB8FDe7E31408681";
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        const userNFTs = await contract.methods.walletOfOwner(userAddress).call();
        setUserNFTs(userNFTs);
      }
    }    
  
    updateNFTs();
  }, [web3, account, contract, setUserNFTs]);

  async function updateNFTImages() {
    if (web3 && account.length > 0 && contract) {
      const promises = userNFTs.map(async (nftID) => {
        const tokenURI = await contract.methods.tokenURI(nftID).call();
        const response = await fetch(`https://ipfs.io/ipfs/${tokenURI.replace("ipfs://", "")}`);
        const data = await response.json();
        return { id: nftID, name: data.name, image: `https://ipfs.io/ipfs/${data.image.replace("ipfs://", "")}` };
      });
  
      const nftImages = await Promise.all(promises);
      setNFTImages(nftImages);
    }
  }
  
  useEffect(() => {
    async function fetchData() {
      await updateNFTImages();
    }
    fetchData();
  }, [userNFTs]);

  function handleReset() {
    window.location.reload();
  }

  const navigate = useNavigate();


  return (
    <div className="App">
      <header>SPACELADS</header>
      <img src={ufo} alt="ufo" style={{ width: "10%"}} />
      <button onClick={handleConnectWallet} className="connect-wallet-btn">
        Connect Wallet
      </button>
      <div className= "back-to-base">
      <button className= "base-button" style={{ position: "absolute", top: "3px", left: "30px" }} onClick={() => navigate("/staking")}>STAKE SPACELADS</button>
      </div>
      <div className="connect-wallet">
        <p>Connected Account: {account && `${account.slice(0, 6)}...${account.slice(-4)}`}</p>
      </div>
      <div className="moving-images">
        {imagePositions.map((position, index) => (
          <img
            key={index}
            src={position.image}
            alt={`moving image ${index}`}
            style={{ top: position.top }}
          />
        ))}
      </div>
      <div className="card">
        <div className="price">
          {10} MATIC
        </div>
        <div className="total">
          <p> {totalSupply} / {maxSupply} minted</p>
        </div>
        <div className="selector">
          <div className="selector-label">
            <label htmlFor="num-nfts">Number of NFTs to mint:</label>
          </div>
          <input
            type="number"
            id="num-nfts"
            value={numNFTs}
            onChange={handleNumNFTsChange}
            min={1}
            max={666}
          />
        </div>
        <button onClick={handleMint}>Mint</button>
      </div>
      <br></br>
      <br></br>
      <br></br>
      <div className="view">
        <button onClick={handleReset} className="view-btn">View Your Minted SPACELADS</button>
      </div>
      <div className="nft-images">
        {nftImages.map((nft) => (
          <div key={nft.id} className="nft-card">
            <img
              src={nft.image}
              alt={nft.name}
              className="nft-image"
            />
            <p>{nft.name}</p>
          </div>
        ))}
      </div>
    </div>
  );  
}

export default App;
