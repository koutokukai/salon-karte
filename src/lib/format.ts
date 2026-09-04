/** 日付表示ユーティリティ。表記ゆれを1箇所に閉じ込める。 */

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

export function toDateInputValue(value: Date | string | null | undefined) {
  const date = value ? new Date(value) : new Date();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function relativeDays(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return "本日";
  if (days === 1) return "昨日";
  if (days < 31) return `${days}日前`;
  return `${Math.floor(days / 30)}ヶ月前`;
}
