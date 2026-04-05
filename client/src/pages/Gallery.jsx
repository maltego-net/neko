import React, { useState, useEffect } from 'react';
import './Gallery.css';
import xIcon from '../assets/X_logo.svg';
import discordIcon from '../assets/discord.svg';

const MAX_ID = 7;

export default function Gallery() {
  const [tokenId, setTokenId] = useState('');
  const [nftData, setNftData] = useState(null);
  const [error, setError] = useState('');

  const fetchNFT = async (id) => {
    try {
      const res = await fetch(`/metadata/${id}.json`);
      if (!res.ok) throw new Error('NFT not found');
      const data = await res.json();
      setNftData(data);
      setTokenId(String(id));
      setError('');
    } catch {
      setNftData(null);
      setError('NFT not found');
    }
  };

  const handleRandom = () => {
    const id = Math.floor(Math.random() * MAX_ID) + 1;
    fetchNFT(id);
  };

  const handleSearch = () => {
    if (!tokenId) return;
    fetchNFT(tokenId);
  };

  const handleShare = () => {
    const text = `Check out Ordineko #${tokenId}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { handleRandom(); }, []);

  return (
    
  <div className="home">
    <header className="home__logo">neko</header>
    <div className="quests__container">
      <div className="quests__box">
        {nftData && (
          <div className="gallery__nft">
            <div className="gallery__image-frame">
              <img src={nftData.image} alt={nftData.name} className="gallery__image" />
            </div>
            <h2 className="gallery__title">{nftData.name}</h2>
          </div>
        )}
        

        <div className="gallery__controls">
          <span className="gallery__label">Ordineko</span>

          <div className="gallery__input-wrapper">
            <input
              type="number"
              className="input"
              placeholder="ID"
              value={tokenId}
              onChange={e => setTokenId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <button className="gallery__dice-btn" onClick={handleRandom} title="Random ID">
              <img src="dice.svg" alt="🎲" />
            </button>
          </div>

          <button className="gallery__btn" onClick={handleSearch}>Search</button>
          <button className="gallery__btn" onClick={handleShare}>Flex your NEKO on X!</button>
        </div>

        {error && <p className="gallery__error">{error}</p>}
      </div>
    </div>

    <footer className="home__footer">
      <a href="https://x.com/ordineko" target="_blank" rel="noreferrer">
        <img src={xIcon} alt="X" className="social-icon" />
      </a>    
      <a href="https://discord.gg/FcyyEAXAmW" target="_blank" rel="noreferrer">
        <img src={discordIcon} alt="Discord" className="social-icon" />
      </a>
    </footer>
  </div>
);
}
