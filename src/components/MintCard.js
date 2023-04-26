import React from 'react';
import '../App.css';

const MintCard = ({ chainName, icon, price, sold, total, onMint, comingSoon }) => {
  const [amount, setAmount] = React.useState(1);

  const handleMint = () => {
    onMint(amount);
  };

  return (
    <div className="mint-card">
      {icon}
      <h2>{chainName}</h2>
      <p>Price: {price} {chainName}</p>
      <p>
        Minted: {sold} / {total}
      </p>
      {comingSoon ? (
        <p className="coming-soon">Coming Soon</p>
      ) : (
        <div className="mint-inputs">
          <label>
            Quantity:
            <input
              type="number"
              value={amount}
              min="1"
              max="666"
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <button onClick={handleMint}>Mint NFTs</button>
        </div>
      )}
    </div>
  );
};

export default MintCard;