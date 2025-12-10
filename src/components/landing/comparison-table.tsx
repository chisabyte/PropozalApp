import { Card, CardContent } from "@/components/ui/card"
import { Check, X, Award } from "lucide-react"

const competitors = [
  { name: "Propozzy", isUs: true },
  { name: "Proposal Genie", isUs: false },
  { name: "Better Proposals", isUs: false },
  { name: "Proposify", isUs: false },
]

const features = [
  { feature: "AI-Powered Generation", us: true, them: [true, false, false] },
  { feature: "Portfolio Auto-Matching", us: true, them: [false, false, false] },
  { feature: "Platform-Specific Optimization", us: true, them: [false, false, false] },
  { feature: "Automatic RFP Parsing", us: true, them: [false, false, false] },
  { feature: "Win Rate Analytics", us: true, them: [false, true, true] },
  { feature: "Proposal Templates", us: true, them: [false, true, true] },
  { feature: "PDF Export", us: true, them: [true, true, true] },
  { feature: "Sub-2-Minute Generation", us: true, them: [true, false, false] },
  { feature: "Starting Price", us: "$19/mo", them: ["$9/mo", "$19/mo", "$49/mo"] },
]

export function ComparisonTable() {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal/10 px-4 py-2 text-sm mb-6">
            <Award className="h-4 w-4 text-teal" />
            <span className="text-teal font-medium">Feature Comparison</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-navy">
            See How Propozzy Stacks Up
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            The only proposal tool built from the ground up with AI at its core.
          </p>
        </div>

        <Card className="overflow-hidden border-2 max-w-5xl mx-auto shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-navy text-white">
                    <th className="text-left p-4 lg:p-6 font-semibold">Feature</th>
                    <th className="text-center p-4 lg:p-6 font-semibold bg-teal">
                      <div className="flex items-center justify-center gap-2">
                        <span>Propozzy</span>
                      </div>
                    </th>
                    {competitors.slice(1).map((comp) => (
                      <th key={comp.name} className="text-center p-4 lg:p-6 font-semibold text-white/80">
                        {comp.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {features.map((item, idx) => (
                    <tr key={idx} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="p-4 lg:p-6 font-medium text-navy">{item.feature}</td>
                      <td className="p-4 lg:p-6 text-center bg-teal/5">
                        {item.us === true ? (
                          <div className="flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-teal flex items-center justify-center">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm font-semibold text-teal">{item.us}</span>
                        )}
                      </td>
                      {item.them.map((hasFeature, i) => (
                        <td key={i} className="p-4 lg:p-6 text-center">
                          {hasFeature === true ? (
                            <div className="flex items-center justify-center">
                              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                <Check className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </div>
                          ) : hasFeature === false ? (
                            <div className="flex items-center justify-center">
                              <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center">
                                <X className="h-4 w-4 text-muted-foreground/50" />
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">{hasFeature}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-8 max-w-2xl mx-auto">
          Comparison based on publicly available information as of 2024. Features may vary by plan.
        </p>
      </div>
    </section>
  )
}

