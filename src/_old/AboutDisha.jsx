import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import kalyaniAsset from '../assets/kalyani.webp';

gsap.registerPlugin(ScrollTrigger);

const ABOUT_TEXT = `As the first of CET’s iconic 3 Ds, Disha '26 is the ultimate stage for our freshers to ignite their spirit and showcase their artistry. With seven departments vying for the prestigious Disha Cup, the stakes have never been higher. Join us for a high-energy celebration of talent and synergy - guided this year by our mascot, Kalyani.`
const AboutDisha = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const dishaRef = useRef(null);
  const paraRef = useRef(null);
  const wordsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 85%',
            end: 'top 40%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        dishaRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.8,
          delay: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 85%',
            end: 'top 40%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      const words = wordsRef.current.filter(Boolean);
      gsap.set(words, { color: 'rgba(255,255,255,0.2)' });

      gsap.to(words, {
        color: 'rgba(255,255,255,1)',
        duration: 1.5,
        ease: 'none',
        stagger: 0.05,
        scrollTrigger: {
          trigger: paraRef.current,
          start: 'top 85%',
          end: 'bottom 50%',
          toggleActions: 'play none none reverse',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen bg-[#000000] py-24 md:py-32 overflow-hidden">

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#DE005F]/15 via-[#10152B]/90 to-[#000000] z-0 opacity-50"></div>

      <div className="absolute top-0 right-0 w-[70%] md:w-[40%] h-[50%] bg-[radial-gradient(#DE005F_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(circle_at_top_right,black,transparent)] z-[5] opacity-40 pointer-events-none"></div>

      <div className="absolute bottom-0 left-0 w-[70%] md:w-[40%] h-[50%] bg-[radial-gradient(#B829EA_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(circle_at_bottom_left,black,transparent)] z-[5] opacity-40 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center md:gap-24">

        <h1 ref={headingRef} className="flex flex-col absolute top-20 md:top-0 z-20 items-center md:items-start text-center md:text-left">
            <span className="text-[#FFFFFF] text-7xl md:text-9xl font-black uppercase tracking-widest leading-none drop-shadow-[0_0_15px_rgba(222,0,95,0.6)] font-display">
              ABOUT
            </span>
            <span 
              ref={dishaRef} 
              className="text-[#DE005F] font-['Sedgwick_Ave_Display',_cursive] font-extrabold tracking-[-0.05em] text-7xl md:text-9xl relative -mt-2 md:-mt-6 [text-shadow:0_0_10px_rgba(222,0,95,0.8),0_0_20px_rgba(222,0,95,0.6),0_0_40px_rgba(222,0,95,0.4),0_0_80px_rgba(222,0,95,0.2)]"
            >
              DISHA
            </span>
        </h1>

        <div className="w-full md:w-1/2 flex items-center justify-center md:justify-end mb-12 md:mb-0 md:-ml-20 md:pb-40 mt-32 md:mt-0">
          <div className="relative inline-block">
            <img
              src={kalyaniAsset}
              alt="Illustrated version of the Kalyani character"
              className="w-full h-auto object-cover max-w-sm md:max-w-md lg:max-w-2xl xl:max-w-3xl drop-shadow-[0_0_25px_rgba(222,0,95,0.7)]"
            />
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 text-[#B829EA] font-['Sedgwick_Ave_Display',_cursive] text-6xl md:text-8xl lg:text-[8rem] font-extrabold tracking-[-0.05em] [-webkit-text-stroke:1px_#fff] drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] z-20">
              Kalyani
            </span>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left text-[#FFFFFF] relative">

          <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-10 font-black uppercase text-gray-700">
            <p className="text-[12rem] md:text-[18rem] lg:text-[22rem] tracking-widest">
              KALYANI
            </p>
          </div>

          <p ref={paraRef} className="text-lg md:text-xl font-bold leading-loose tracking-[0.15em] max-w-2xl md:max-w-none relative z-20 flex flex-wrap">
            {ABOUT_TEXT.split(' ').map((word, i) => (
              <span
                key={i}
                ref={(el) => (wordsRef.current[i] = el)}
                className="mr-[0.35em]"
                style={{ color: 'rgba(255,255,255,0.2)' }}
              >
                {word}
              </span>
            ))}
          </p>

        </div>

      </div>
    </section>
  );
};

export default AboutDisha;
