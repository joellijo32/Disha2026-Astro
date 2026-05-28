import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { Menu, X, ArrowRight } from 'lucide-react';
import dishaLogo from '../assets/disha_logo.webp';

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Events', href: '#events' },
  { label: 'Schedule', href: '#schedule' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
];

const getIsDesktop = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 1024;
};

const Header = () => {
  const navRef = useRef(null);
  const logoRef = useRef(null);
  const linksRef = useRef(null);
  const registerRef = useRef(null);
  const overlayRef = useRef(null);
  const menuCardRef = useRef(null);
  const dropdownLinksRef = useRef([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(getIsDesktop);
  const [isPastHero, setIsPastHero] = useState(false);

  // Scroll logic to change text
  useEffect(() => {
    const heroElement = document.getElementById('home');
    if (!heroElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // If the hero section is less than 10% visible, swap the text
        setIsPastHero(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(heroElement);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const checkWidth = () => setIsDesktop(getIsDesktop());
    checkWidth();
    window.addEventListener('resize', checkWidth);
    window.addEventListener('orientationchange', checkWidth);
    return () => {
      window.removeEventListener('resize', checkWidth);
      window.removeEventListener('orientationchange', checkWidth);
    };
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        navRef.current,
        { y: -80, opacity: 0, scale: 0.92 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          ease: 'back.out(1.7)',
          delay: 0.15,
        }
      );
      const animatedRefs = [logoRef.current, linksRef.current, registerRef.current].filter(Boolean);
      if (animatedRefs.length > 0) {
        gsap.fromTo(
          animatedRefs,
          { opacity: 0, y: -8 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 0.65 }
        );
      }
    });
    return () => ctx.revert();
  }, [isDesktop]);

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const card = menuCardRef.current;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      gsap.set(overlay, { display: 'flex' });
      gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' });
      gsap.fromTo(
        card,
        { opacity: 0, scale: 0.94, y: -20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.4,
          ease: 'back.out(1.5)',
          delay: 0.08,
        }
      );
      gsap.fromTo(
        dropdownLinksRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.055, ease: 'power2.out', delay: 0.2 }
      );
    } else {
      document.body.style.overflow = '';
      gsap.to(card, { opacity: 0, scale: 0.95, y: -10, duration: 0.2, ease: 'power2.in' });
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        delay: 0.05,
        onComplete: () => gsap.set(overlay, { display: 'none' }),
      });
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  const onRegisterEnter = () => gsap.to(registerRef.current, { x: 3, color: '#fff', duration: 0.2, ease: 'power2.out' });
  const onRegisterLeave = () => gsap.to(registerRef.current, { x: 0, color: 'rgba(255,255,255,0.7)', duration: 0.2, ease: 'power2.out' });

  const desktopView = (
    <header
      ref={navRef}
      className="fixed z-[60] flex items-center justify-between bg-[#0f0f0f]/60 backdrop-blur-2xl border border-white/[0.07] shadow-[0_4px_30px_rgba(0,0,0,0.7)]"
      style={{
        left: 0,
        right: 0,
        margin: '0 auto',
        opacity: 0,
        width: '100%',
        padding: 'clamp(10px, 1.5vh, 16px) clamp(14px, 2.5vw, 48px)',
      }}
    >
      <div ref={logoRef} className="flex items-center shrink-0">
        <a href="#home">
          <img src={dishaLogo} alt="DISHA 26" style={{ height: 'clamp(22px, 3.4vh, 34px)' }} className="w-auto object-contain" />
        </a>
      </div>

      <nav ref={linksRef} className="flex items-center" style={{ gap: 'clamp(20px, 2.8vw, 52px)' }}>
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href} style={{ fontSize: 'clamp(11px, 0.9vw, 15px)', letterSpacing: '0.13em' }} className="font-bold text-white/50 hover:text-white transition-colors duration-200 whitespace-nowrap font-display">
            {link.label.toUpperCase()}
          </a>
        ))}
      </nav>

      <div className="flex items-center shrink-0">
        <button ref={registerRef} style={{ fontSize: 'clamp(11px, 0.9vw, 15px)', letterSpacing: '0.13em' }} className="flex items-center gap-1.5 font-bold text-white/70 hover:text-white transition-colors whitespace-nowrap font-display" onMouseEnter={onRegisterEnter} onMouseLeave={onRegisterLeave}>
          REGISTER <ArrowRight size={14} strokeWidth={2.5} />
        </button>
      </div>
    </header>
  );

  const mobileView = (
    <>
      <header
        ref={navRef}
        className="fixed z-[60] flex items-center justify-between bg-[#0f0f0f]/60 backdrop-blur-2xl border border-white/[0.07] shadow-[0_4px_30px_rgba(0,0,0,0.7)]"
        style={{
          left: 0,
          right: 0,
          margin: '0 auto',
          opacity: 0,
          width: '100%',
          padding: 'clamp(10px, 1.3vh, 16px) clamp(14px, 2.5vw, 48px)',
        }}
      >
        <div ref={logoRef} className="flex items-center shrink-0">
          <a href="#home">
            <img src={dishaLogo} alt="DISHA 26" style={{ height: 'clamp(22px, 3.4vh, 34px)' }} className="w-auto object-contain" />
          </a>
        </div>

        <div className="flex items-center shrink-0">
          <span
            ref={registerRef}
            style={{ fontSize: 'clamp(11px, 3.2vw, 13px)', letterSpacing: '0.1em' }}
            className="font-black text-white/80 whitespace-nowrap uppercase transition-all duration-300 font-display"
          >
            {isPastHero ? "Disha 2026" : "CET College Union 25-26"}
          </span>
        </div>

        <div className="flex items-center shrink-0">
          <button className="flex items-center justify-center text-white/60 hover:text-white transition-colors rounded-full" style={{ padding: '6px' }} onClick={toggleMenu} aria-label="Toggle menu">
            {isOpen ? <X size={22} strokeWidth={1.8} /> : <Menu size={22} strokeWidth={1.8} />}
          </button>
        </div>
      </header>

      <div ref={overlayRef} className="fixed inset-0 z-[55] flex-col" style={{ display: 'none', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }} onClick={(e) => { if (e.target === overlayRef.current) closeMenu(); }}>
        <div ref={menuCardRef} className="absolute bg-[#111111] border border-white/[0.07] rounded-2xl overflow-hidden" style={{ top: 'calc(2vh + clamp(48px, 7vh, 70px) + 12px)', left: 0, right: 0, margin: '0 auto', width: 'min(92vw, 440px)', boxShadow: '0 20px 80px rgba(0,0,0,0.9)' }}>
          <nav className="flex flex-col">
            {NAV_LINKS.map((link, i) => (
              <a key={link.href} href={link.href} ref={(el) => (dropdownLinksRef.current[i] = el)} onClick={closeMenu} style={{ fontSize: 'clamp(14px, 4vw, 17px)', letterSpacing: '0.1em' }} className="flex items-center justify-between px-6 py-[18px] font-semibold text-white/75 hover:text-white hover:bg-white/[0.05] border-b border-white/[0.05] transition-colors duration-150 last:border-b-0 font-display">
                {link.label.toUpperCase()}
                <ArrowRight size={14} strokeWidth={1.8} className="opacity-25 shrink-0" />
              </a>
            ))}
          </nav>
          <div className="p-4 pt-3">
            <button style={{ fontSize: 'clamp(13px, 3.5vw, 15px)', letterSpacing: '0.13em' }} className="w-full py-4 rounded-xl bg-gradient-to-r from-[#b530ff] to-[#ff2b93] text-white font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-[0_4px_28px_rgba(181,48,255,0.4)] font-display">
              REGISTER NOW <ArrowRight size={15} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return <>{isDesktop ? desktopView : mobileView}</>;
};

export default Header;
