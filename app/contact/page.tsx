export const metadata = {
  title: "Contact - BenChanTech"
};

export default function ContactPage() {
  return (
    <article className="detail-page legal-page">
      <p className="eyebrow">Contact</p>
      <h1>Contact Ben Chan Tech LLC</h1>
      <p>For company, accessibility, copyright, privacy, or educational inquiries, contact:</p>
      <p>
        <a className="detail-link" href="mailto:ben@benchantech.com">
          ben@benchantech.com
        </a>
      </p>
      <h2>Response times</h2>
      <p>Replies are not guaranteed and may take several business days or longer depending on availability.</p>
      <h2>Support limits</h2>
      <p>
        This contact address is not for emergencies, urgent security incidents, medical issues, or individualized
        professional advice. Use appropriate qualified services for urgent or high-stakes needs.
      </p>
    </article>
  );
}
