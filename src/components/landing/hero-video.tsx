"use client"

export function HeroVideo() {
  return (
    <div className="relative w-full aspect-[16/9] overflow-hidden bg-white/5">
      <video
        src="/images/propozzy/Landing Page Hero Illustration video.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-contain"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  )
}
