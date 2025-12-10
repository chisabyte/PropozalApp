import Link from "next/link"
import Image from "next/image"

interface LogoProps {
  variant?: "default" | "light"
  showText?: boolean
}

export function Logo({ variant = "default", showText = true }: LogoProps) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
    >
      <Image
        src="/images/propozzy/My Logo.jpg"
        alt="Propozzy Logo"
        width={40}
        height={40}
        className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg object-contain"
        priority
      />
      {showText && (
        <span className={`text-xl font-bold tracking-tight ${
          variant === "light" ? "text-white" : "text-primary"
        }`}>
          Propozzy
        </span>
      )}
    </Link>
  )
}

