import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ComponentProps,
  type HTMLAttributes,
  type MouseEventHandler,
} from "react"

import { cn } from "../lib/utils"

// ============================================================================
// Tokens — adapted from cutout-card (uses this project's Tailwind theme)
// ============================================================================

export const cutoutCardSurfaceShadowClassName = cn(
  "border border-zinc-800 dark:border-zinc-700/60",
  "shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.3),0px_4px_8px_-2px_rgba(0,0,0,0.2),0px_8px_16px_-4px_rgba(0,0,0,0.15)]",
  "transition-[box-shadow,border-color] duration-500 ease-out",
  "hover:border-zinc-600 hover:shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.4),0px_8px_16px_-4px_rgba(0,0,0,0.3),0px_16px_32px_-8px_rgba(0,0,0,0.2)]"
)

export const cutoutCardSurfaceClassName = cn(
  "group/cutout relative cursor-pointer overflow-hidden rounded-[28px] bg-[#0a0a0a] text-white",
  cutoutCardSurfaceShadowClassName
)

export function useCutoutContentStaggerVariants() {
  return useMemo(() => ({
    container: {
      hidden: {},
      show: {
        transition: { staggerChildren: 0.055, delayChildren: 0.06 },
      },
    },
    item: {
      hidden: { opacity: 0, transform: "translateY(12px) blur(5px)" },
      show: {
        opacity: 1,
        transform: "translateY(0px) blur(0px)",
        transition: { duration: 0.48, ease: [0.23, 1, 0.32, 1] },
      },
    },
  } as const), [])
}

const CORNER_PATH = "M0 200C155.996 199.961 200.029 156.308 200 0V200H0Z"

// ============================================================================
// Context
// ============================================================================

export interface CutoutCardContextValue {
  hovered: boolean
}

const CutoutCardContext = createContext<CutoutCardContextValue | null>(null)

export function useCutoutCard() {
  const ctx = useContext(CutoutCardContext)
  if (!ctx) {
    throw new Error("useCutoutCard must be used within <CutoutCard>")
  }
  return ctx
}

export function useOptionalCutoutCard() {
  return useContext(CutoutCardContext)
}

// ============================================================================
// Root
// ============================================================================

export type CutoutCardProps = HTMLAttributes<HTMLDivElement>

export function CutoutCard({
  className,
  children,
  ...props
}: CutoutCardProps) {
  const [hovered, setHovered] = useState(false)

  const ctx = useMemo<CutoutCardContextValue>(
    () => ({ hovered }),
    [hovered]
  )

  const handleMouseEnter: MouseEventHandler<HTMLDivElement> = () => {
    setHovered(true)
  }

  const handleMouseLeave: MouseEventHandler<HTMLDivElement> = () => {
    setHovered(false)
  }

  return (
    <CutoutCardContext.Provider value={ctx}>
      <div
        className={cn(cutoutCardSurfaceClassName, className)}
        data-slot="cutout-card"
        data-state={ctx.hovered ? "hovered" : "idle"}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </div>
    </CutoutCardContext.Provider>
  )
}

// ============================================================================
// Layout primitives
// ============================================================================

export type CutoutCardMediaProps = HTMLAttributes<HTMLDivElement>

export function CutoutCardMedia({ className, ...props }: CutoutCardMediaProps) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      data-slot="cutout-card-media"
      {...props}
    />
  )
}

export type CutoutCardImageProps = ComponentProps<"img"> & {
  /** Aspect ratio for the media container (e.g. "4/3"). Defaults to auto. */
  aspect?: string
}

export function CutoutCardImage({
  className,
  alt = "",
  aspect,
  style,
  ...props
}: CutoutCardImageProps) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={aspect ? { aspectRatio: aspect } : style}
    >
      <img
        alt={alt}
        className={cn(
          "object-cover transition-transform duration-700 ease-out group-hover/cutout:scale-105 w-full h-full"
        )}
        data-slot="cutout-card-image"
        loading="lazy"
        {...props}
      />
    </div>
  )
}

export type CutoutCardOverlayProps = HTMLAttributes<HTMLDivElement>

export function CutoutCardOverlay({
  className,
  ...props
}: CutoutCardOverlayProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent",
        className
      )}
      data-slot="cutout-card-overlay"
      {...props}
    />
  )
}

export type CutoutCardContentProps = HTMLAttributes<HTMLDivElement>

export function CutoutCardContent({
  className,
  ...props
}: CutoutCardContentProps) {
  return (
    <div
      className={cn("p-6", className)}
      data-slot="cutout-card-content"
      {...props}
    />
  )
}

export type CutoutCardFooterProps = HTMLAttributes<HTMLDivElement>

export function CutoutCardFooter({
  className,
  ...props
}: CutoutCardFooterProps) {
  return (
    <div
      className={cn("flex items-center justify-between", className)}
      data-slot="cutout-card-footer"
      {...props}
    />
  )
}

// ============================================================================
// Cutout geometry
// ============================================================================

export type CutoutCornerProps = ComponentProps<"svg"> & {
  size?: number
}

export function CutoutCorner({
  className,
  size = 32,
  viewBox = "0 0 200 200",
  ...props
}: CutoutCornerProps) {
  return (
    <svg
      aria-hidden
      className={cn(className)}
      data-slot="cutout-corner"
      height={size}
      viewBox={viewBox}
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d={CORNER_PATH} fill="currentColor" />
    </svg>
  )
}

export type CutoutCardInsetLabelProps = HTMLAttributes<HTMLDivElement>

export function CutoutCardInsetLabel({
  className,
  ...props
}: CutoutCardInsetLabelProps) {
  return (
    <div
      className={cn("absolute", className)}
      data-slot="cutout-card-inset-label"
      {...props}
    />
  )
}

export type CutoutCardPinProps = HTMLAttributes<HTMLDivElement>

export function CutoutCardPin({ className, ...props }: CutoutCardPinProps) {
  return (
    <div
      className={cn("absolute", className)}
      data-slot="cutout-card-pin"
      {...props}
    />
  )
}

// ============================================================================
// Context-sensitive action region
// ============================================================================

export type CutoutCardActionProps = HTMLAttributes<HTMLDivElement> & {
  revealOnHover?: boolean
}

export function CutoutCardAction({
  className,
  revealOnHover = true,
  ...props
}: CutoutCardActionProps) {
  const { hovered } = useCutoutCard()
  const visible = !revealOnHover || hovered

  return (
    <div
      className={cn(
        "absolute transition-all duration-240 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none",
        className
      )}
      data-reveal={revealOnHover ? "hover" : "always"}
      data-slot="cutout-card-action"
      {...props}
    />
  )
}
