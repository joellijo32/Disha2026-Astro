import { useState, useRef, useEffect } from "react"
import {
  ExpandableScreen,
  ExpandableScreenContent,
} from "./ExpandableScreen"

interface EasterEggVIPProps {
  imageUrls?: string[]
}

export default function EasterEggVIP({ imageUrls = [] }: EasterEggVIPProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [step, setStep] = useState<"ledger" | "artifact">("ledger")
  const [alias, setAlias] = useState("")
  const [affiliation, setAffiliation] = useState("")
  const [aliasError, setAliasError] = useState(false)
  const [affiliationError, setAffiliationError] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [bgImage, setBgImage] = useState("")

  const ticketRef = useRef<HTMLDivElement>(null)
  const glareRef = useRef<HTMLDivElement>(null)
  const glitchRef = useRef<HTMLDivElement>(null)

  // Pick random image
  useEffect(() => {
    if (imageUrls.length > 0 && !bgImage) {
      setBgImage(imageUrls[Math.floor(Math.random() * imageUrls.length)])
    }
  }, [imageUrls, bgImage])

  // Support custom event trigger
  useEffect(() => {
    const handler = () => setIsExpanded(true)
    window.addEventListener("trigger-vip-egg", handler)
    return () => window.removeEventListener("trigger-vip-egg", handler)
  }, [])

  // Idle sway + user override
  useEffect(() => {
    const el = ticketRef.current
    if (!el || step !== "artifact") return

    let frameId: number
    let isInteracting = false
    let pointerRotX = 0
    let pointerRotY = 0
    const startTime = performance.now()
    const IDLE_SPEED = 0.3
    const MAX_IDLE_Y = 15
    const SPRING_MS = 675

    const tick = (now: number) => {
      if (!isInteracting) {
        const t = ((now - startTime) / 1000) * IDLE_SPEED * Math.PI * 2
        const idleY = Math.sin(t) * MAX_IDLE_Y
        el.style.transform = `rotateY(${idleY}deg)`
      }
      frameId = requestAnimationFrame(tick)
    }

    const handleMove = (e: PointerEvent) => {
      if (!isInteracting) {
        isInteracting = true
        el.style.transition = "none"
      }
      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      pointerRotY = ((e.clientX - centerX) / (rect.width / 2)) * 15
      pointerRotX = -((e.clientY - centerY) / (rect.height / 2)) * 15

      if (glareRef.current) {
        const gX = ((e.clientX - rect.left) / rect.width) * 100
        const gY = ((e.clientY - rect.top) / rect.height) * 100
        glareRef.current.style.backgroundPosition = `${gX}% ${gY}%`
        glareRef.current.style.opacity = "0.4"
      }

      el.style.transform = `rotateX(${pointerRotX}deg) rotateY(${pointerRotY}deg)`
    }

    const handleLeave = () => {
      if (!isInteracting) return
      isInteracting = false

      const t = ((performance.now() - startTime) / 1000) * IDLE_SPEED * Math.PI * 2
      const targetY = Math.sin(t) * MAX_IDLE_Y

      el.style.transition = `transform ${SPRING_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1)`
      el.style.transform = `rotateY(${targetY}deg)`
      setTimeout(() => {
        if (el) el.style.transition = "none"
      }, SPRING_MS)

      if (glareRef.current) glareRef.current.style.opacity = "0"
    }

    frameId = requestAnimationFrame(tick)
    el.addEventListener("pointermove", handleMove)
    el.addEventListener("pointerleave", handleLeave)

    return () => {
      cancelAnimationFrame(frameId)
      el.removeEventListener("pointermove", handleMove)
      el.removeEventListener("pointerleave", handleLeave)
    }
  }, [step])

  const handleSubmit = () => {
    const validAlias = alias.trim().length > 0
    const validAffiliation = affiliation.trim().length > 0
    setAliasError(!validAlias)
    setAffiliationError(!validAffiliation)
    if (!validAlias || !validAffiliation) return

    setStep("artifact")

    setTimeout(() => {
      if (glitchRef.current) {
        glitchRef.current.classList.add("vip-glitch")
        setTimeout(
          () => glitchRef.current?.classList.remove("vip-glitch"),
          600
        )
      }
    }, 50)
  }

  const downloadBlob = (blob: Blob) => {
    try {
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "Disha26VIP_Pass.png"
      document.body.appendChild(a)
      a.click()
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 5000)
    } catch (err) {
      console.error("Download failed:", err)
    }
  }

  const handleExtract = async () => {
    const el = ticketRef.current
    if (!el) return

    setProcessing(true)
    const savedTransform = el.style.transform
    const savedTransformStyle = el.style.transformStyle
    const savedWidth = el.style.width
    el.style.transform = "none"
    el.style.transformStyle = "flat"
    el.style.width = "340px"

    try {
      const { toBlob } = await import("html-to-image")
      const isMobile =
        "maxTouchPoints" in navigator
          ? (navigator as any).maxTouchPoints > 2
          : /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
            navigator.userAgent.toLowerCase()
          )
      const blob = await toBlob(el, {
        backgroundColor: "#050505",
        pixelRatio: isMobile ? 1.5 : 2.5,
        fontEmbedCSS: "",
        skipFonts: true,
      })

      if (!blob) return

      const file = new File([blob], "Disha26VIP_Pass.png", {
        type: "image/png",
      })

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Disha '26",
          text: "Here's my Disha 2026 VIP Pass, where's yours?",
        })
      } else {
        downloadBlob(blob)
      }
    } catch (err) {
      console.error("Easter Egg capture failed:", err)
    } finally {
      el.style.transform = savedTransform
      el.style.transformStyle = savedTransformStyle
      el.style.width = savedWidth
      setProcessing(false)
    }
  }

  const reset = () => {
    setStep("ledger")
    setAlias("")
    setAffiliation("")
    setAliasError(false)
    setAffiliationError(false)
    if (imageUrls.length > 0) {
      setBgImage(imageUrls[Math.floor(Math.random() * imageUrls.length)])
    }
  }

  return (
    <ExpandableScreen
      expanded={isExpanded}
      onExpandChange={(expanded) => {
        setIsExpanded(expanded)
        if (!expanded) reset()
      }}
      lockScroll
      layoutId="vip-screen"
      triggerRadius="100px"
      contentRadius="24px"
      animationDuration={0.35}
    >
      <ExpandableScreenContent
        className="bg-[#050505] border border-zinc-700/60 w-[80vw] h-[80vh] lg:w-[65vw] lg:h-[65vh]"
        closeButtonClassName="text-white bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700"
      >
        {step === "ledger" ? (
          <div className="flex items-center justify-center min-h-full p-4">
            <div className="bg-[#0a0a0a] border border-[#B829EA] w-full max-w-md mx-auto p-8">
              <div className="text-center mb-8">
                <p className="text-[#DE005F] text-[0.6rem] tracking-[0.3em] font-bold uppercase font-bohme">
                  Restricted Access
                </p>
                <h3 className="text-white text-[1.25rem] font-bold mt-1 tracking-tight">
                  Disha '26 VIP Pass
                </h3>
                <p className="text-zinc-500 text-[0.7rem] mt-2">
                  The universe chose you, to join the syndicate.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-zinc-500 text-[0.6rem] tracking-[0.2em] uppercase mb-2 font-bohme">
                    Alias
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    autoComplete="off"
                    value={alias}
                    onChange={(e) => {
                      setAlias(e.target.value)
                      setAliasError(false)
                    }}
                    className="w-full bg-transparent border-0 border-b-2 border-zinc-700 text-white text-[0.85rem] pb-2 outline-none focus:border-[#DE005F] transition-colors placeholder:text-zinc-600 rounded-none"
                  />
                  {aliasError && (
                    <p className="text-[#DE005F] text-[0.55rem] tracking-[0.15em] mt-1 font-bohme">
                      YOU SHALL NOT PASS!
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-zinc-500 text-[0.6rem] tracking-[0.2em] uppercase mb-2 font-bohme">
                    Codename
                  </label>
                  <input
                    type="text"
                    placeholder="Your codename"
                    autoComplete="off"
                    value={affiliation}
                    onChange={(e) => {
                      setAffiliation(e.target.value)
                      setAffiliationError(false)
                    }}
                    className="w-full bg-transparent border-0 border-b-2 border-zinc-700 text-white text-[0.85rem] pb-2 outline-none focus:border-[#DE005F] transition-colors placeholder:text-zinc-600 rounded-none"
                  />
                  {affiliationError && (
                    <p className="text-[#DE005F] text-[0.55rem] tracking-[0.15em] mt-1 font-bohme">
                      YOU SHALL NOT PASS!
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full mt-8 py-3 bg-[#DE005F] text-white text-[0.75rem] tracking-[0.15em] font-bold uppercase transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_20px_rgba(222,0,95,0.4)] font-bohme"
              >
                ENTER THE BACKROOMS..
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-full p-4">
            <style>{`
              @keyframes vipGlitch {
                0% { transform: translate(0); opacity: 1; }
                10% { transform: translate(-3px, 2px) skewX(2deg); opacity: 0.7; }
                20% { transform: translate(3px, -1px) skewX(-2deg); opacity: 0.8; }
                30% { transform: translate(-2px, -2px) skewX(1deg); opacity: 0.6; }
                40% { transform: translate(2px, 1px) skewX(-1deg); opacity: 1; }
                50% { transform: translate(-1px, -1px); opacity: 0.9; }
                60% { transform: translate(0); opacity: 1; }
                100% { transform: translate(0); opacity: 1; }
              }
              @keyframes vipGlitchClip {
                0% { clip-path: inset(0 0 98% 0); }
                15% { clip-path: inset(0 0 85% 0); }
                30% { clip-path: inset(20% 0 60% 0); }
                45% { clip-path: inset(50% 0 30% 0); }
                60% { clip-path: inset(80% 0 5% 0); }
                75% { clip-path: inset(10% 0 70% 0); }
                100% { clip-path: inset(0 0 0 0); }
              }
              .vip-glitch {
                animation: vipGlitch 0.5s ease-in-out, vipGlitchClip 0.4s ease-in-out;
              }
              #vip-ticket {
                contain: layout style;
              }
            `}</style>

            <div
              id="vip-ticket-wrapper"
              style={{ perspective: "60rem" }}
              className="relative w-full max-w-sm mx-auto p-4"
            >
              <div
                ref={glitchRef}
                className="absolute inset-0 z-20 pointer-events-none"
              ></div>
              <div
                ref={ticketRef}
                id="vip-ticket"
                style={{
                  transformStyle: "preserve-3d",
                  touchAction: "none",
                  clipPath: "inset(0 round 28px)",
                }}
                className="group/cutout relative bg-[#0a0a0a] border border-zinc-800 rounded-[28px] select-none transition-transform duration-300 ease-out shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.3),0px_4px_8px_-2px_rgba(0,0,0,0.2),0px_8px_16px_-4px_rgba(0,0,0,0.15)] hover:border-zinc-600 hover:shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.4),0px_8px_16px_-4px_rgba(0,0,0,0.3),0px_16px_32px_-8px_rgba(0,0,0,0.2)]"
              >
                <div
                  ref={glareRef}
                  className="pointer-events-none mix-blend-screen absolute inset-0 opacity-0 transition-opacity duration-300 z-30"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.5) 0%, rgba(222,0,95,0.2) 30%, transparent 60%)",
                    backgroundSize: "300% 300%",
                    backgroundPosition: "50% 50%",
                  }}
                ></div>

                <div className="relative overflow-hidden h-40 md:h-44">
                  {bgImage && (
                    <img
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/cutout:scale-105"
                      src={bgImage}
                      alt=""
                      loading="lazy"
                    />
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                </div>

                <div className="relative p-6">
                  <div className="text-center mb-5">
                    <p className="text-[#DE005F] text-[0.5rem] tracking-[0.3em] font-bold uppercase font-bohme">
                      VIP Access
                    </p>
                    <div className="w-8 h-[1px] bg-[#DE005F] mx-auto my-3"></div>
                    <h3 className="text-white text-[1rem] font-bold tracking-tight font-bohme">
                      SYNDICATE MEMBER
                    </h3>
                  </div>

                  <div className="border-t border-b border-zinc-800 py-4 my-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 text-[0.55rem] tracking-[0.2em] uppercase font-bohme">
                        Alias
                      </span>
                      <span
                        className="text-white text-[0.85rem] text-right tracking-[0.05em]"
                        style={{
                          fontFamily: "'Courier New', Courier, monospace",
                        }}
                      >
                        {alias}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 text-[0.55rem] tracking-[0.2em] uppercase font-bohme">
                        Codename
                      </span>
                      <span
                        className="text-white text-[0.85rem] text-right tracking-[0.05em]"
                        style={{
                          fontFamily: "'Courier New', Courier, monospace",
                        }}
                      >
                        {affiliation}
                      </span>
                    </div>
                  </div>

                  <div className="text-center mt-4">
                    <p className="text-[#DE005F] text-[0.5rem] tracking-[0.3em] font-bold font-bohme">
                      DISHA '26
                    </p>
                    <p className="text-zinc-600 text-[0.45rem] tracking-[0.3em] uppercase mt-1 font-bohme">
                      CET College Union
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleExtract}
              disabled={processing}
              className="mt-6 py-3 px-8 bg-transparent border border-[#DE005F] text-[#DE005F] text-[0.7rem] tracking-[0.15em] font-bold uppercase transition-all duration-200 hover:bg-[#DE005F] hover:text-white hover:shadow-[0_0_20px_rgba(222,0,95,0.3)] font-bohme disabled:opacity-50 disabled:pointer-events-none"
            >
              {processing ? "[ PROCESSING... ]" : "[ EXTRACT & SHARE ]"}
            </button>
          </div>
        )}
      </ExpandableScreenContent>
    </ExpandableScreen>
  )
}
