export function safeParse(
  value: unknown
):
  | { object: Record<string, unknown>; ok: true }
  | { error: string; ok: false } {
  try {
    if (typeof value !== "string") {
      throw new Error("type string expected");
    }
    const content = JSON.parse(value);
    if (typeof content === "object" && content !== null) {
      return {
        object: content,
        ok: true,
      };
    } else {
      throw new Error("type object expected");
    }
  } catch (error) {
    return {
      error: String(error),
      ok: false,
    };
  }
}
