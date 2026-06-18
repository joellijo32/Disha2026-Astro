import React, { Suspense, lazy } from 'react';

const DitherCanvas = lazy(() => import('./ThreeCanvasImpl.jsx'));

export default function ThreeCanvas(props) {
  return (
    <div className="w-full h-full bg-black">
      <Suspense fallback={<div className="w-full h-full bg-black" />}>
        <DitherCanvas {...props} />
      </Suspense>
    </div>
  );
}
