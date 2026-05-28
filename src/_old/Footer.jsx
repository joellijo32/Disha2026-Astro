import { motion } from 'framer-motion';

const DishaFooter = () => {
  const textContent = "DISHA '26";

  const sharedTextProps = {
    x: '50%',
    y: '50%',
    textAnchor: 'middle',
    dominantBaseline: 'middle',
    className: 'font-black uppercase tracking-tighter md:tracking-normal font-display',
    style: {
      fontSize: '120px',
    },
  };

  return (
    <footer className="w-full bg-black pt-12 pb-6 flex flex-col items-center justify-center overflow-hidden">
      <div className="w-full max-w-5xl px-4">
        {/* The main text link pointing to dishacet */}
        <a href="https://www.instagram.com/dishacet" target="_blank" rel="noopener noreferrer" className="block w-full">
          <svg viewBox="0 0 800 180" className="w-full h-auto overflow-visible cursor-pointer">
            <defs>
              <mask id="textMask">
                <text {...sharedTextProps} fill="white">
                  {textContent}
                </text>
              </mask>
            </defs>

            <text
              {...sharedTextProps}
              style={{
                ...sharedTextProps.style,
                fill: '#1a102e',
              }}
            >
              {textContent}
            </text>

            <g mask="url(#textMask)">
              <motion.g
                initial={{ y: 120 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 4.0, ease: [0, 0, 0.2, 1], delay: 0 }}
              >
                <motion.path
                  animate={{ x: [-800, 0] }}
                  transition={{ repeat: Infinity, repeatType: 'loop', duration: 8, ease: 'linear' }}
                  fill="#a855f7"
                  opacity="0.4"
                  d="M0,20 Q100,0 200,20 T400,20 T600,20 T800,20 T1000,20 T1200,20 T1400,20 T1600,20 V200 H0 Z"
                />

                <motion.path
                  style={{ y: 35 }}
                  animate={{ x: [-800, 0] }}
                  transition={{ repeat: Infinity, repeatType: 'loop', duration: 5, ease: 'linear' }}
                  fill="#9333ea"
                  d="M0,20 Q50,5 100,20 T200,20 T300,20 T400,20 T500,20 T600,20 T700,20 T800,20 T900,20 T1000,20 T1100,20 T1200,20 T1300,20 T1400,20 T1500,20 T1600,20 V200 H0 Z"
                />
              </motion.g>
            </g>
          </svg>
        </a>
      </div>

      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-purple-900/50 to-transparent" />
        <div className="flex items-center gap-6">
          <a
            href="https://www.instagram.com/cet.college.union"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-800 hover:text-purple-500 transition-colors text-[10px] tracking-[0.3em] font-bold uppercase"
          >
            © 2026 CET College Union
          </a>
        </div>
      </div>
    </footer>
  );
};

export default DishaFooter;
