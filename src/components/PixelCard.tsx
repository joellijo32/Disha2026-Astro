import { useEffect, useRef } from "react"
import type { ReactNode, MouseEventHandler, KeyboardEventHandler } from "react"

class Pixel {
  width: number
  height: number
  ctx: CanvasRenderingContext2D
  x: number
  y: number
  color: string
  speed: number
  size: number
  sizeStep: number
  minSize: number
  maxSizeInteger: number
  maxSize: number
  delay: number
  counter: number
  counterStep: number
  isIdle: boolean
  isReverse: boolean
  isShimmer: boolean

  constructor(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    speed: number,
    delay: number
  ) {
    this.width = canvas.width
    this.height = canvas.height
    this.ctx = context
    this.x = x
    this.y = y
    this.color = color
    this.speed = this.getRandomValue(0.1, 0.9) * speed
    this.size = 0
    this.sizeStep = Math.random() * 0.4
    this.minSize = 0.5
    this.maxSizeInteger = 2
    this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger)
    this.delay = delay
    this.counter = 0
    this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01
    this.isIdle = false
    this.isReverse = false
    this.isShimmer = false
  }

  getRandomValue(min: number, max: number) {
    return Math.random() * (max - min) + min
  }

  draw() {
    const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5
    this.ctx.fillRect(
      this.x + centerOffset,
      this.y + centerOffset,
      this.size,
      this.size
    )
  }

  appear() {
    this.isIdle = false
    if (this.counter <= this.delay) {
      this.counter += this.counterStep
      return
    }
    if (this.size >= this.maxSize) {
      this.isShimmer = true
    }
    if (this.isShimmer) {
      this.shimmer()
    } else {
      this.size += this.sizeStep
    }
  }

  disappear() {
    this.isShimmer = false
    this.counter = 0
    if (this.size <= 0) {
      this.isIdle = true
      return
    }
    this.size -= this.speed
  }

  shimmer() {
    if (this.size >= this.maxSize) {
      this.isReverse = true
    } else if (this.size <= this.minSize) {
      this.isReverse = false
    }
    if (this.isReverse) {
      this.size -= this.speed
    } else {
      this.size += this.speed
    }
  }
}

function getEffectiveSpeed(value: number, reducedMotion: boolean) {
  const min = 0
  const max = 100
  const throttle = 0.001
  const parsed = parseInt(String(value), 10)

  if (parsed <= min || reducedMotion) {
    return min
  } else if (parsed >= max) {
    return max * throttle
  } else {
    return parsed * throttle
  }
}

const VARIANTS: Record<
  string,
  {
    activeColor: string | null
    gap: number
    speed: number
    colors: string
    noFocus: boolean
  }
> = {
  default: {
    activeColor: null,
    gap: 5,
    speed: 35,
    colors: "#f8fafc,#f1f5f9,#cbd5e1",
    noFocus: false,
  },
  blue: {
    activeColor: "#e0f2fe",
    gap: 10,
    speed: 25,
    colors: "#e0f2fe,#7dd3fc,#0ea5e9",
    noFocus: false,
  },
  yellow: {
    activeColor: "#fef08a",
    gap: 3,
    speed: 20,
    colors: "#fef08a,#fde047,#eab308",
    noFocus: false,
  },
  pink: {
    activeColor: "#fecdd3",
    gap: 6,
    speed: 80,
    colors: "#fecdd3,#fda4af,#e11d48",
    noFocus: true,
  },
}

interface PixelCardProps {
  variant?: string
  gap?: number
  speed?: number
  colors?: string
  noFocus?: boolean
  className?: string
  pixelate?: boolean
  onClick?: MouseEventHandler<HTMLDivElement>
  children?: ReactNode
}

export default function PixelCard({
  variant = "default",
  gap,
  speed,
  colors,
  noFocus,
  className = "",
  pixelate = false,
  onClick,
  children,
}: PixelCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pixelsRef = useRef<Pixel[]>([])
  const animationRef = useRef<number>(0)
  const timePreviousRef = useRef<number>(performance.now())
  const pixelateRef = useRef(pixelate)
  const onAnimCompleteRef = useRef<(() => void) | null>(null)
  pixelateRef.current = pixelate
  const reducedMotion =
    useRef(window.matchMedia("(prefers-reduced-motion: reduce)").matches).current

  const variantCfg = VARIANTS[variant] || VARIANTS.default
  const finalGap = gap ?? variantCfg.gap
  const finalSpeed = speed ?? variantCfg.speed
  const finalColors = colors ?? variantCfg.colors
  const finalNoFocus = noFocus ?? variantCfg.noFocus

  const initPixels = () => {
    if (!containerRef.current || !canvasRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const width = Math.floor(rect.width)
    const height = Math.floor(rect.height)
    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    canvasRef.current.width = width
    canvasRef.current.height = height
    canvasRef.current.style.width = `${width}px`
    canvasRef.current.style.height = `${height}px`

    const colorsArray = finalColors.split(",")
    const pxs: Pixel[] = []
    for (let x = 0; x < width; x += parseInt(String(finalGap), 10)) {
      for (let y = 0; y < height; y += parseInt(String(finalGap), 10)) {
        const color =
          colorsArray[Math.floor(Math.random() * colorsArray.length)]

        const dx = x - width / 2
        const dy = y - height / 2
        const distance = Math.sqrt(dx * dx + dy * dy)
        const delay = reducedMotion ? 0 : distance

        const pixel = new Pixel(
          canvasRef.current,
          ctx,
          x,
          y,
          color,
          getEffectiveSpeed(finalSpeed, reducedMotion),
          delay
        )

        if (pixelateRef.current) {
          pixel.size = pixel.maxSize
          pixel.isShimmer = true
          pixel.counter = pixel.delay + 1
        }

        pxs.push(pixel)
      }
    }
    pixelsRef.current = pxs
  }

  const doAnimate = (fnName: "appear" | "disappear") => {
    animationRef.current = requestAnimationFrame(() => doAnimate(fnName))
    const timeNow = performance.now()
    const timePassed = timeNow - timePreviousRef.current
    const timeInterval = 1000 / 60

    if (timePassed < timeInterval) return
    timePreviousRef.current = timeNow - (timePassed % timeInterval)

    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx || !canvasRef.current) return

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    ctx.fillStyle = "#0a0a0a"
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    const byColor = new Map<string, Pixel[]>()
    let allIdle = true
    for (let i = 0; i < pixelsRef.current.length; i++) {
      const pixel = pixelsRef.current[i]
      pixel[fnName]()
      if (!pixel.isIdle) allIdle = false
      if (pixel.size > 0) {
        const group = byColor.get(pixel.color)
        if (group) group.push(pixel)
        else byColor.set(pixel.color, [pixel])
      }
    }
    for (const [color, group] of byColor) {
      ctx.fillStyle = color
      for (let i = 0; i < group.length; i++) group[i].draw()
    }
    if (allIdle) {
      cancelAnimationFrame(animationRef.current)
      onAnimCompleteRef.current?.()
      onAnimCompleteRef.current = null
    }
  }

  const handleAnimation = (name: "appear" | "disappear", onComplete?: () => void) => {
    cancelAnimationFrame(animationRef.current)
    onAnimCompleteRef.current = onComplete ?? null
    animationRef.current = requestAnimationFrame(() => doAnimate(name))
  }

  useEffect(() => {
    if (canvasRef.current) {
      if (pixelate) {
        canvasRef.current.style.transition = "none"
        canvasRef.current.style.opacity = "1"
        handleAnimation("appear")
      } else {
        canvasRef.current.style.transition = "opacity 0.5s ease-out"
        canvasRef.current.style.opacity = "0"
        handleAnimation("disappear")
      }
    }
  }, [pixelate])

  useEffect(() => {
    initPixels()
    const observer = new ResizeObserver(() => {
      initPixels()
    })
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }
    return () => {
      observer.disconnect()
      cancelAnimationFrame(animationRef.current)
    }
  }, [finalGap, finalSpeed, finalColors, finalNoFocus])

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (e) => {
    if ((e.key === "Enter" || e.key === " ") && onClick) {
      onClick(e as unknown as React.MouseEvent<HTMLDivElement>)
    }
  }

  return (
    <>
      <style>{`
        .pixel-canvas {
          width: 100%;
          height: 100%;
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 10;
          pointer-events: none;
        }
        .pixel-card {
          position: relative;
          overflow: hidden;
          display: grid;
          place-items: center;
          isolation: isolate;
          border-radius: 28px;
          user-select: none;
          cursor: pointer;
        }
      `}</style>
      <div
        ref={containerRef}
        className={`pixel-card ${className}`}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={finalNoFocus ? -1 : 0}
      >
        <canvas className="pixel-canvas" ref={canvasRef} />
        <div className="relative z-[1] w-full h-full">{children}</div>
      </div>
    </>
  )
}
