/**
 * SlotMachine — Casino-style randomizer for picking an event theme.
 *
 * Three reels of theme emojis spin and clunk to a stop one at a time, just like
 * a real slot machine. When the third reel lands, the chosen theme is locked in.
 *
 * Props:
 *   - onLand(theme): called when the third reel finishes spinning
 *   - autoSpinOnMount: kick off a spin as soon as the component mounts
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import { EVENT_THEMES, EventTheme, randomTheme } from '@/lib/event-themes'

interface Props {
  onLand: (theme: EventTheme) => void
  autoSpinOnMount?: boolean
}

// Quick pool used to populate the spinning reels with visual variety
const REEL_POOL = EVENT_THEMES.map(t => ({ emoji: t.emoji, color: t.color }))

// Pick N random items from the pool for one reel
function buildReelStrip(): { emoji: string; color: string }[] {
  const strip: { emoji: string; color: string }[] = []
  for (let i = 0; i < 30; i++) {
    strip.push(REEL_POOL[Math.floor(Math.random() * REEL_POOL.length)])
  }
  return strip
}

export default function SlotMachine({ onLand, autoSpinOnMount = false }: Props) {
  const [spinning, setSpinning] = useState(false)
  const [reel1, setReel1] = useState(() => buildReelStrip())
  const [reel2, setReel2] = useState(() => buildReelStrip())
  const [reel3, setReel3] = useState(() => buildReelStrip())
  const [stopped, setStopped] = useState<[boolean, boolean, boolean]>([true, true, true])
  const [winner, setWinner] = useState<EventTheme | null>(null)
  const hasAutoSpun = useRef(false)

  function spin() {
    if (spinning) return
    setWinner(null)
    setSpinning(true)
    setStopped([false, false, false])

    // Choose the actual winning theme up front so all three reels can be
    // primed to land on it (their final emoji is set to the winner's emoji)
    const chosen = randomTheme()

    // Build new strips and force the LAST item to be the chosen theme's emoji
    const s1 = buildReelStrip(); s1[s1.length - 1] = { emoji: chosen.emoji, color: chosen.color }
    const s2 = buildReelStrip(); s2[s2.length - 1] = { emoji: chosen.emoji, color: chosen.color }
    const s3 = buildReelStrip(); s3[s3.length - 1] = { emoji: chosen.emoji, color: chosen.color }
    setReel1(s1); setReel2(s2); setReel3(s3)

    // Stop reels one at a time (clunk... clunk... clunk!) for that real slot feel
    setTimeout(() => setStopped(s => [true,  s[1], s[2]]), 1400)
    setTimeout(() => setStopped(s => [s[0], true,  s[2]]), 1900)
    setTimeout(() => {
      setStopped(s => [s[0], s[1], true])
      setSpinning(false)
      setWinner(chosen)
      onLand(chosen)
    }, 2500)
  }

  // Optionally spin once on mount
  useEffect(() => {
    if (autoSpinOnMount && !hasAutoSpun.current) {
      hasAutoSpun.current = true
      // brief delay so the user sees the machine before it starts
      setTimeout(spin, 400)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSpinOnMount])

  return (
    <div className="flex flex-col items-center gap-4">
      {/* The slot machine cabinet */}
      <div
        className="relative rounded-3xl p-5 pb-4 shadow-2xl"
        style={{
          background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 50%, #FF6B00 100%)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.6)',
        }}
      >
        {/* Top crown / marquee */}
        <div className="text-center mb-3">
          <div
            className="inline-block px-4 py-1 rounded-full text-white font-extrabold text-xs tracking-widest"
            style={{
              background: 'linear-gradient(180deg, #C0392B 0%, #8B0000 100%)',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.3)',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            }}
          >
            🎰 JACKPOT 🎰
          </div>
        </div>

        {/* Reel window */}
        <div
          className="flex gap-2 p-3 rounded-2xl"
          style={{
            background: '#1a1a1a',
            boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.6)',
          }}
        >
          <Reel strip={reel1} stopped={stopped[0]} />
          <Reel strip={reel2} stopped={stopped[1]} />
          <Reel strip={reel3} stopped={stopped[2]} />
        </div>

        {/* Side bulbs (decorative) */}
        <div className="absolute left-1 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
          {[0,1,2,3].map(i => (
            <div key={i} className={`w-2 h-2 rounded-full ${spinning ? 'bg-red-400' : 'bg-yellow-200'}`}
                 style={{
                   animation: spinning ? `bulb-blink 0.4s ease-in-out infinite ${i * 0.1}s` : 'none',
                   boxShadow: '0 0 4px rgba(255,200,0,0.8)',
                 }}/>
          ))}
        </div>
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
          {[0,1,2,3].map(i => (
            <div key={i} className={`w-2 h-2 rounded-full ${spinning ? 'bg-red-400' : 'bg-yellow-200'}`}
                 style={{
                   animation: spinning ? `bulb-blink 0.4s ease-in-out infinite ${i * 0.1}s` : 'none',
                   boxShadow: '0 0 4px rgba(255,200,0,0.8)',
                 }}/>
          ))}
        </div>
      </div>

      {/* Big SPIN lever button */}
      <button
        onClick={spin}
        disabled={spinning}
        className="px-8 py-3 rounded-full text-white font-extrabold text-base shadow-lg transition-transform active:scale-95 disabled:opacity-50"
        style={{
          background: spinning
            ? 'linear-gradient(180deg, #999 0%, #666 100%)'
            : 'linear-gradient(180deg, #E74C3C 0%, #C0392B 100%)',
          boxShadow: '0 4px 12px rgba(231,76,60,0.4), inset 0 1px 2px rgba(255,255,255,0.4)',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
        }}
      >
        {spinning ? '🎰 Spinning...' : winner ? '🎲 Spin Again!' : '🎰 PULL LEVER!'}
      </button>

      {/* Winner reveal — pops in once all reels stop */}
      {winner && !spinning && (
        <div
          className="bg-white rounded-2xl px-5 py-4 shadow-lg text-center max-w-xs"
          style={{
            border: `3px solid ${winner.color}`,
            animation: 'jackpot-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <div className="text-4xl mb-1">{winner.emoji}</div>
          <p className="font-extrabold text-base text-gray-900">{winner.name}</p>
          <p className="text-xs text-gray-500 italic mt-1">{winner.tagline}</p>
          <div className="mt-2 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white"
               style={{ background: winner.color }}>
            {winner.category}
          </div>
        </div>
      )}

      {/* Animation keyframes */}
      <style>{`
        @keyframes reel-spin {
          0%   { transform: translateY(0); }
          100% { transform: translateY(calc(-100% + 96px)); }
        }
        @keyframes bulb-blink {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.3; }
        }
        @keyframes jackpot-pop {
          0%   { opacity: 0; transform: scale(0.7); }
          60%  { transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

// ── Single reel (one of three) ────────────────────────────────────────────────

function Reel({ strip, stopped }: { strip: { emoji: string; color: string }[]; stopped: boolean }) {
  return (
    <div
      className="overflow-hidden rounded-lg"
      style={{
        width: 64,
        height: 96,
        background: 'linear-gradient(180deg, #f5f5f5 0%, #fff 50%, #f5f5f5 100%)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2), inset 0 -2px 4px rgba(0,0,0,0.2)',
      }}
    >
      <div
        style={{
          // While not stopped, the reel scrolls fast vertically. Once stopped,
          // it snaps to show the LAST item in the strip (the winner emoji).
          transform: stopped ? `translateY(-${(strip.length - 1) * 32}px)` : 'translateY(0)',
          transition: stopped ? 'transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)' : 'none',
          animation: stopped ? 'none' : 'reel-spin 0.15s linear infinite',
        }}
      >
        {strip.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-center text-2xl"
            style={{ height: 32, width: 64 }}
          >
            {item.emoji}
          </div>
        ))}
      </div>
    </div>
  )
}
