import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import dishaLogo from '../assets/disha_logo.webp';

const Loader = ({ message = null, minHeight = 'min-h-screen' }) => {
  const logoRef = useRef(null);

  // GSAP animation for logo
  useEffect(() => {
    if (logoRef.current) {
      const ctx = gsap.context(() => {
        // Ease in and ease out scale animation
        gsap.to(logoRef.current, {
          scale: 1.2,
          duration: 1,
          repeat: -1,
          yoyo: true,
          ease: 'power2.inOut',
        });
      });

      return () => ctx.revert();
    }
  }, []);

  return (
    <section className={`py-16 md:py-24 relative overflow-hidden flex items-center justify-center ${minHeight}`}>
      <div className="text-center relative z-10">
        <img
          ref={logoRef}
          src={dishaLogo}
          alt="Disha Logo"
          className="w-20 h-20 md:w-28 md:h-28 mx-auto object-contain"
        />
        {message && (
          <p className="text-white text-xl md:text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-400 bg-clip-text text-transparent animate-pulse mt-6">
            {message}
          </p>
        )}
      </div>
    </section>
  );
};

export default Loader;
