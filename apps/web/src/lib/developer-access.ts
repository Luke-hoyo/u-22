export function isLoginRequired() {
  return process.env.HATARAKUN_REQUIRE_AUTH === "true";
}
