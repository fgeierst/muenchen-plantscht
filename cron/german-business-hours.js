export function isGermanBusinessHours() {
  const now = new Date();
  const germanTime = now.toLocaleString("en-US", { timeZone: "Europe/Berlin" });
  const hours = new Date(germanTime).getHours();
  const isBusinessHours = hours >= 7 && hours < 23;
  return isBusinessHours;
}
