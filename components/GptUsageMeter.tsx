import usage from "@/content/company/gpt-usage.json";
import styles from "./GptUsageMeter.module.css";

export type GptUsageObservation = typeof usage;

function formatObservedDateTime(value: string): string {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2})?([+-]\d{2}:\d{2}|Z)$/,
  );

  if (!match) return value;

  const [, year, month, day, hour, minute, offset] = match;
  const monthName = new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(Number(year), Number(month) - 1, 1)));
  const hourNumber = Number(hour);
  const displayHour = hourNumber % 12 || 12;
  const meridiem = hourNumber >= 12 ? "PM" : "AM";
  const zone = offset === "Z" ? "UTC" : `UTC${offset.replace("-", "−")}`;

  return `${monthName} ${Number(day)}, ${year} at ${displayHour}:${minute} ${meridiem} ${zone}`;
}

export function GptUsageMeter({ observation = usage }: { observation?: GptUsageObservation }) {
  return (
    <aside className={styles.meter} aria-labelledby="gpt-usage-meter-heading">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>$20 Operating Meter</p>
          <h2 className={styles.heading} id="gpt-usage-meter-heading">
            ChatGPT Plus usage
          </h2>
        </div>
        <p className={styles.remaining} aria-label={`${observation.remainingPercent} percent remaining`}>
          <strong>{observation.remainingPercent}%</strong>
          <span>remaining</span>
        </p>
      </div>

      <dl className={styles.details}>
        <div>
          <dt>Required AI cost</dt>
          <dd>${observation.planCostMonthlyUsd}/month</dd>
        </div>
        <div>
          <dt>Resets</dt>
          <dd><time dateTime={observation.resetAt}>{formatObservedDateTime(observation.resetAt)}</time></dd>
        </div>
        <div>
          <dt>Last observed</dt>
          <dd><time dateTime={observation.observedAt}>{formatObservedDateTime(observation.observedAt)}</time></dd>
        </div>
      </dl>

      <p className={styles.disclosure}>
        Manually observed in ChatGPT—not via private API or account scraping.
      </p>
    </aside>
  );
}
