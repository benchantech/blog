export const metadata = {
  title: "Cookie Notice - BenChanTech"
};

export default function CookieNoticePage() {
  return (
    <article className="detail-page legal-page">
      <p className="eyebrow">Cookie Notice</p>
      <h1>Cookie Notice</h1>
      <p>
        BenChanTech may use cookies and similar technologies for Google Analytics measurement when analytics is enabled.
      </p>
      <h2>Analytics cookies</h2>
      <p>
        GA4 helps Ben Chan Tech LLC understand aggregate use of the site, including page views and broad engagement
        patterns. Analytics cookies are optional.
      </p>
      <h2>Consent</h2>
      <p>
        Analytics storage is denied by default unless a visitor allows analytics through the site notice. The site stores
        that choice in the browser so the banner does not need to appear on every page.
      </p>
      <h2>Retention</h2>
      <p>
        Google controls the exact cookie names and expiration periods. GA4 property data retention should be reviewed in
        the Google Analytics console.
      </p>
    </article>
  );
}
