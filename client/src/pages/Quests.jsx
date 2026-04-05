import React, { useEffect, useState } from 'react';
import {
  fetchMe,
  connectTwitter,
  fetchQuests,
  completeQuest,
  saveWallet
} from '../services/api';
import './Quests.css';
import xIcon from '../assets/X_logo.svg';
import discordIcon from '../assets/discord.svg';


const IMAGE_URL = 'https://ordineko.xyz/tweetcard.html';

export default function Quests() {
  const [user, setUser] = useState(undefined);
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletInput, setWalletInput] = useState('');
  const [readyToCheck, setReadyToCheck] = useState({});
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchMe()
      .then(d => {
        setUser(d.user);
      })
      .catch(() => {
        setUser({ completedQuests: [], wallet: '' });
      });
  }, []);

  useEffect(() => {
    fetchQuests()
      .then(d => {
        setQuests(d.quests || []);
      })
      .catch(() => {
        setQuests([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (user === undefined || loading) {
    return <div className="quests__loading">Loading…</div>;
  }

  const completed = Array.isArray(user.completedQuests)
    ? user.completedQuests
    : [];
  const wallet = typeof user.wallet === 'string' ? user.wallet : '';
  const isConnected = Boolean(user && user.twitterId);

  const runComplete = id => {
    completeQuest(id)
      .then(d => {
        setUser(u => ({ ...u, completedQuests: d.completedQuests }));
      })
      .catch(err => {
        setErrorMsg(err.error || 'Please complete the task on X first.');
      });
  };

  const handleSaveWallet = () => {
    if (!walletInput) return;
    saveWallet(walletInput)
      .then(d => {
        setUser(u => ({ ...u, wallet: d.wallet }));
      })
      .catch(() => {
        setErrorMsg('Failed to save the wallet.');
      });
  };

  return (
    <div className="home">
      {errorMsg && (
        <div className="modal-backdrop">
          <div className="modal">
            <p className="modal__text">{errorMsg}</p>
            <button className="modal__close" onClick={() => setErrorMsg('')}>
              OK
            </button>
          </div>
        </div>
      )}

      <header className="home__logo">neko</header>

      <div className="quests__container">
        <h1 className="quests__title">Your Quests</h1>
        <div className="quests__box">
          {quests.map(q => {
            const isFirst = q.id === 1;

            let status;
            if (isFirst) {
              status = isConnected ? 'completed' : 'pending';
            } else if (!isConnected) {
              status = 'disabled';
            } else if (completed.includes(q.id)) {
              status = 'completed';
            } else {
              status = 'active';
            }

            let btnText;
            if (isFirst) {
              btnText = isConnected ? 'Connected' : 'Connect';
            } else if (status === 'disabled') {
              btnText = 'Locked';
            } else if (status === 'completed') {
              btnText = 'Completed';
            } else {
              btnText = readyToCheck[q.id] ? 'Check' : 'Execute';
            }

            const disabled = isFirst ? isConnected : status !== 'active';

            const onClick = () => {
              // Quest #1: Connect X
              if (isFirst && !isConnected) {
                return connectTwitter();
              }

              // Если ещё не нажато Execute → Check
              if (!readyToCheck[q.id]) {
                if (q.id === 4) {
                  // Собираем URL Intent с разделением text и url
                  const text = q.text || q.hashtag || '';
                  // Подставляем ссылку в параметр url, чтобы Twitter Composer сделал карточку
                  const intentUrl =
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      text
                    )}` +
                    `&url=${encodeURIComponent(IMAGE_URL)}`;

                  window.open(intentUrl, '_blank');
                } else {
                  // Обычный Intent для всех остальных
                  const intentUrl =
                    q.url ||
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      q.text || q.hashtag || ''
                    )}`;
                  window.open(intentUrl, '_blank');
                }
                // отмечаем, что теперь кнопка меняется на "Check"
                return setReadyToCheck(r => ({ ...r, [q.id]: true }));
              }

              // Если в режиме Check — проверяем квест
              runComplete(q.id);
            };

            return (
              <div key={q.id} className={`quest-card quest-card--${status}`}>
                <span className="quest-card__title">{q.title}</span>
                <button
                  className="quest-card__btn"
                  disabled={disabled}
                  onClick={onClick}
                >
                  {btnText}
                </button>
              </div>
            );
          })}

          {isConnected &&
            completed.includes(3) &&
            completed.includes(5) &&
            !wallet && (  
              <div className="wallet-input">
                <input
                  type="text"
                  className="input"
                  placeholder="Enter your wallet address"
                  value={walletInput}
                  onChange={e => setWalletInput(e.target.value)}
                />
                <button onClick={handleSaveWallet}>Save Wallet</button>
              </div>
            )}
        </div>
      </div>

      <footer className="home__footer">
        <a
          href="https://x.com/ordineko"
          target="_blank"
          rel="noreferrer"
        >
          <img src={xIcon} alt="X" className="social-icon" />
        </a>
        <a
          href="https://discord.gg/FcyyEAXAmW"
          target="_blank"
          rel="noreferrer"
        >
          <img src={discordIcon} alt="Discord" className="social-icon" />
        </a>
      </footer>
    </div>
  );
}
