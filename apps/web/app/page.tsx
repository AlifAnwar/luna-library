import { Card, CardContent, CardHeader, CardTitle } from "@withalif/luna";
import { FoundationControls } from "./foundation-controls";
import styles from "./page.module.css";

const bluePalette = [
  { step: "50", token: "--luna-blue-50", hex: "#EFF5FF" },
  { step: "100", token: "--luna-blue-100", hex: "#DBE8FF" },
  { step: "200", token: "--luna-blue-200", hex: "#B8D0FC" },
  { step: "300", token: "--luna-blue-300", hex: "#80A4F0" },
  { step: "400", token: "--luna-blue-400", hex: "#4D7DDD" },
  { step: "500", token: "--luna-blue-500", hex: "#2763EB" },
  { step: "600", token: "--luna-blue-600", hex: "#2056D2" },
  { step: "700", token: "--luna-blue-700", hex: "#1948B8" },
  { step: "800", token: "--luna-blue-800", hex: "#163B90" },
  { step: "900", token: "--luna-blue-900", hex: "#18366F" },
];

const statusColors = [
  {
    label: "Success",
    description: "Completed and healthy states",
    className: styles.success,
  },
  {
    label: "Warning",
    description: "Attention and pending states",
    className: styles.warning,
  },
  {
    label: "Danger",
    description: "Errors and destructive states",
    className: styles.danger,
  },
  {
    label: "Info",
    description: "Guidance and neutral updates",
    className: styles.info,
  },
];

const chartColors = [
  { label: "Chart 1", token: "--chart-1", value: "#2763EB" },
  { label: "Chart 2", token: "--chart-2", value: "#4D7DDD" },
  { label: "Chart 3", token: "--chart-3", value: "#80A4F0" },
  { label: "Chart 4", token: "--chart-4", value: "#B8D0FC" },
  { label: "Chart 5", token: "--chart-5", value: "#DBE8FF" },
];

const typeScale = [
  {
    label: "Display",
    sample: "Operational clarity",
    className: styles.typeDisplay,
  },
  {
    label: "Page title",
    sample: "Workflow overview",
    className: styles.typePageTitle,
  },
  {
    label: "Heading",
    sample: "Performance summary",
    className: styles.typeHeading,
  },
  {
    label: "Section",
    sample: "Recent activity",
    className: styles.typeSection,
  },
  {
    label: "Body",
    sample: "Supporting information stays easy to scan.",
    className: styles.typeBody,
  },
  {
    label: "Caption",
    sample: "UPDATED 4 MINUTES AGO",
    className: styles.typeCaption,
  },
];

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <a className={styles.brand} href="#top" aria-label="Luna UI home">
          <span className={styles.brandMark}>L</span>
          <span>
            <strong>Luna UI</strong>
            <small>Internal design system</small>
          </span>
        </a>

        <nav className={styles.nav} aria-label="Documentation sections">
          <a className={styles.navActive} href="#foundations">
            Foundations
          </a>
          <a href="#components">Components</a>
          <a href="#data-visualization">Data visualization</a>
        </nav>

        <span className={styles.version}>v1.0</span>
      </header>

      <main id="top" className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>
              <span aria-hidden="true" />
              Foundations · v1
            </div>
            <h1>Luna Foundations</h1>
            <p>
              A compact, accessible foundation for enterprise products—uniting
              color, typography, geometry, density, and elevation in one
              dependable system.
            </p>
            <p className={styles.heroCaption}>
              Designed for information-rich interfaces and operational clarity.
            </p>
          </div>

          <div className={styles.heroPreview} aria-label="Luna color preview">
            <div className={styles.previewHeader}>
              <span>System health</span>
              <span className={styles.liveStatus}>Operational</span>
            </div>
            <div className={styles.metricRow}>
              <div>
                <span>Active workflows</span>
                <strong className={styles.tabularNumber}>2,481</strong>
              </div>
              <span className={styles.metricTrend}>+12.4%</span>
            </div>
            <div className={styles.chart} aria-hidden="true">
              {[42, 58, 48, 72, 64, 86, 76, 94].map((height, index) => (
                <span key={index} style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
        </section>

        <section id="foundations" className={styles.section}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionIndex}>01</span>
              <h2>Brand foundation</h2>
            </div>
            <p>
              Royal blue anchors the Luna identity while neutral surfaces keep
              complex workflows focused and readable.
            </p>
          </div>

          <Card className={styles.paletteCard}>
            <CardHeader className={styles.cardHeading}>
              <div>
                <CardTitle>Luna blue</CardTitle>
                <p>Primitive brand scale</p>
              </div>
              <code>--luna-blue-*</code>
            </CardHeader>
            <CardContent>
              <div className={styles.paletteGrid}>
                {bluePalette.map((color) => (
                  <div className={styles.swatch} key={color.step}>
                    <div
                      className={styles.swatchColor}
                      style={{ backgroundColor: `var(${color.token})` }}
                    />
                    <strong>{color.step}</strong>
                    <span>{color.hex}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className={styles.foundationGrid}>
            <Card className={styles.typeCard}>
              <CardHeader>
                <CardTitle>Type scale</CardTitle>
                <p className={styles.cardDescription}>
                  A restrained hierarchy optimized for dense product screens.
                </p>
              </CardHeader>
              <CardContent className={styles.typeScale}>
                {typeScale.map((type) => (
                  <div key={type.label}>
                    <span>{type.label}</span>
                    <p className={type.className}>{type.sample}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className={styles.tokenCard}>
              <CardHeader>
                <CardTitle>Geometry & elevation</CardTitle>
                <p className={styles.cardDescription}>
                  Semantic primitives keep surfaces quiet and consistent.
                </p>
              </CardHeader>
              <CardContent className={styles.tokenStack}>
                <div className={styles.radiusScale}>
                  <div>
                    <span className={styles.radiusSm} />
                    <strong>sm · 6px</strong>
                  </div>
                  <div>
                    <span className={styles.radiusMd} />
                    <strong>md · 8px</strong>
                  </div>
                  <div>
                    <span className={styles.radiusLg} />
                    <strong>lg · 10px</strong>
                  </div>
                  <div>
                    <span className={styles.radiusXl} />
                    <strong>xl · 12px</strong>
                  </div>
                </div>
                <div className={styles.elevationScale}>
                  <div className={styles.elevationXs}>
                    <span>xs</span>
                    <strong>Card</strong>
                  </div>
                  <div className={styles.elevationSm}>
                    <span>sm</span>
                    <strong>Popover</strong>
                  </div>
                  <div className={styles.elevationMd}>
                    <span>md</span>
                    <strong>Dialog</strong>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="components" className={styles.section}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionIndex}>02</span>
              <h2>Component application</h2>
            </div>
            <p>
              Components consume meaningful tokens instead of implementation
              colors, keeping product behavior consistent.
            </p>
          </div>

          <FoundationControls />

          <div className={styles.componentGrid}>
            <Card className={styles.showcaseCard}>
              <CardHeader>
                <CardTitle>Status colors</CardTitle>
                <p className={styles.cardDescription}>
                  Reserved for meaningful operational feedback.
                </p>
              </CardHeader>
              <CardContent className={styles.statusList}>
                {statusColors.map((status) => (
                  <div className={status.className} key={status.label}>
                    <span aria-hidden="true" />
                    <div>
                      <strong>{status.label}</strong>
                      <p>{status.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className={styles.surfaceCard}>
            <CardHeader>
              <CardTitle>Surface and text hierarchy</CardTitle>
              <p className={styles.cardDescription}>
                Neutral foundations separate content without visual noise.
              </p>
            </CardHeader>
            <CardContent className={styles.surfaceGrid}>
              <div className={styles.backgroundSurface}>
                <span>Background</span>
                <strong>#F6F8FB</strong>
              </div>
              <div className={styles.defaultSurface}>
                <span>Surface</span>
                <strong>#FFFFFF</strong>
              </div>
              <div className={styles.mutedSurface}>
                <span>Surface muted</span>
                <strong>#F3F5F7</strong>
              </div>
              <div className={styles.textPreview}>
                <strong>Primary information</strong>
                <p>Secondary context supports the main content.</p>
                <span>Muted metadata · Updated 4 minutes ago</span>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="data-visualization" className={styles.section}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionIndex}>03</span>
              <h2>Data visualization</h2>
            </div>
            <p>
              A restrained monochromatic scale keeps dashboards cohesive and
              makes comparisons easier to scan.
            </p>
          </div>

          <Card className={styles.chartCard}>
            <CardContent className={styles.chartScale}>
              {chartColors.map((color, index) => (
                <div className={styles.chartColor} key={color.label}>
                  <div
                    style={{
                      backgroundColor: `var(${color.token})`,
                      height: `${100 - index * 11}%`,
                    }}
                  />
                  <span>{color.label}</span>
                  <strong>{color.value}</strong>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>Luna UI · Foundations v1</span>
        <span>Designed for internal enterprise products</span>
      </footer>
    </div>
  );
}
