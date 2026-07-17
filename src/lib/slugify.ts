export function slugify(text: string): string {
  const replacements: Record<string, string> = {
    ä: "ae",
    ö: "oe",
    ü: "ue",
  };

  text = text.toLowerCase();
  for (const [umlaut, replacement] of Object.entries(replacements)) {
    text = text.split(umlaut).join(replacement);
  }
  return text.replace(/\s+/g, "-");
}
