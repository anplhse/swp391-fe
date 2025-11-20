/**
 * Design System Showcase Component
 * Demonstrates the usage of new shadow system, font system, and other design tokens
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function DesignSystemShowcase() {
  return (
    <div className="space-y-12 p-8">
      {/* Typography System */}
      <section>
        <h2 className="text-3xl font-sans font-bold mb-6">Typography System</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Sans Serif (Montserrat) - Primary Font</p>
            <h1 className="text-4xl font-sans font-bold">VinFast Service Workshop</h1>
            <p className="text-lg font-sans">Modern, clean, and professional typography for headings and body text.</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Serif (Merriweather) - Accent Font</p>
            <h2 className="text-3xl font-serif font-bold">Excellence in Service</h2>
            <p className="text-lg font-serif">Elegant and sophisticated typography for special content.</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Monospace (Ubuntu Mono) - Code Font</p>
            <code className="text-lg font-mono bg-muted p-2 rounded">const example = "Hello World";</code>
          </div>
        </div>
      </section>

      {/* Shadow System */}
      <section>
        <h2 className="text-3xl font-sans font-bold mb-6">Shadow System (7 Levels)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-2xs hover:shadow-xs transition-smooth">
            <CardHeader>
              <CardTitle className="text-lg">2XS Shadow</CardTitle>
              <CardDescription>Very subtle elevation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">shadow-2xs</p>
            </CardContent>
          </Card>

          <Card className="shadow-xs hover:shadow-sm transition-smooth">
            <CardHeader>
              <CardTitle className="text-lg">XS Shadow</CardTitle>
              <CardDescription>Minimal elevation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">shadow-xs</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-smooth">
            <CardHeader>
              <CardTitle className="text-lg">SM Shadow</CardTitle>
              <CardDescription>Small elevation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">shadow-sm</p>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-smooth">
            <CardHeader>
              <CardTitle className="text-lg">MD Shadow (Default)</CardTitle>
              <CardDescription>Medium elevation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">shadow-md</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-smooth">
            <CardHeader>
              <CardTitle className="text-lg">LG Shadow</CardTitle>
              <CardDescription>Large elevation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">shadow-lg</p>
            </CardContent>
          </Card>

          <Card className="shadow-xl hover:shadow-2xl transition-smooth">
            <CardHeader>
              <CardTitle className="text-lg">XL Shadow</CardTitle>
              <CardDescription>Extra large elevation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">shadow-xl</p>
            </CardContent>
          </Card>

          <Card className="shadow-2xl hover:shadow-electric transition-smooth">
            <CardHeader>
              <CardTitle className="text-lg">2XL Shadow</CardTitle>
              <CardDescription>Maximum elevation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">shadow-2xl</p>
            </CardContent>
          </Card>

          <Card className="shadow-electric">
            <CardHeader>
              <CardTitle className="text-lg">Electric Glow</CardTitle>
              <CardDescription>Special effect shadow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">shadow-electric</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Button Variants with Shadows */}
      <section>
        <h2 className="text-3xl font-sans font-bold mb-6">Buttons with Enhanced Shadows</h2>
        <div className="flex flex-wrap gap-4">
          <Button className="shadow-md hover:shadow-lg">Default Button</Button>
          <Button variant="outline" className="shadow-sm hover:shadow-md">Outline Button</Button>
          <Button variant="secondary" className="shadow-md hover:shadow-lg">Secondary Button</Button>
          <Button variant="success" className="shadow-md hover:shadow-xl">Success Button</Button>
          <Button variant="warning" className="shadow-md hover:shadow-xl">Warning Button</Button>
          <Button variant="destructive" className="shadow-md hover:shadow-lg">Destructive Button</Button>
          <Button variant="electric" className="shadow-electric">Electric Button</Button>
        </div>
      </section>

      {/* Transition System */}
      <section>
        <h2 className="text-3xl font-sans font-bold mb-6">Transition System</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-md hover:shadow-xl transition-smooth">
            <CardHeader>
              <CardTitle>Smooth Transition</CardTitle>
              <CardDescription>Hover to see smooth easing</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Uses: ease-smooth or transition-smooth class
              </p>
              <code className="text-xs font-mono bg-muted p-2 rounded block mt-2">
                cubic-bezier(0.4, 0, 0.2, 1)
              </code>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-xl hover:scale-105 transition-bounce">
            <CardHeader>
              <CardTitle>Bounce Transition</CardTitle>
              <CardDescription>Hover to see bouncy effect</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Uses: ease-bounce or transition-bounce class
              </p>
              <code className="text-xs font-mono bg-muted p-2 rounded block mt-2">
                cubic-bezier(0.68, -0.55, 0.265, 1.55)
              </code>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Chart Colors */}
      <section>
        <h2 className="text-3xl font-sans font-bold mb-6">Chart Color Palette</h2>
        <div className="grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num} className="space-y-2">
              <div
                className={`h-24 rounded-lg shadow-lg bg-chart-${num} flex items-center justify-center`}
              >
                <span className="text-white font-sans font-bold text-2xl drop-shadow-md">
                  {num}
                </span>
              </div>
              <p className="text-sm text-center font-mono text-muted-foreground">
                bg-chart-{num}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Card Variants */}
      <section>
        <h2 className="text-3xl font-sans font-bold mb-6">Card Variations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Subtle Card</CardTitle>
              <CardDescription>Minimal shadow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Perfect for secondary content or nested elements.</p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Standard Card</CardTitle>
              <CardDescription>Default shadow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">The default card elevation for most use cases.</p>
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Prominent Card</CardTitle>
              <CardDescription>Strong shadow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Use for primary content or featured items.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Usage Guide */}
      <section className="bg-muted/30 rounded-xl p-8 shadow-lg">
        <h2 className="text-3xl font-sans font-bold mb-4">Usage Guidelines</h2>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-sans font-semibold mb-2">Typography</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><code className="font-mono">font-sans</code> - Use for headings, UI elements, and body text</li>
              <li><code className="font-mono">font-serif</code> - Use for editorial content or special emphasis</li>
              <li><code className="font-mono">font-mono</code> - Use for code snippets and technical content</li>
            </ul>
          </div>
          <div>
            <h3 className="font-sans font-semibold mb-2">Shadows</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><code className="font-mono">shadow-2xs, shadow-xs</code> - Subtle depth for inline elements</li>
              <li><code className="font-mono">shadow-sm, shadow-md</code> - Standard elevation for cards and panels</li>
              <li><code className="font-mono">shadow-lg, shadow-xl, shadow-2xl</code> - Prominent elevation for modals and important content</li>
              <li><code className="font-mono">shadow-electric</code> - Special glow effect for call-to-action elements</li>
            </ul>
          </div>
          <div>
            <h3 className="font-sans font-semibold mb-2">Transitions</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><code className="font-mono">transition-smooth</code> - Smooth, professional transitions</li>
              <li><code className="font-mono">transition-bounce</code> - Playful, attention-grabbing transitions</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

