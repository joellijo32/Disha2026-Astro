import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import heroBackground from '../assets/kalyani_background_2.webp';
import Header from './Header';

const calculateTimeLeft = () => {
  const difference = new Date('2026-03-27T00:00:00').getTime() - new Date().getTime();
  if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};

const AnimatedUnit = ({ value, unit }) => (
  <div className="flex items-baseline gap-[2px]">
    <div className="relative flex justify-center items-center overflow-hidden h-[1.2em] min-w-[1.2em] md:min-w-[1.4em] text-[#FFFFFF] font-display">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
    <span className="text-[#B829EA] font-black text-[10px] md:text-xs tracking-tighter -translate-y-1.5 md:-translate-y-2.5 font-display">
      {unit}
    </span>
  </div>
);

// New component for individual confetti pieces
const ConfettiPiece = ({ color, size, top, left, delay }) => (
  <motion.div
    className={`absolute rounded-full pointer-events-none opacity-60 mix-blend-screen`}
    style={{
      backgroundColor: color,
      width: size,
      height: size,
      top: `${top}%`,
      left: `${left}%`,
    }}
    animate={{
      y: [0, 20, 0],
      rotate: [0, 360],
      scale: [1, 1.2, 1],
    }}
    transition={{
      duration: 3,
      delay: delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

const HeroSection = () => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const titleTextClasses = "text-8xl md:text-[10rem] lg:text-[14rem] font-extrabold tracking-tighter font-['Sedgwick_Ave_Display',_cursive]";
  const titleString = "Disha '26";

  return (
    <div id="home" className="relative h-[85svh] md:h-screen w-full bg-[#10152B] text-[#FFFFFF] flex flex-col font-sans overflow-hidden">
      
      <motion.img 
        src={heroBackground} 
        alt="Hero Background"
        initial={{ scale: 1.15 }}
        animate={{
          x: [0, 7, 10, 7, 0, -7, -10, -7, 0],
          y: [-10, -7, 0, 7, 10, 7, 0, -7, -10],
          rotate: [0, 0.2, 0.4, 0.2, 0, -0.2, -0.4, -0.2, 0]
        }}
        transition={{
          repeat: Infinity,
          duration: 12,
          ease: "linear"
        }}
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 pointer-events-none"
      />

      <motion.div
        animate={{
          x: [0, 4, -4, 2, 0],
          y: [0, 4, -2, -4, 0]
        }}
        transition={{
          repeat: Infinity,
          duration: 0.2,
          ease: "linear"
        }}
        className="absolute -inset-[10px] z-5 opacity-25 mix-blend-overlay pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:6px_6px]"
      ></motion.div>

      <div className="hidden md:block absolute inset-0 z-6 opacity-10 mix-blend-overlay pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnPjxmaWx0ZXIgaWQ9J24nPjxmZVR1cmJ1bGVuY2UgdHlwZT0nZnJhY3RhbE5vaXNlJyBiYXNlRnJlcXVlbmN5PScwLjc1JyBudW1PY3RhdmVzPSczJyBzdGl0Y2hUaWxlcz0nc3RpdGNoJy8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9JzEwMCUnIGhlaWdodD0nMTAwJScgZmlsdGVyPSd1cmwoI24pJy8+PC9zdmc+')]"></div>

      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-linear-to-t from-black to-transparent z-10 pointer-events-none"></div>


      <Header />

      <main className="relative z-20 flex flex-col items-center justify-center grow px-4 text-center -mt-16 md:-mt-16 lg:-mt-24">


        <div className="relative mb-6 md:mb-10 w-fit mx-auto whitespace-nowrap z-0 flex items-center justify-center">
          <h1 className={`absolute z-0 ${titleTextClasses} text-[#DE005F] [-webkit-text-stroke:10px_#DE005F] md:[-webkit-text-stroke:18px_#DE005F] drop-shadow-[0_0_15px_rgba(222,0,95,0.8)]`}>
            {titleString}
          </h1>

          <h1 className={`relative z-20 ${titleTextClasses} text-[#FFFFFF]`}>
            {titleString}
          </h1>
        </div>
        <div className="text-lg md:text-2xl lg:text-3xl font-black uppercase tracking-widest flex items-center gap-2 md:gap-4 bg-[#1a1525]/90 px-6 py-3 md:px-8 md:py-4 rounded-full border border-white/5 relative z-10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <AnimatedUnit value={timeLeft.days.toString().padStart(2, '0')} unit="D" />
          <span className="text-[#FFFFFF] opacity-40">:</span>
          <AnimatedUnit value={timeLeft.hours.toString().padStart(2, '0')} unit="H" />
          <span className="text-[#FFFFFF] opacity-40">:</span>
          <AnimatedUnit value={timeLeft.minutes.toString().padStart(2, '0')} unit="M" />
          <span className="text-[#FFFFFF] opacity-40">:</span>
          <AnimatedUnit value={timeLeft.seconds.toString().padStart(2, '0')} unit="S" />
        </div>

        <button className="mt-8 px-12 py-3.5 bg-[#DE005F] text-white text-sm font-bold uppercase tracking-[0.2em] hover:bg-[#b8004e] active:scale-95 transition-all duration-200 select-none whitespace-nowrap relative z-10 shadow-xl font-display">
          Register
        </button>
      </main>

      <div className="absolute bottom-[16%] md:bottom-[10%] lg:bottom-[8%] z-20 w-[120%] -ml-[10%] overflow-hidden whitespace-nowrap py-4 md:py-6 bg-black/80 border-y-[3px] -rotate-2 shadow-2xl pointer-events-none">
        <motion.div
          className="inline-flex gap-12 md:gap-24 pr-12 md:pr-24"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ repeat: Infinity, ease: 'linear', duration: 20 }}
        >
          {[...Array(6)].map((_, i) => (
            <span
              key={i}
              className="text-xl md:text-3xl lg:text-4xl font-black uppercase tracking-wider font-display"
            >
              THE BIGGEST FRESHERS FEST ⋅ <span className="text-[#DE005F]"> COMING SOON! </span>
            </span>
          ))}
        </motion.div>
      </div>

      <div className="absolute bottom-12 md:bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-30 opacity-70 hover:opacity-100 transition-opacity cursor-pointer text-[#FFFFFF] md:hidden">
        <span className="text-sm font-normal">Scroll Down</span>
        <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

    </div>
  );
};

export default HeroSection;