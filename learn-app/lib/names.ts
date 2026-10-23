/**
 * Child display names: a first name or nickname only, kept on this device.
 * The rules keep personal details out (no surnames, numbers, emails, links)
 * and stop rude words from showing up on a shared screen.
 */

export const NAME_MAX = 14;

export type NameCheck = { ok: true; name: string } | { ok: false; reason: string };

// matched anywhere in the name (letters only, lower case)
const ROOTS = ["fuck", "shit", "bitch", "cunt", "asshole", "bastard", "whore", "slut", "nigg", "fagg", "retard", "porn", "penis", "vagina", "nazi", "hitler"];
// matched as the whole name
const WORDS = ["ass", "sex", "dick", "cock", "pussy", "fag", "poop", "butt", "boob", "boobs", "kill", "die", "dumb", "stupid", "idiot", "ugly", "fat"];

export function checkName(raw: string): NameCheck {
  const name = raw.normalize("NFC").replace(/\s+/g, " ").trim();
  if (!name) return { ok: false, reason: "Type a first name or a nickname." };
  if (/[@/\\]|www|https?/i.test(name)) return { ok: false, reason: "Just a name, please: no emails or links." };
  if (/\d/.test(name)) return { ok: false, reason: "Letters only, please: no numbers." };
  if (name.includes(" ")) return { ok: false, reason: "One word is enough: a first name or a nickname, no last name." };
  if (!/^\p{L}[\p{L}'’-]*$/u.test(name)) return { ok: false, reason: "Letters only, please." };
  if (name.length > NAME_MAX) return { ok: false, reason: `Keep it short: up to ${NAME_MAX} letters.` };
  const flat = name.toLowerCase().replace(/[^\p{L}]/gu, "");
  if (ROOTS.some((r) => flat.includes(r)) || WORDS.includes(flat)) return { ok: false, reason: "Let's pick a different name." };
  return { ok: true, name: name[0].toLocaleUpperCase() + name.slice(1) };
}
