export function isMaintenanceModeEnabled() {
  return process.env.HATARAKUN_MAINTENANCE_MODE === "true";
}
