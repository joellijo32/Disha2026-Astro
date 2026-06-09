import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';

const DitherCanvas = lazy(() => import('./ThreeCanvasImpl.jsx'));

export default function ThreeCanvas(props) {
  const [ready, setReady] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: '450px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full h-full bg-black">
      {ready ? (
        <Suspense fallback={<div className="w-full h-full bg-black" />}>
          <DitherCanvas {...props} />
        </Suspense>
      ) : null}
    </div>
  );
}
