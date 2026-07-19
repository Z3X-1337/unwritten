export function bundleStaticHtml({ html, css, app, demoSource }) {
  return html
    .replace('<link rel="stylesheet" href="/styles.css" />', () => `<style>${css}</style>`)
    .replace(
      '<script src="/demo-data.js" defer></script>\n    <script src="/app.js" defer></script>',
      () => `<script>${demoSource}\n${app}</script>`
    );
}
