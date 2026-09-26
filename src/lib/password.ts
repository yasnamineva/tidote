/**
 * What makes a password acceptable here, and what to say when it is not.
 *
 * The form used to refuse anything under eight characters and say so after the
 * fact. That is the least useful moment to learn it: the field hides what it
 * holds, so the person has typed something they cannot see, been told no, and
 * has to guess which part was wrong. These rules are shown as a list that ticks
 * itself off while they type, so the answer arrives before the refusal.
 *
 * Eight characters, a digit and something that is not a letter or a digit.
 * Not because a rule is virtue — a long passphrase beats a short thicket of
 * punctuation — but because a studio account holds every client's measurements
 * and address, and these three catch the passwords that are guessed in an
 * afternoon.
 */

export type Rule = {
  key: "length" | "digit" | "symbol";
  /** Translation key for the line shown beside the tick. */
  labelKey: string;
  met: (password: string) => boolean;
};

export const PASSWORD_RULES: Rule[] = [
  { key: "length", labelKey: "pw.rule.length", met: (p) => p.length >= 8 },
  { key: "digit", labelKey: "pw.rule.digit", met: (p) => /\d/.test(p) },
  {
    key: "symbol",
    labelKey: "pw.rule.symbol",
    met: (p) => /[^\p{L}\p{N}]/u.test(p),
  },
];

/** Every rule not yet satisfied. Empty means the password may be used. */
export function unmetRules(password: string): Rule[] {
  return PASSWORD_RULES.filter((r) => !r.met(password));
}

export function passwordAcceptable(password: string): boolean {
  return unmetRules(password).length === 0;
}

/**
 * A coarse reading of how much work the password is, for the bar under the
 * field. Deliberately blunt: four steps, no score out of a hundred, because a
 * number invites treating "73" as a fact about a secret rather than a hint.
 */
export function passwordStrength(password: string): 0 | 1 | 2 | 3 {
  if (!password) return 0;
  const met = PASSWORD_RULES.filter((r) => r.met(password)).length;
  const long = password.length >= 14;
  const varied = /[a-z]/.test(password) && /[A-Z]/.test(password);
  if (met < PASSWORD_RULES.length) return met === 0 ? 0 : 1;
  if (long && varied) return 3;
  return 2;
}
