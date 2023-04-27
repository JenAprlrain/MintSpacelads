import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import './App.js';
import './App.css';
import planet1 from './images/planet1.png';
import consoleImage from './images/console.gif';
import NFTABI from './contracts/NFTABI.json';
import stakingABI from './contracts/stakingABI.json';
import ZonkABI from './contracts/ZonkABI.json';
import Logo1 from './images/Planet Rymoth.png';

function StakingPage() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [tokenContract, setTokenContract] = useState(null);
  const [stakingContract, setStakingContract] = useState(null);
  const [stakedNFTs, setStakedNFTs] = useState([]);
  const [nftContract, setNftContract] = useState(null);
  const [userNFTs, setUserNFTs] = useState([]);
  const [totalRareAlienNFTsEmitted, setTotalRareAlienNFTsEmitted] = useState(0);
  const [nftImages, setNFTImages] = useState([]);
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [numStaked, setNumStaked] = useState(0);
  const [StakedNftImages, setStakedNFTImages] = useState([]);
  const [selectedStakedNFTs, setSelectedStakedNFTs] = useState([]);

 




  const NFTAddress = "0xE6658Ec41bEf9965FD69F193fB8FDe7E31408681";
  const stakingAddress = "0xB5ff5A517cA8B8eE10c0226C0415830A6953b667";
  const tokenAddress = "0xF1DE2d2Dbd3EC14818D6F3f1580dadf371cd51d6";

  useEffect(() => {
    async function setupWeb3() {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      setWeb3(web3);
      const accounts = await web3.eth.getAccounts();
      setAccounts(accounts);
      const nftContract = new web3.eth.Contract(NFTABI, NFTAddress);
      setNftContract(nftContract);
      const tokenContract = new web3.eth.Contract(ZonkABI, tokenAddress);
      setTokenContract(tokenContract);
      const stakingContract = new web3.eth.Contract(stakingABI, stakingAddress);
      setStakingContract(stakingContract);
    }
  
    setupWeb3();
  }, []);

  async function handleConnectWallet() {
    const web3 = new Web3(window.ethereum);
    await window.ethereum.enable();
    setWeb3(web3);
  }
  
  useEffect(() => {
    async function updateNFTs() {
      if (web3 && accounts.length > 0) {
        const userAddress = accounts[0];
        const userNFTs = await nftContract.methods.walletOfOwner(userAddress).call();
        setUserNFTs(userNFTs);
      }
    }
  
    updateNFTs();
  }, [web3, accounts, nftContract, setUserNFTs]);

  async function updateNFTImages() {
    if (web3 && accounts.length > 0 && nftContract) {
      const promises = userNFTs.map(async (nftID) => {
        const tokenURI = await nftContract.methods.tokenURI(nftID).call();
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
      await getStakedNFTs();
    }
    fetchData();
  }, [userNFTs]);
  

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      await updateNFTImages();
      const cards = document.querySelectorAll('.nft-card');
      cards.forEach((card) => {
        card.addEventListener('click', () => {
          card.classList.toggle('selected');
        });
      });
    }
    fetchData();
  }, [userNFTs, stakedNFTs]);
  
  
  const handleNFTCardClick = (nftId) => {
    setSelectedNFTs((prevSelectedNFTs) => {
      const index = prevSelectedNFTs.indexOf(nftId);
      if (index === -1) {
        if (selectedNFTs.length === 4) {
          return prevSelectedNFTs;
        }
        setNumStaked(selectedNFTs.length + 1);
        return [...prevSelectedNFTs, nftId];
      } else {
        setNumStaked(selectedNFTs.length - 1);
        return [...prevSelectedNFTs.slice(0, index), ...prevSelectedNFTs.slice(index + 1)];
      }
    });
  };

  const handleStakedNFTCardClick = (nftId) => {
    setSelectedStakedNFTs((prevSelectedStakedNFTs) => {
      const index = prevSelectedStakedNFTs.indexOf(nftId);
      console.log('prevSelectedStakedNFTs:', prevSelectedStakedNFTs);
      console.log('index:', index);
      console.log('nftId:', nftId);
      
      if (index === -1) {
        return [...prevSelectedStakedNFTs, nftId];
      } else {
        return [...prevSelectedStakedNFTs.slice(0, index), ...prevSelectedStakedNFTs.slice(index + 1)];
      }
    });
  };
  
  
   async function handleStake(selectedNFTs) {
    if (stakingContract && nftContract) {
      const tokenIds = selectedNFTs.map(id => parseInt(id));
      const receipt = await stakingContract.methods.stake(tokenIds).send({ from: accounts[0], gas: 5000000 });
      setSelectedNFTs([]);
    }
  }

  async function getStakedNFTs() {
    if (stakingContract && nftContract) {
      const stakedNFTIds = await stakingContract.methods.tokensOfOwner(accounts[0]).call();
      console.log("staked tokens:", stakedNFTIds);
      const promises = stakedNFTIds.map(async (nftId) => {
        const tokenURI = await nftContract.methods.tokenURI(nftId).call();
        const response = await fetch(`https://ipfs.io/ipfs/${tokenURI.replace("ipfs://", "")}`);
        const data = await response.json();
        return { id: nftId, name: data.name, image: `https://ipfs.io/ipfs/${data.image.replace("ipfs://", "")}` };
      });
      const stakedNFTs = await Promise.all(promises);
      setStakedNFTImages(stakedNFTs);
    }
  }

  async function unstakeNFTs(selectedStakedNFTs) {
    try {
      if (stakingContract && accounts.length > 0) {
        const tokenIds = selectedStakedNFTs.map((id) => parseInt(id));
        const receipt = await stakingContract.methods.unstake(tokenIds).send({ from: accounts[0], gas: 5000000 });
        setSelectedStakedNFTs([]);
        await getStakedNFTs(); // Update the staked NFTs after unstaking
      }
    } catch (error) {
      console.error('Error unstaking NFTs:', error);
    }
  }
  
  
  async function enable() {
    nftContract.methods.setApprovalForAll(stakingAddress, true).send({ from: accounts[0] });
  }

  return (
    <div className="staking-page">
        <header>SPACELADS STAKING</header>
        <button onClick= {enable} className= "base-button" style={{ position: "absolute", top: "60px", left: "800px" }}>Enable Staking</button>
        <div className="enable-info">
      <p>You Must First Enable Staking The First Time You Stake With Your Wallet</p>
      </div>
      <br></br>
      <br></br>
      <br></br>
      <div className= "back-to-base">
      <button className= "base-button" style={{ position: "absolute", top: "3px", left: "30px" }} onClick={() => navigate("/")}>Back to Base</button>
      </div>
      <div style={{position: 'relative'}}>
        <div className="staking-container">
          <div className="stake-info">
            <p>Staked SpaceLads: {stakedNFTs.length > 0 ? stakedNFTs.join(", ") : "None"}</p>
            <p>Total Mined:  $LADS</p>
            <p>Last claimed: </p>
          </div>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <div className="stake-buttons">
            {accounts.length > 0 ? (
              <>
                <button onClick={() => handleStake(selectedNFTs)}>Stake selected Aliens</button>
                <button onClick={() => unstakeNFTs(selectedStakedNFTs)}> Unstake selected Aliens</button>
              </>
            ) : (
              <button onClick={() => handleConnectWallet()}>Connect wallet</button>
            )}
          </div>
        </div>
        <div className="claim-rewards">
          <button>Claim rewards</button>
        </div>
        <div className="nft-container1">
  <div className="inventory-title">Staked SpaceLads</div>
  {StakedNftImages.map((nft) => (
    <div
    className={selectedStakedNFTs.includes(nft.id) ? "nft-card1 selected" : "nft-card1"}
    key={`staked-${nft.id}`}
    onClick={() => handleStakedNFTCardClick(nft.id)}
    style={selectedStakedNFTs.includes(nft.id) ? { border: "3px solid #39ff14" } : {}}>
      <img className="nft-image1" src={nft.image} alt="NFT" />
      <div className="nft-name1">{nft.name}</div>
      {stakedNFTs.includes(nft.id) && (
      <div className="staked-overlay">STAKED</div>
      )}
       </div>
       ))}
         </div>
        <div className="nft-container1">
          <div className="inventory-title">Inventory</div>
          {nftImages.map((nft) => (
           <div className={stakedNFTs.includes(nft.id) ? "nft-card1 staked" : "nft-card1"} key={nft.id} onClick={() => handleNFTCardClick(nft.id)} style={selectedNFTs.includes(nft.id) ? { border: "3px solid #39ff14" } : {}}>
           <img className="nft-image1" src={nft.image} alt="NFT" />
           <div className="nft-name1">{nft.name}</div>
           {stakedNFTs.includes(nft.id) && <div className="staked-overlay">STAKED</div>}
         </div>         
          ))}
        </div>
      </div>
      </div>
  );
      }
      export default StakingPage;