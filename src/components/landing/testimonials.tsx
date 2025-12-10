import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote, MessageSquare } from "lucide-react"

interface Testimonial {
  name: string
  role: string
  company: string
  content: string
  rating: number
  highlight?: string
}

const testimonials: Testimonial[] = [
  {
    name: "Sarah Chen",
    role: "Freelance Web Developer",
    company: "Independent",
    content: "Propozzy cut my proposal time from 3 hours to 5 minutes. I've won 3x more projects since using it. The AI really understands how to match my portfolio to client needs.",
    rating: 5,
    highlight: "3x more projects won",
  },
  {
    name: "Marcus Johnson",
    role: "Marketing Consultant",
    company: "MJ Consulting",
    content: "The platform-specific optimization is a game-changer. My Upwork proposals now sound exactly right for that platform. Win rate went from 15% to 42%.",
    rating: 5,
    highlight: "Win rate: 15% → 42%",
  },
  {
    name: "Emily Rodriguez",
    role: "Design Agency Owner",
    company: "Creative Studio",
    content: "We use Propozzy for all our client proposals. The portfolio matching feature ensures we always highlight the most relevant work. Clients love how personalized each proposal feels.",
    rating: 5,
    highlight: "Used for all proposals",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal/10 px-4 py-2 text-sm mb-6">
            <MessageSquare className="h-4 w-4 text-teal" />
            <span className="text-teal font-medium">Customer Stories</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-navy">
            Trusted by Freelancers Worldwide
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            Real results from real users who transformed their proposal process.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="h-full border-2 border-transparent hover:border-teal/20 transition-all duration-300 hover:shadow-lg group">
              <CardContent className="p-6 lg:p-8 flex flex-col h-full">
                {/* Quote icon */}
                <div className="mb-6">
                  <Quote className="h-10 w-10 text-teal/20 group-hover:text-teal/40 transition-colors" />
                </div>

                {/* Highlight badge */}
                {testimonial.highlight && (
                  <div className="mb-4">
                    <span className="inline-block bg-teal/10 text-teal text-sm font-semibold px-3 py-1 rounded-full">
                      {testimonial.highlight}
                    </span>
                  </div>
                )}

                {/* Content */}
                <p className="text-foreground leading-relaxed mb-6 flex-1">
                  "{testimonial.content}"
                </p>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-navy">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

