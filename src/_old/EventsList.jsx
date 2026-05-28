import React, { useEffect, useRef, useState, Suspense } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const DitherCanvas = React.lazy(() => import('./ThreeCanvas'));

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("WebGL gracefully caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) return <div className="w-full h-full bg-[#10152B] opacity-50" />;
    return this.props.children;
  }
}

const REAL_EVENTS_DATA = [
  {
    id: 1,
    title: 'MAIN EVENTS',
    eventsList: ['Face of Disha', 'MX-Techie', 'MX-Disha', 'Fashion Show', 'Street Play', 'Disha Idol', 'Just Dance', 'Wall Painting']
  },
  {
    id: 2,
    title: 'TECHNICAL',
    eventsList: ['Ideathon', 'Quiz', 'Technical Essay', 'Prompt Writing', 'Speed Typing']
  },
  {
    id: 3,
    title: 'E-GAMES',
    eventsList: ['E-Football', 'BGMI', 'Valorant', 'Mini Militia', 'Free Fire', 'FIFA', 'COD']
  },
  {
    id: 4,
    title: 'SPORTS',
    eventsList: ['Football', 'Cricket', 'Volleyball', 'Tug of War', 'Badminton', 'Table Tennis', 'Chess', 'Carroms', 'Cycle Slow Race', 'Basketball', 'Arm Wrestling', 'Super Over (W)', 'Penalty Shoot (W)', 'Mr. Ponjikkara']
  },
  {
    id: 5,
    title: 'ATHLETICS',
    eventsList: ['100M Race (M/W)', 'Shot Put (M/W)', 'High Jump', 'Long Jump', '400 M Relay (M/W)', 'Brisk Walk 800M (M/W)', '200M Race (M/W)', 'Biathlon']
  },
  {
    id: 6,
    title: 'LITERARY',
    eventsList: ['Story Writing (Eng)', 'Story Writing (Mal)', 'Story Writing (Hin)', 'Versification (Eng)', 'Versification (Mal)', 'Versification (Hin)', 'Jingle Writing (Eng)', 'Jingle Writing (Mal)', 'Book Review', 'Film Review', 'Recitation (Eng)', 'Recitation (Mal)', 'Recitation (Hin)', 'Short Story (Eng)', 'Short Story (Mal)', 'Caption Writing (Eng)', 'Caption Writing (Mal)', 'Extempore (Eng)', 'Extempore (Mal)', 'Extempore (Hin)']
  },
  {
    id: 7,
    title: 'MUSICAL',
    eventsList: ['Classical Music', 'Light Music', 'Western (Duet)', 'Bands Battle', 'Nadanpattu', 'Unplugged', 'Mappilappattu']
  },
  {
    id: 8,
    title: 'DANCE',
    eventsList: ['Adapt Tunes', 'Prepared Duo', 'Prepared Solo']
  },
  {
    id: 9,
    title: 'THEATRICAL',
    eventsList: ['Street Play', 'Mono Act', 'Mimicry', 'Stand-up Comedy', 'Skit']
  },
  {
    id: 10,
    title: 'ART',
    eventsList: ['Pencil Drawing', 'Water Colouring', 'Cartoon', 'Digital Painting', 'Face Painting', 'Doodle Art', 'Minimal Poster', 'Oil Painting', 'Clay Modelling', 'Origami', 'Bottle Art', 'Calligraphy']
  },
  {
    id: 11,
    title: 'MISCELLANEOUS',
    eventsList: ['Troll Making', 'Rubix Cube', 'Short Film', 'Department Magazine', 'Mannequin', 'Trailer Making', 'Reel Making', 'Business (Naptol)', 'Channel Surfing', 'Guess Who?', 'Treasure Hunt', 'Open Debate', 'Jam', 'Integration Bee', 'Spot Commentary', 'Shot Story', 'Picture Perception', 'Theme-Based Photography', 'Movie Recreation']
  }
];

const Events = () => {
  const cardsSectionRef = useRef(null);
  const cardsWrapperRef = useRef(null);

  useEffect(() => {
    if (!cardsSectionRef.current || !cardsWrapperRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      ScrollTrigger.refresh();
    });
    resizeObserver.observe(document.body);

    const ctx = gsap.context(() => {
      // DYNAMIC CALCULATOR
      const getScrollAmount = () => {
        let wrapperWidth = cardsWrapperRef.current ? cardsWrapperRef.current.scrollWidth : 0;
        return -(wrapperWidth - window.innerWidth + window.innerWidth * 0.05);
      };

      // --- HORIZONTAL CARDS TIMELINE ---
      const cardsTl = gsap.timeline({
        scrollTrigger: {
          trigger: cardsSectionRef.current,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          end: () => `+=${Math.abs(getScrollAmount())}`,
          invalidateOnRefresh: true,
        }
      });

      cardsTl.to(cardsWrapperRef.current, {
        x: getScrollAmount,
        ease: "none"
      });
    });

    // --- HORIZONTAL TOUCH SWIPE TO VERTICAL SCROLL HIJACK ---
    const wrapper = cardsSectionRef.current;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let isSwipingHorizontally = false;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      lastX = startX;
      isSwipingHorizontally = false;
    };

    const handleTouchMove = (e) => {
      if (!startX || !startY) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = startX - currentX;
      const diffY = startY - currentY;

      if (!isSwipingHorizontally && Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
        isSwipingHorizontally = true;
      }

      if (isSwipingHorizontally) {
        e.preventDefault();
        const deltaX = lastX - currentX;
        window.scrollBy({ top: deltaX * 1.5, left: 0 });
        lastX = currentX;
      }
    };

    const handleTouchEnd = () => {
      startX = 0;
      startY = 0;
      isSwipingHorizontally = false;
    };

    if (wrapper) {
      wrapper.addEventListener('touchstart', handleTouchStart, { passive: true });
      wrapper.addEventListener('touchmove', handleTouchMove, { passive: false });
      wrapper.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      ctx.revert();
      resizeObserver.disconnect();
      if (wrapper) {
        wrapper.removeEventListener('touchstart', handleTouchStart);
        wrapper.removeEventListener('touchmove', handleTouchMove);
        wrapper.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, []);

  return (
    <section id="events" className="relative w-full bg-black z-20">

      {/* GLOBAL MASTER BACKGROUND WITH DITHER */}
      <div className="absolute inset-0 z-0 h-full w-full pointer-events-auto">
        <div className="sticky top-0 w-full h-[100dvh] overflow-hidden bg-black">

          <div className="absolute inset-0 w-full h-full">
            <ErrorBoundary>
              <Suspense fallback={<div className="w-full h-full bg-[#10152B] opacity-50" />}>
                <DitherCanvas
                  waveColor={[0.45, 0.0, 0.2]} // Darker, moodier pink
                  disableAnimation={false}
                  enableMouseInteraction={true}
                  mouseRadius={0.6} // Increased for a highly visible repulsion effect
                  colorNum={4}
                  waveAmplitude={0.3}
                  waveFrequency={3}
                  waveSpeed={0.05}
                />
              </Suspense>
            </ErrorBoundary>
          </div>

          <div className="absolute inset-0 bg-black/30 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#8A003B]/30 via-transparent to-transparent opacity-80 pointer-events-none" />

          {/* --- NEW: Top Black Fade for Seamless Blending --- */}
          <div className="absolute top-0 left-0 w-full h-64 md:h-96 bg-gradient-to-b from-black via-black/60 to-transparent z-10 pointer-events-none" />
        </div>
      </div>

      {/* --- HORIZONTAL CARDS PARTITION --- */}
      <div ref={cardsSectionRef} className="relative z-10 w-full h-[100dvh] flex items-center overflow-hidden pointer-events-none">

        {/* CENTERED SECTION HEADING */}
        <div className="absolute top-10 md:top-14 left-0 z-50 w-full flex justify-center pointer-events-none px-4">
          <h2 className="flex flex-col md:flex-row items-center md:items-baseline gap-1 md:gap-5 drop-shadow-[0_0_15px_rgba(222,0,95,0.6)]">
            <span className="text-[#DE005F] -mt-4 font-['Sedgwick_Ave_Display',_cursive] font-extrabold tracking-[-0.05em] text-6xl md:text-9xl relative [text-shadow:0_0_10px_rgba(222,0,95,0.8),0_0_20px_rgba(222,0,95,0.6),0_0_40px_rgba(222,0,95,0.4)]">
              EVENTS
            </span>
          </h2>
        </div>

        {/* PADDED CARDS */}
        <div ref={cardsWrapperRef} className="flex items-center h-full w-max px-[5vw] gap-6 md:gap-12 mt-28 md:mt-32 will-change-transform">

          {REAL_EVENTS_DATA.map((event) => (
            <div
              key={event.id}
              className="pointer-events-auto w-[85vw] sm:w-[60vw] md:w-[45vw] lg:w-[32vw] h-[70vh] flex flex-col bg-black/60 border border-white/10 rounded-none p-6 md:p-10 shrink-0 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >

              {/* Card Title */}
              <div className="shrink-0 mb-6 w-full flex justify-center">
                <h3
                  className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-[#DE005F] break-words text-center font-display"
                  style={{ textShadow: '0 0 15px rgba(222,0,95,0.4)' }}
                >
                  {event.title}
                </h3>
              </div>

              {/* Card List */}
              <div className="flex-grow overflow-y-auto overflow-x-hidden custom-scrollbar pr-2 relative w-full">

                <div className="relative flex items-center justify-center gap-3 mb-6 sticky top-0 z-20 pt-2 pb-6 -mt-2 w-full">
                  <div className="absolute inset-0 -mx-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-none" />

                  <span className="relative z-10 h-px flex-grow bg-gradient-to-r from-transparent to-[#DE005F]" />

                  <span className="relative z-10 h-px flex-grow bg-gradient-to-l from-transparent to-[#DE005F]/50" />
                </div>

                <div className="flex flex-col w-full">
                  {event.eventsList.map((item, index) => (
                    <div
                      key={index}
                      className="group flex items-start gap-4 py-3 md:py-4 border-b border-white/10 hover:border-white/30 transition-colors w-full"
                    >
                      <span className="text-[#DE005F] font-black text-sm md:text-base w-5 shrink-0 mt-0.5">
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                      <span
                        className="text-white/90 group-hover:text-white font-bold tracking-wide text-sm sm:text-base md:text-lg flex-1 break-words whitespace-normal leading-snug"
                        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          ))}

        </div>
      </div>

    </section>
  );
};

export default Events;