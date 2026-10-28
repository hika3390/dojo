export class DateKey {
  private constructor(readonly value: string) {}

  static of(date: Date): DateKey {
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return new DateKey(`${date.getFullYear()}-${m}-${d}`);
  }

  static daysBefore(date: Date, days: number): DateKey {
    const shifted = new Date(date);
    shifted.setDate(shifted.getDate() - days);
    return DateKey.of(shifted);
  }
}
