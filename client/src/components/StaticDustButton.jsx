// StaticDustButton.jsx
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import './StaticDustButton.css';

// Статичный ресурс кнопки
import staticBtnImg from '../assets/Group_1.png';

export default function StaticDustButton({ onClick, label }) {
  // Генерируем массив частиц, рассредоточенных за пределами кнопки
  const particles = useMemo(() => {
    return Array.from({ length: 100 }, (_, i) => {
      const angle = Math.random() * 2 * Math.PI;
      const radius = 65 + Math.random() * 25; // диапазон радиуса 60%-100%
      const left = 50 + radius * Math.cos(angle);
      const top = 50 + radius * Math.sin(angle);
      return {
        id: i,
        left: `${left}%`,  
        top: `${top}%`,
        delay: Math.random() * 2,
      };
    });
  }, []);

  return (
    <div className="static-btn-container" onClick={onClick}>
      <img src={staticBtnImg} alt="Button" className="static-btn-img" />

      {label && (
        <span className="static-btn-text">
          {label}
        </span>
      )}

      {particles.map(({ id, left, top, delay }) => (
        <motion.div
          key={id}
          className="particle"
          style={{ left, top }}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: [0, 1, 0], scale: [0.1, 0.4, 0.1] }}
          transition={{
            duration: 2,
            ease: 'easeInOut',
            repeat: Infinity,
            delay,
          }}
        />
      ))}
    </div>
  );
}
