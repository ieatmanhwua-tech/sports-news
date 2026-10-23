export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html) => {
    const gtagSnippet = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-T0QRVM6MCN"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-T0QRVM6MCN');
</script>`;

    const alreadyPresent = html.head.some((entry) => entry.includes('G-T0QRVM6MCN'));
    if (!alreadyPresent) {
      html.head.unshift(gtagSnippet);
    }
  });
});
