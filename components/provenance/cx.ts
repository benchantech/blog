/**
 * Class-name joiner.
 *
 * Deliberately not a template literal. `tests/class-contract.test.ts` treats
 * every `${...}` inside a `className` expression as a dynamic class that must be
 * registered in DYNAMIC_CLASS_EXPANSIONS, so `` className={`${a} ${b}`} `` is a
 * hard test failure by design. Joining an array keeps CSS-Module composition
 * inside mode 2's `styles.<key>` coverage instead.
 */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
