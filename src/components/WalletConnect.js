import React, { useState } from 'react';
import '../App.css';

const WalletConnect = () => {
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState('');

  

  return (
    <div className="wallet-connect">
      {address ? (
        <>
          <span>Connected: {address}</span>
          <button>Disconnect</button>
        </>
      ) : (
        <button>Connect Wallet</button>
      )}
    </div>
  );
};

export default WalletConnect;
