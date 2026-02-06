interface Choice {
  name: string;
  value: string;
}

interface KeyConfig {
  name: string;
  value: string;
}

export function toChoices<T>(items: T[], focused: string, keys?: KeyConfig): Choice[] {
  return items
    .map((item): Choice => {
      if (typeof item === "string") {
        return { name: item, value: item };
      }
      const obj = item as Record<string, unknown>;
      const name = String(obj[keys?.name ?? "name"] ?? "");
      const value = String(obj[keys?.value ?? "value"] ?? "");
      return { name, value };
    })
    .filter(choice => choice.name.startsWith(focused))
    .slice(0, 25);
}
