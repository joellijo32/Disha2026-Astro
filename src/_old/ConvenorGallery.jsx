import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Make sure these paths are correct relative to your project structure
import ConvenorMariam from '../assets/DishaTeam/Mariam Jo Palakkadan_Convenor.webp'
import CoConvenorAbhishek from '../assets/DishaTeam/Abhishek B.webp'
import CoConvenorHasil from '../assets/DishaTeam/HASIL ALI P T.webp'
import CoordinatorAnooj from '../assets/DishaTeam/Anooj M A.webp'
import CoordinatorHelize from '../assets/DishaTeam/Helize P Mathew_coordinator.webp'
import CoordinatorNandan from '../assets/DishaTeam/Nandanlal cordinator.webp'
import CoordinatorSarangi from '../assets/DishaTeam/Coordinator_Sarangi Sujith.webp'

gsap.registerPlugin(ScrollTrigger);

const TEAM_MEMBERS = [
  // Center / Prominent
  { id: 1, name: "Mariam", title: "Convenor", img: ConvenorMariam, pos: "w-[42%] aspect-[3/4] top-[20%] left-[28%] z-50 rotate-2" },

  // Top Left
  { id: 2, name: "Helize", title: "Coordinator", img: CoordinatorHelize, pos: "w-[32%] aspect-[3/4] top-[3%] left-[10%] z-20 -rotate-3" },

  // Top Right 
  { id: 3, name: "Anooj", title: "Coordinator", img: CoordinatorAnooj, pos: "w-[30%] aspect-[4/5] top-[-1%] right-[8%] z-30 rotate-3" },

  // Mid Left
  { id: 4, name: "Abhishek", title: "Co-Convenor", img: CoConvenorAbhishek, pos: "w-[28%] aspect-[4/5] top-[38%] left-[4%] z-40 -rotate-2" },

  // Mid Right
  { id: 5, name: "Hasil", title: "Co-Convenor", img: CoConvenorHasil, pos: "w-[34%] aspect-[3/4] top-[26%] right-[0%] z-20 rotate-1" },

  // Bottom Left
  { id: 6, name: "NandanLal", title: "Coordinator", img: CoordinatorNandan, pos: "w-[36%] aspect-[4/5] bottom-[-1%] left-[16%] z-30 -rotate-1" },

  // Bottom Right
  { id: 7, name: "Sarangi", title: "Coordinator", img: CoordinatorSarangi, pos: "w-[32%] aspect-square bottom-[12%] right-[12%] z-40 -rotate-3" },
];

const TeamCollage = () => {
  const containerRef = useRef(null);
  const photosRef = useRef([]);
  const [activeId, setActiveId] = useState(null);
  const [animationsDone, setAnimationsDone] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Find all elements with the 'team-text-anim' class and stagger them
      const textElements = containerRef.current.querySelectorAll('.team-text-anim');

      gsap.fromTo(textElements,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: containerRef.current, start: "top 75%" } }
      );

      // Reveal Photos
      gsap.fromTo(photosRef.current,
        { opacity: 0, scale: 0.8, rotation: () => gsap.utils.random(-15, 15) },
        {
          opacity: 1,
          scale: 1,
          rotation: (i) => parseFloat(TEAM_MEMBERS[i].pos.match(/-?rotate-\d+/)?.[0].replace('rotate-', '') || 0),
          duration: 0.8,
          stagger: 0.08,
          ease: "back.out(1.5)",
          scrollTrigger: { trigger: containerRef.current, start: "top 70%" },
          onComplete: () => setAnimationsDone(true)
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleInteraction = (id) => {
    setActiveId(prevId => prevId === id ? null : id);
  };

  return (
    <section
      id="team"
      ref={containerRef}
      className="relative w-full bg-[#000000] py-24 md:py-32 px-6 md:px-12 overflow-hidden flex justify-center font-sans"
    >
      {/* Background Styling */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_0.2px)] bg-size-[6px_6px]" />
      {/* Updated background radial gradient to use #8911b3 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#8911b3]/10 via-black to-black z-0 pointer-events-none" />

      {/* --- GRID LAYOUT UPDATE --- */}
      <div className="relative z-10 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-y-12 lg:gap-x-8">

        {/* 1. HEADING */}
        <div className="lg:col-span-5 order-1 flex flex-col items-center lg:items-start z-10 text-center lg:text-left lg:self-end lg:pb-4">
          <h2 className="team-text-anim flex flex-col gap-1 mb-0">
            {/* Updated white text drop shadow to use #8911b3 */}
            <span className="text-[#FFFFFF] text-5xl md:text-7xl font-black uppercase tracking-widest leading-none drop-shadow-[0_0_15px_rgba(137,17,179,0.6)]">
              TEAM BEHIND
            </span>
            {/* Updated cursive text color and text-shadow stack to use #8911b3 */}
            <span className="text-[#8911b3] font-['Sedgwick_Ave_Display',_cursive] font-extrabold tracking-[-0.05em] text-7xl md:text-9xl relative -mt-4 [text-shadow:0_0_10px_rgba(137,17,179,0.8),0_0_20px_rgba(137,17,179,0.6),0_0_40px_rgba(137,17,179,0.4)]">
              DISHA
            </span>
          </h2>
        </div>

        {/* 2. GALLERY */}
        <div className="lg:col-span-7 order-2 lg:row-span-2 relative aspect-[4/5] md:aspect-square w-full max-w-[550px] mx-auto lg:mr-0 select-none">
          {TEAM_MEMBERS.map((member, i) => {
            const isActive = activeId === member.id;

            return (
              <div
                key={member.id}
                ref={(el) => (photosRef.current[i] = el)}
                onMouseEnter={() => {
                  if (window.matchMedia('(hover: hover)').matches) {
                    setActiveId(member.id);
                  }
                }}
                onMouseLeave={() => {
                  if (window.matchMedia('(hover: hover)').matches) {
                    setActiveId(null);
                  }
                }}
                onClick={() => handleInteraction(member.id)}
                // Updated active border and shadow to use #8911b3
                className={`absolute cursor-pointer overflow-hidden bg-[#10152B] border-2 md:border-2 origin-center rounded-sm ${member.pos}
                  ${animationsDone ? 'transition-all duration-400 ease-out' : ''}
                  ${isActive ? 'border-[#8911b3] shadow-[0_0_30px_rgba(137,17,179,0.6)]' : 'border-white/10 shadow-2xl'}
                `}
                style={{
                  zIndex: isActive ? 60 : undefined,
                  transform: isActive ? 'scale(1.08) rotate(0deg)' : undefined,
                }}
              >
                <img
                  src={member.img}
                  alt={member.name}
                  style={{
                    filter: isActive ? 'grayscale(0%) contrast(110%)' : 'grayscale(100%) contrast(120%) brightness(0.7)',
                    opacity: isActive ? 1 : 0.8
                  }}
                  className="w-full h-full object-cover transition-all duration-500 pointer-events-none"
                />

                <div className={`absolute inset-0 bg-gradient-to-t from-[#10152B] via-[#10152B]/40 to-transparent flex flex-col justify-end p-3 md:p-5 transition-opacity duration-300 pointer-events-none ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                  <h3 className={`text-white font-black text-sm md:text-xl uppercase tracking-widest leading-none transform transition-transform duration-300 ${isActive ? 'translate-y-0' : 'translate-y-2'}`}>
                    {member.name}
                  </h3>
                  {/* Updated member title text to use #8911b3 */}
                  <p className={`text-[#8911b3] text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mt-1 transform transition-transform duration-300 delay-75 ${isActive ? 'translate-y-0' : 'translate-y-2'}`}>
                    {member.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. CONTACT INFO */}
        <div className="lg:col-span-5 order-3 flex flex-col items-center lg:items-start z-10 text-center lg:text-left lg:self-start lg:pt-4">

          <div className="team-text-anim flex flex-col bg-transparent gap-3 text-white/70 text-sm md:text-base tracking-wider uppercase font-bold backdrop-blur-md p-6 w-full max-w-md">
            {/* Updated contact span text colors to use #8911b3 */}
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-[#8911b3]">Convenor</span>
              <span>Mariam: +91 94966 22452</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-[#8911b3]">Co-Convenor</span>
              <span>Abhishek: +91 89216 76073</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8911b3]">Co-Convenor</span>
              <span>Hasil: +91 95441 29022</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default TeamCollage;