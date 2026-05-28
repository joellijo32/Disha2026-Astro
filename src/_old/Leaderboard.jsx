import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import eventsBackground from '../assets/events_background.jpeg';

gsap.registerPlugin(ScrollTrigger);

const Leaderboard = () => {
  const [rows, setRows] = useState([]);
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const rowRefs = useRef([]);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('point', { ascending: false });

      if (!error && data) setRows(data);
    };
    fetchData();
  }, []);

  // GSAP Animation for the Heading
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, scale: 0.8, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // GSAP Animation for the Leaderboard Rows
  useEffect(() => {
    if (rows.length === 0) return;

    const ctx = gsap.context(() => {
      const cards = rowRefs.current.filter(Boolean);
      
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { x: -50, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out',
            stagger: 0.1,
            scrollTrigger: {
              trigger: cards[0],
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [rows]);

  const titleTextClasses = "text-6xl md:text-8xl lg:text-[10rem] font-extrabold tracking-tighter font-['Sedgwick_Ave_Display',_cursive]";

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen py-24 md:py-32 bg-[#000000] font-sans"
    >
      {/* --- SECTION-SPECIFIC PARALLAX BACKGROUND --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="sticky top-0 w-full h-screen">
          
          {/* Background Image Layer */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 z-0 mix-blend-luminosity"
            style={{ backgroundImage: `url(${eventsBackground})` }}
          />

          {/* Heavy Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#10152B]/90 via-[#7e22ce]/20 to-[#000000] z-0" />

          {/* --- UPDATED: Taller, smoother Top Black Fade --- */}
          <div className="absolute top-0 left-0 w-full h-64 md:h-96 bg-gradient-to-b from-black via-black/60 to-transparent z-[2]" />

          {/* Halftone Texture */}
          <div className="absolute inset-0 z-[1] opacity-20 mix-blend-overlay bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-size-[4px_4px]"></div>

          {/* Scrolling Banner 1 */}
          <div className="absolute top-[30%] -left-[20%] w-[140%] z-[5] opacity-25 rotate-[15deg] overflow-hidden whitespace-nowrap pointer-events-none">
            <motion.div
              className="inline-flex gap-8 will-change-transform"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ repeat: Infinity, ease: 'linear', duration: 30 }}
            >
              {[...Array(10)].map((_, i) => (
                <span key={i} className="text-8xl md:text-[12rem] font-black uppercase text-[#7e22ce] [-webkit-text-stroke:2px_#7e22ce] text-transparent tracking-tighter font-display">
                  DOMINATE
                </span>
              ))}
            </motion.div>
          </div>

          {/* Scrolling Banner 2 */}
          <div className="absolute top-[50%] -left-[20%] w-[140%] z-[5] opacity-15 -rotate-[15deg] overflow-hidden whitespace-nowrap pointer-events-none transform-gpu">
            <motion.div
              className="inline-flex gap-8 will-change-transform"
              animate={{ x: ['-50%', '0%'] }} 
              transition={{ repeat: Infinity, ease: 'linear', duration: 40 }} 
            >
              {[...Array(10)].map((_, i) => (
                <span key={i} className="text-8xl md:text-[12rem] font-black uppercase text-[#DE005F] [-webkit-text-stroke:2px_#DE005F] text-transparent tracking-tighter font-display">
                  CONQUER
                </span>
              ))}
            </motion.div>
          </div>
          
        </div>
      </div>
      {/* -------------------------------------- */}

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 flex flex-col items-center">
        
        {/* Heading */}
        <div ref={headingRef} className="relative mb-16 md:mb-24 w-fit mx-auto text-center flex flex-col items-center justify-center">
          <h1 className="relative z-10 text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-widest text-[#FFFFFF] drop-shadow-2xl font-display">
            LEADER
          </h1>
          <h1 className={`absolute z-20 drop-shadow-black top-12 md:top-22 ${titleTextClasses} text-[#7e22ce] [text-shadow:0_0_10px_rgba(126,34,206,0.8),0_0_20px_rgba(126,34,206,0.6),0_0_40px_rgba(126,34,206,0.4),0_0_80px_rgba(126,34,206,0.2)]`}>
            BOARD
          </h1>
        </div>

        {rows.length > 0 && (
          <div className="w-full flex flex-col mt-10 relative z-20 overflow-hidden border border-white/10 bg-[#1a1525]/60 shadow-[0_0_50px_rgba(126,34,206,0.15)] transform-gpu will-change-transform rounded-xl">
            
            {/* Table Header Row */}
            <div className="flex items-center justify-between px-6 py-4 md:px-8 md:py-6 bg-[#7e22ce]/90">
              <h3 className="text-sm md:text-xl font-black uppercase tracking-[0.2em] text-white font-display">
                Standings
              </h3>
              <h3 className="text-sm md:text-xl font-black uppercase tracking-[0.2em] text-white font-display">
                Score
              </h3>
            </div>

            {/* Table Body (Rows without gaps) */}
            <div className="flex flex-col">
              {rows.map((row, i) => {
                const rankColor = i === 0 ? 'text-[#DE005F]' : i === 1 ? 'text-[#b829ea]' : i === 2 ? 'text-[#7e22ce]' : 'text-white/40';
                // Alternate row backgrounds for better readability in a unified table
                const rowBg = i % 2 === 0 ? 'bg-transparent' : 'bg-black/20';

                return (
                  <div
                    key={row.id ?? i}
                    ref={(el) => (rowRefs.current[i] = el)}
                    className={`
                      group relative flex items-center justify-between px-6 py-4 md:px-8 md:py-5
                      border-b border-white/5 last:border-b-0 transition-colors duration-200
                      hover:bg-[#7e22ce]/20 ${rowBg}
                    `}
                  >
                    <div className="flex items-center gap-4 md:gap-6">
                      {/* Rank Circle */}
                      <div className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 border border-white/5 flex items-center justify-center font-black text-lg md:text-xl shadow-inner ${rankColor} font-display`}>
                        {i + 1}
                      </div>

                      {/* Department Name */}
                      <p className="text-sm md:text-lg font-bold uppercase tracking-widest text-white/90 truncate max-w-[180px] md:max-w-md font-display">
                        {row.department}
                      </p>
                    </div>

                    {/* Points */}
                    <div className="flex items-baseline gap-1 md:gap-2">
                      <span className="text-xl md:text-3xl font-black tabular-nums text-[#b829ea] font-display">
                        {row.point?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}
      </div>
    </section>
  );
};

export default Leaderboard;