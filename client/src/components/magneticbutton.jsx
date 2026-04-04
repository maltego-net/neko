import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import './MagneticButton.css';

// Инлайн SVG: основная кнопка и фрагменты
import { ReactComponent as MainButtonSvg } from '../assets/fragments/button_frag.svg';
import { ReactComponent as FragBLSvg } from '../assets/fragments/frag_bot_l.svg';
import { ReactComponent as FragBRSvg } from '../assets/fragments/frag_bott_r.svg';
import { ReactComponent as FragMLSvg } from '../assets/fragments/frag_mid_l.svg';
import { ReactComponent as FragMRSvg } from '../assets/fragments/frag_mid_r.svg';
import { ReactComponent as FragTLSvg } from '../assets/fragments/frag_top_l.svg';
import { ReactComponent as FragTRSvg } from '../assets/fragments/frag_top_r.svg';

// Конфиг осколков (SVG-компонент, позиция, стартовые координаты)
const fragments = [
  { Svg: FragBLSvg, position: { top: '50%', left: '23%' }, initial: { x: -30, y: 20, rotate: -20 }, size: '40px' },
  { Svg: FragBRSvg, position: { top: '62%', left: '75%' }, initial: { x: 30, y: 25, rotate: 15 }, size: '14px' },
  { Svg: FragMLSvg, position: { top: '40%', left: '14.7%' }, initial: { x: -20, y: -20, rotate: -15 }, size: '16px' },
  { Svg: FragMRSvg, position: { top: '25%', left: '73.6%' }, initial: { x: 20, y: -20, rotate: 10 }, size: '19px' },
  { Svg: FragTLSvg, position: { top: '5%', left: '21.7%' }, initial: { x: -15, y: -30, rotate: 5 }, size: '17px' },
  { Svg: FragTRSvg, position: { top: '-10%', left: '59%' }, initial: { x: 15, y: -30, rotate: -10 }, size: '30px' }
];

// Параметры анимации
const floatConfig = { distance: 5, sway: 5, duration: 6 };
const hoverSpring = { type: 'spring', stiffness: 200, damping: 20 };

const variants = {
  initial: ({ initial }) => ({
    x: initial.x,
    y: initial.y,
    rotate: initial.rotate,
    transition: { duration: 0.5, ease: 'easeOut' }
  }),
  float: ({ initial }) => ({
    x: initial.x,
    y: [initial.y, initial.y - floatConfig.distance, initial.y + floatConfig.distance, initial.y],
    rotate: [initial.rotate, initial.rotate + floatConfig.sway, initial.rotate - floatConfig.sway, initial.rotate],
    transition: { duration: floatConfig.duration, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }
  }),
  hovered: ({ index }) => ({
    x: 0, y: 0, rotate: 0,
    transition: { ...hoverSpring, delay: index * 0.03 }
  })
};

/**
 * Магнитная кнопка с inline SVG и четким glow-фильтром
 */
export default function MagneticButton({ onClick, label = 'NEKO' }) {
  const controls = useAnimation();
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    controls.start('float');
  }, [controls]);

  const handleHoverStart = () => {
    setHovered(true);
    controls.start('hovered');
  };
  const handleHoverEnd = () => {
    setHovered(false);
    controls.start('initial').then(() => controls.start('float'));
  };

  return (
    <div
      className="magnetic-btn"
      onClick={onClick}
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
      onTouchStart={handleHoverStart}
      onTouchEnd={handleHoverEnd}
    >
      {/* Основной SVG с внутренним vector glow */}
      <motion.div
        className="magnetic-btn__svg-wrapper"
        // Без CSS-фильтров: glow встроен в SVG в <filter id="glow">
      >
        <MainButtonSvg width="70%" height="100%" />
      </motion.div>

      {/* Текст */}
      <div className={`mb-text-container${hovered ? ' hovered' : ''}`}>  
        {[...label].map((ch, i) => (
          <span key={i} className="mb-letter">{ch}</span>
        ))}
      </div>

      {/* Inline-фрагменты с анимацией */}
      {fragments.map((f, i) => (
        <motion.div
          key={i}
          className="magnetic-btn__frag"
          variants={variants}
          custom={{ initial: f.initial, index: i }}
          initial="initial"
          animate={controls}
          style={{ top: f.position.top, left: f.position.left, width: f.size, height: f.size }}
        >
          <f.Svg width="100%" height="100%" />
        </motion.div>
      ))}
    </div>
  );
}
