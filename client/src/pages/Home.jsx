import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import MagneticButton from '../components/magneticbutton';
import StaticDustButton from '../components/StaticDustButton';
import MintButton from '../components/mintbuton';
import xIcon from '../assets/X_logo.svg';
import discordIcon from '../assets/discord.svg';
import catMain from '../assets/cat2.png';
import { motion } from 'framer-motion';
import catN   from '../assets/cats/cat_N_1.PNG';
import catN1  from '../assets/cats/cat_N_2.PNG';
import catE   from '../assets/cats/cat_E_1.PNG';
import catE1  from '../assets/cats/cat_E_2.PNG';
import catK   from '../assets/cats/cat_K_1.PNG';
import catK1  from '../assets/cats/cat_K_2.PNG';
import catO   from '../assets/cats/cat_O_1.PNG';
import catO1  from '../assets/cats/cat_O_2.PNG';

const overlays = [
  {
    row: 0,
    wordIndex: 2,
    charIndex: 3,
    src: catO1,
    offsetX: -0.1,   
    offsetY: -0.1,
    scale: 3.2       
  },
  {
    row: 1,
    wordIndex: 0,
    charIndex: 0,
    src: catN,
    offsetX: 13.1,
    offsetY: -0.96,
    scale: 1.9
  },
  {
    row: 2,
    wordIndex: 0,
    charIndex: 0,
    src: catN1,
    offsetX: 3.2,
    offsetY: -0.96,
    scale: 1.9
  },
  {
    row: 0,
    wordIndex: 3,
    charIndex: 2,
    src: catE,
    offsetX: 2.65,
    offsetY: 0.76,
    scale: 2.3
  },
    {
    row: 1,
    wordIndex: 2,
    charIndex: 3,
    src: catO,
    offsetX: 0,     
    offsetY: 0.33,   
    scale: 2.2       
  },
  {
    row: 0,
    wordIndex: 1,
    charIndex: 1,
    src: catE1,
    offsetX: -0.3,
    offsetY: 2.42,
    scale: 2.1
  },
  {
    row: 0,
    wordIndex: 0,
    charIndex: 0,
    src: catK,
    offsetX: 1.5,
    offsetY: 0.03,
    scale: 2.2
  },
  {
    row: 1,
    wordIndex: 2,
    charIndex: 2,
    src: catK1,
    offsetX: 3.3,
    offsetY: 2.05,
    scale: 2
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: 'easeOut',
    },
  }),
};


export default function Home() {
  const nav = useNavigate();
  const [useStatic, setUseStatic] = useState(false);

  useEffect(() => {
    const check = () => {
      const hasTouch =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches;
      setUseStatic(hasTouch || window.innerWidth <= 768);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const wordsPerRow      = 5;
  const rowsCount        = 4;
  const lettersPerWord   = 4;  

  const renderRow = (rowIdx) => (
    <div key={rowIdx} className="home__row-text">
      {Array(wordsPerRow).fill('NEKO').map((word, wIdx) =>
        Array.from(word).map((ch, cIdx) => {
          const ov = overlays.find(o =>
            o.row === rowIdx &&
            o.wordIndex === wIdx &&
            o.charIndex === cIdx
          );


          return (
            <span key={`${rowIdx}-${wIdx}-${cIdx}`} className="letter">
              {ch}
              {ov && (
                <img
                  src={ov.src}
                  alt=""
                  className="overlay-img"
                  style={{
                    top:   `${ov.offsetY}em`,
                    left:  `${ov.offsetX}em`,
                    transform: `scale(${ov.scale})`
                  }}
                />
              )}
            </span>
          );
        })
      )}
    </div>
  );

  return (
  <motion.div
    className="home"
    initial="hidden"
    animate="visible"
    variants={fadeInUp}
  >
    <motion.header className="home__logo" variants={fadeInUp} custom={1}>
      neko
    </motion.header>

    <motion.div className="home__center" variants={fadeInUp} custom={2}>
      <picture className="home__cat">
        <source srcSet={catMain} type="image/png" />
        <img src={catMain} alt="Lucky Cat" />
      </picture>

      <div className="home__btn-wrapper">
        {useStatic
          ? <StaticDustButton onClick={() => nav('/quests')} label="START" />
          : <MagneticButton onClick={() => nav('/quests')} label="START" />}
      </div>

      <div className="home__btn-wrapper_mint">
        {useStatic
          ? <MintButton onClick={() => nav('/gallery')} label="START" />
          : <MintButton onClick={() => nav('/gallery')} label="START" />}
      </div>
    </motion.div>

    <motion.footer className="home__footer" variants={fadeInUp} custom={3}>
      <a href="https://x.com/ordineko" target="_blank" rel="noreferrer">
        <img src={xIcon} alt="X" className="social-icon" />
      </a>
      <a href="https://discord.gg/FcyyEAXAmW" target="_blank" rel="noreferrer">
        <img src={discordIcon} alt="Discord" className="social-icon" />
      </a>
    </motion.footer>

    <motion.div className="home__rows" variants={fadeInUp} custom={4}>
      {Array.from({ length: rowsCount }).map((_, i) => renderRow(i))}
    </motion.div>
  </motion.div>
);
}
