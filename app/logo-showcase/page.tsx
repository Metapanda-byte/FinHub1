import { FinHubIQLogo, FinHubIQLogoGlow, FinHubIQLogoAnimated, FinHubIQLogoWithBackground } from '@/components/ui/finhubiq-logo';
import { designTokens } from '@/lib/design-tokens';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function LogoShowcasePage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">FinHubIQ Logo Showcase</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore all variations of the FinHubIQ logo, design tokens, and brand elements.
          This showcase demonstrates the comprehensive design system built for the FinHub application.
        </p>
      </div>

      {/* Primary Logo Variations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Primary Logo Variations</span>
            <Badge variant="secondary">4 variants</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Primary */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Primary</h4>
              <div className="bg-gray-900 p-4 rounded-lg">
                <FinHubIQLogo variant="primary" size="medium" />
              </div>
            </div>

            {/* White */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">White</h4>
              <div className="bg-gray-900 p-4 rounded-lg">
                <FinHubIQLogo variant="white" size="medium" />
              </div>
            </div>

            {/* Black */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Black</h4>
              <div className="bg-white p-4 rounded-lg border">
                <FinHubIQLogo variant="black" size="medium" />
              </div>
            </div>

            {/* Icon */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Icon Only</h4>
              <div className="bg-gray-900 p-4 rounded-lg">
                <FinHubIQLogo variant="icon" size="medium" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout Variations */}
      <Card>
        <CardHeader>
          <CardTitle>Layout Variations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Horizontal */}
            <div className="space-y-3">
              <h4 className="font-medium">Horizontal Layout</h4>
              <div className="bg-gray-900 p-4 rounded-lg">
                <FinHubIQLogo layout="horizontal" size="medium" />
              </div>
            </div>

            {/* Stacked */}
            <div className="space-y-3">
              <h4 className="font-medium">Stacked Layout</h4>
              <div className="bg-gray-900 p-4 rounded-lg">
                <FinHubIQLogo layout="stacked" size="medium" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Size Variations */}
      <Card>
        <CardHeader>
          <CardTitle>Size Variations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Small */}
            <div className="space-y-3">
              <h4 className="font-medium">Small</h4>
              <div className="bg-gray-900 p-4 rounded-lg">
                <FinHubIQLogo size="small" />
              </div>
            </div>

            {/* Medium */}
            <div className="space-y-3">
              <h4 className="font-medium">Medium</h4>
              <div className="bg-gray-900 p-4 rounded-lg">
                <FinHubIQLogo size="medium" />
              </div>
            </div>

            {/* Large */}
            <div className="space-y-3">
              <h4 className="font-medium">Large</h4>
              <div className="bg-gray-900 p-4 rounded-lg">
                <FinHubIQLogo size="large" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Special Effects */}
      <Card>
        <CardHeader>
          <CardTitle>Special Effects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Glow Effect */}
            <div className="space-y-3">
              <h4 className="font-medium">Glow Effect</h4>
              <div className="bg-gray-900 p-4 rounded-lg">
                <FinHubIQLogoGlow size="medium" />
              </div>
            </div>

            {/* Animated */}
            <div className="space-y-3">
              <h4 className="font-medium">Animated (Hover)</h4>
              <div className="bg-gray-900 p-4 rounded-lg">
                <FinHubIQLogoAnimated size="medium" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Background Variations */}
      <Card>
        <CardHeader>
          <CardTitle>Background Variations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Dark Background */}
                          <div className="space-y-3">
                <h4 className="font-medium">Dark Background</h4>
                <FinHubIQLogoWithBackground background="dark" size="medium" />
              </div>

              {/* Light Background */}
              <div className="space-y-3">
                <h4 className="font-medium">Light Background</h4>
                <FinHubIQLogoWithBackground background="light" size="medium" />
              </div>

              {/* Gradient Background */}
              <div className="space-y-3">
                <h4 className="font-medium">Gradient Background</h4>
                <FinHubIQLogoWithBackground background="gradient" size="medium" />
              </div>
          </div>
        </CardContent>
      </Card>

      {/* Design Tokens Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Design Tokens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Color Palette */}
          <div>
            <h4 className="font-medium mb-4">Color Palette</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Primary Orange */}
              <div className="space-y-2">
                <div 
                  className="w-full h-16 rounded-lg"
                  style={{ backgroundColor: designTokens.colors.primary[500] }}
                />
                <div className="text-xs">
                  <div className="font-medium">Primary Orange</div>
                  <div className="text-muted-foreground">{designTokens.colors.primary[500]}</div>
                </div>
              </div>

              {/* Financial Blue */}
              <div className="space-y-2">
                <div 
                  className="w-full h-16 rounded-lg"
                  style={{ backgroundColor: designTokens.colors.financial.blue[600] }}
                />
                <div className="text-xs">
                  <div className="font-medium">Financial Blue</div>
                  <div className="text-muted-foreground">{designTokens.colors.financial.blue[600]}</div>
                </div>
              </div>

              {/* Tech Teal */}
              <div className="space-y-2">
                <div 
                  className="w-full h-16 rounded-lg"
                  style={{ backgroundColor: designTokens.colors.financial.teal[600] }}
                />
                <div className="text-xs">
                  <div className="font-medium">Tech Teal</div>
                  <div className="text-muted-foreground">{designTokens.colors.financial.teal[600]}</div>
                </div>
              </div>

              {/* Success Green */}
              <div className="space-y-2">
                <div 
                  className="w-full h-16 rounded-lg"
                  style={{ backgroundColor: designTokens.colors.semantic.success[600] }}
                />
                <div className="text-xs">
                  <div className="font-medium">Success Green</div>
                  <div className="text-muted-foreground">{designTokens.colors.semantic.success[600]}</div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Typography */}
          <div>
            <h4 className="font-medium mb-4">Typography</h4>
            <div className="space-y-3">
              <div>
                <div className="text-4xl font-bold" style={{ fontFamily: designTokens.typography.fontFamily.primary }}>
                  Heading 1
                </div>
                <div className="text-sm text-muted-foreground">Inter Bold, 32px</div>
              </div>
              <div>
                <div className="text-2xl font-semibold" style={{ fontFamily: designTokens.typography.fontFamily.primary }}>
                  Heading 2
                </div>
                <div className="text-sm text-muted-foreground">Inter SemiBold, 24px</div>
              </div>
              <div>
                <div className="text-lg font-medium" style={{ fontFamily: designTokens.typography.fontFamily.primary }}>
                  Body Large
                </div>
                <div className="text-sm text-muted-foreground">Inter Medium, 18px</div>
              </div>
              <div>
                <div className="text-base" style={{ fontFamily: designTokens.typography.fontFamily.primary }}>
                  Body Regular
                </div>
                <div className="text-sm text-muted-foreground">Inter Regular, 16px</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">When to Use Each Variant</h4>
              <ul className="space-y-2 text-sm">
                <li><strong>Primary:</strong> Main branding, headers, navigation</li>
                <li><strong>White:</strong> Dark backgrounds, overlays, hero sections</li>
                <li><strong>Black:</strong> Light backgrounds, print materials</li>
                <li><strong>Icon:</strong> Favicons, social media, small spaces</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Size Guidelines</h4>
              <ul className="space-y-2 text-sm">
                <li><strong>Small (120px):</strong> Navigation, footers, compact spaces</li>
                <li><strong>Medium (200px):</strong> Headers, main content areas</li>
                <li><strong>Large (300px):</strong> Hero sections, landing pages</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 