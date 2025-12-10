"use client"

import Image from "next/image"

export function HeroVideo() {
  return (
    <div className="relative w-full aspect-[16/9] overflow-hidden bg-white/5 flex items-center justify-center">
      <Image
        src="/images/propozzy/news.png"
        alt="Propozzy News - AI-powered proposal generator"
        fill
        className="object-contain"
        priority
      />
    </div>
  )
}
