import { useState, useRef, useEffect, type ComponentType } from "react"
import { X } from "lucide-react"

interface EasterEggVIPProps {
  imageUrls?: string[]
}

export default function EasterEggVIP({ imageUrls = [] }: EasterEggVIPProps) {
  const [phase, setPhase] = useState<
    "idle" | "ledger" | "transitioning" | "artifact_revealed"
  >("idle")

  const [alias, setAlias] = useState("")
  const [affiliation, setAffiliation] = useState("")
  const [aliasError, setAliasError] = useState(false)
  const [affiliationError, setAffiliationError] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [bgImage, setBgImage] = useState("")
  const [pixelate, setPixelate] = useState(true)
  const [cardVisible, setCardVisible] = useState(false)
  const [PCard, setPCard] = useState<ComponentType<any> | null>(null)
  const [GScan, setGScan] = useState<ComponentType<any> | null>(null)
  const preloadedRef = useRef(false)

  const preloadComponents = () => {
    if (preloadedRef.current) return
    preloadedRef.current = true
    import("./PixelCard").then(m => setPCard(() => (m as any).default))
    import("./GridScan").then(m => setGScan(() => (m as any).default))
  }

  const ticketRef = useRef<HTMLDivElement>(null)
  const glareRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (imageUrls.length > 0 && !bgImage) {
      setBgImage(imageUrls[Math.floor(Math.random() * imageUrls.length)])
    }
  }, [imageUrls, bgImage])

  useEffect(() => {
    const handler = () => {
      freezePage(true)
      setPhase("ledger")
      preloadComponents()
    }
    window.addEventListener("trigger-vip-egg", handler)
    return () => window.removeEventListener("trigger-vip-egg", handler)
  }, [])

  const freezePage = (freeze: boolean) => {
    if (freeze) {
      document.body.style.overflow = "hidden"
      document.body.dataset.expanded = "true"
      if (!document.getElementById("expanded-freeze-styles")) {
        const style = document.createElement("style")
        style.id = "expanded-freeze-styles"
        style.textContent =
          `body[data-expanded] #page-freeze-zone * { animation-play-state: paused !important; }`
        document.head.appendChild(style)
      }
      window.dispatchEvent(new CustomEvent("freeze-page-animations", { detail: { frozen: true } }))
    } else {
      document.body.style.overflow = ""
      delete document.body.dataset.expanded
      document.getElementById("expanded-freeze-styles")?.remove()
      window.dispatchEvent(new CustomEvent("freeze-page-animations", { detail: { frozen: false } }))
    }
  }

  useEffect(() => {
    if (phase === "idle") {
      freezePage(false)
    }
  }, [phase])

  useEffect(() => {
    if (phase === "idle") return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [phase])

  useEffect(() => {
    const el = ticketRef.current
    if (
      !el ||
      phase !== "artifact_revealed"
    )
      return

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

      const t =
        ((performance.now() - startTime) / 1000) * IDLE_SPEED * Math.PI * 2
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
  }, [phase])

  const handleSubmit = () => {
    const validAlias = alias.trim().length > 0
    const validAffiliation = affiliation.trim().length > 0
    setAliasError(!validAlias)
    setAffiliationError(!validAffiliation)
    if (!validAlias || !validAffiliation) return

    setPhase("transitioning")
    setCardVisible(false)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setCardVisible(true)
      })
    })
  }

  const handleCardReveal = () => {
    if (phase === "transitioning") {
      setPixelate(false)
      setTimeout(() => {
        setPhase("artifact_revealed")
      }, 600)
    }
  }

  const handleClose = () => {
    freezePage(false)
    setPhase("idle")
    resetForm()
  }

  const resetForm = () => {
    setAlias("")
    setAffiliation("")
    setAliasError(false)
    setAffiliationError(false)
    if (imageUrls.length > 0) {
      setBgImage(imageUrls[Math.floor(Math.random() * imageUrls.length)])
    }
  }

  const downloadBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "Disha26VIP_Pass.png"
    a.style.display = "none"
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 1000)
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

    const cardImg = el.querySelector("img")
    if (cardImg && !cardImg.complete) {
      await new Promise<void>((resolve) => {
        cardImg.onload = () => resolve()
        cardImg.onerror = () => resolve()
      })
    }

    try {
      const { toBlob } = await import("html-to-image").catch(() => null)
      if (!toBlob) {
        console.warn("Capture library unavailable")
        return
      }
      const blob = await toBlob(el, {
        backgroundColor: "#050505",
        pixelRatio: 2,
        fontEmbedCSS: "",
        skipFonts: true,
      })

      if (!blob) return

      const file = new File([blob], "Disha26VIP_Pass.png", {
        type: "image/png",
      })

      try {
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "Disha '26",
            text: "Here's my Disha 2026 VIP Pass, where's yours?",
          })
          return
        }
      } catch {
        // File share cancelled or failed — fall through to download
      }

      downloadBlob(blob)
    } catch (err) {
      console.error("Easter Egg capture failed:", err)
    } finally {
      el.style.transform = savedTransform
      el.style.transformStyle = savedTransformStyle
      el.style.width = savedWidth
      setProcessing(false)
    }
  }

  return (
    <>
      <style>{`
        .bg-card-pan {
          background: linear-gradient(
            135deg,
            #0a0a0a,
            #1a1525,
            #2d0a3d
          );
        }
        @keyframes formEnter {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .form-enter {
          animation: formEnter 0.3s ease-out forwards;
        }

        #vip-ticket {
          contain: layout style;
        }
      `}</style>

      {(phase === "ledger" ||
        phase === "transitioning" ||
        phase === "artifact_revealed") && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          {GScan ? (
            <GScan
              sensitivity={0.55}
              lineThickness={1.5}
              linesColor="#2F293A"
              gridScale={0.2}
              scanColor="#FF9FFC"
              scanOpacity={0.4}
              enablePost
              bloomIntensity={0.6}
              chromaticAberration={0.0015}
              noiseIntensity={0.025}
              lineJitter={0.43}
              scanGlow={0.7}
              scanSoftness={1.1}
            />
          ) : null}
        </div>
      )}

      {(phase === "ledger" || phase === "artifact_revealed") && (
        <button
          onClick={handleClose}
          className="fixed right-6 top-20 z-[70] flex h-10 w-10 items-center justify-center rounded-full text-white bg-zinc-700 hover:bg-[#DE005F] border border-zinc-600 hover:border-[#DE005F] shadow-[0_0_12px_rgba(222,0,95,0.15)] transition-all"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      {phase === "ledger" && (
        <div className="fixed inset-x-0 top-[70px] bottom-0 z-50 flex items-center justify-center bg-transparent p-4 overflow-y-auto">
          <div className="bg-[#0a0a0a] w-full max-w-md mx-auto p-8 form-enter">
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
      )}

      {(phase === "transitioning" ||
        phase === "artifact_revealed") && (
        <div className="fixed inset-x-0 top-[70px] bottom-0 z-50 flex flex-col items-center justify-center p-4 overflow-y-auto">
          <div
            className="relative w-full max-w-sm mx-auto"
            style={{
              opacity: 1,
              transform: cardVisible ? 'scale(1)' : 'scale(0.7)',
              transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              perspective: phase === "artifact_revealed" ? "60rem" : undefined,
            }}
          >
            {PCard ? (
              <PCard
                pixelate={phase === "transitioning"}
                onClick={phase === "transitioning" ? handleCardReveal : undefined}
                speed={40}
                variant="pink"
              >
                {phase === "artifact_revealed" ? (
                <div
                  ref={ticketRef}
                  id="vip-ticket"
                  style={{
                    transformStyle: "preserve-3d",
                    touchAction: "none",
                  }}
                  className="group/cutout relative bg-card-pan rounded-[28px] select-none transition-transform duration-300 ease-out shadow-[0_30px_80px_rgba(0,0,0,0.6),0_10px_30px_-5px_rgba(222,0,95,0.12)] hover:shadow-[0_40px_100px_rgba(0,0,0,0.7),0_15px_40px_-5px_rgba(222,0,95,0.2)]"
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
                  />
                  <div className="relative overflow-hidden h-40 md:h-44">
                    {bgImage && (
                      <img
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/cutout:scale-105"
                        src={bgImage}
                        alt=""
                      />
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  </div>
                  <div className="relative p-6">
                    <div className="text-center mb-5">
                      <p className="text-[#DE005F] text-[0.5rem] tracking-[0.3em] font-bold uppercase font-bohme">
                        VIP Access
                      </p>
                      <div className="w-8 h-[1px] bg-[#DE005F] mx-auto my-3" />
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
              ) : (
                <div className="min-h-[410px] md:min-h-[430px]" />
              )}
            </PCard>
          ) : (
            <div className="min-h-[410px] md:min-h-[430px]" />
          )}

          </div>

          {phase === "artifact_revealed" && (
            <button
              onClick={handleExtract}
              disabled={processing}
              className="mt-6 py-3 px-8 bg-transparent border border-[#DE005F] text-[#DE005F] text-[0.7rem] tracking-[0.15em] font-bold uppercase transition-all duration-200 hover:bg-[#DE005F] hover:text-white hover:shadow-[0_0_20px_rgba(222,0,95,0.3)] font-bohme disabled:opacity-50 disabled:pointer-events-none"
            >
              {processing ? "[ PROCESSING... ]" : "[ EXTRACT & SHARE ]"}
            </button>
          )}
        </div>
      )}
    </>
  )
}
