export function LogoCloud() {
  const platforms = [
    { name: "Upwork", letter: "U" },
    { name: "Fiverr", letter: "F" },
    { name: "Thumbtack", letter: "T" },
    { name: "Houzz", letter: "H" },
    { name: "LinkedIn", letter: "in" },
    { name: "Toptal", letter: "T" },
  ]

  return (
    <section className="py-12 lg:py-16 bg-muted/50 border-b">
      <div className="container mx-auto px-4 lg:px-8">
        <p className="text-center text-sm font-medium text-muted-foreground mb-8">
          Optimized for proposals on leading freelance platforms
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className="flex items-center gap-2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-bold text-lg">
                {platform.letter}
              </div>
              <span className="text-lg font-semibold hidden sm:inline">{platform.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
