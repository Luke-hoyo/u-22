import assert from "node:assert/strict";
import { createFarmerInviteCode, resolveRoleInviteDetailed } from "../src/lib/role-invites";

process.env.HATARAKUN_INVITE_SIGNING_SECRET = "test-invite-signing-secret-for-unit";
delete process.env.HATARAKUN_FARMER_INVITE_CODE;
delete process.env.HATARAKUN_MUNICIPALITY_INVITE_CODE;
delete process.env.HATARAKUN_OPERATOR_INVITE_CODE;

const code = createFarmerInviteCode({
  applicationId: "FARM-REQ-1",
  farmName: "西条みのりファーム",
  email: "owner@example.com"
});
assert.ok(code);

const matched = resolveRoleInviteDetailed(code as string, "owner@example.com");
assert.equal(matched.ok, true);

const wrongEmail = resolveRoleInviteDetailed(code as string, "intruder@example.com");
assert.equal(wrongEmail.ok, false);
if (!wrongEmail.ok) {
  assert.equal(wrongEmail.reason, "email_mismatch");
}

process.env.HATARAKUN_FARMER_INVITE_CODE = "LEAKED-FARMER";
const leaked = resolveRoleInviteDetailed("LEAKED-FARMER", "anyone@example.com");
assert.equal(leaked.ok, false);

process.env.HATARAKUN_OPERATOR_INVITE_CODE = "STAFF-OP-1";
const staff = resolveRoleInviteDetailed("STAFF-OP-1", "anyone@example.com");
assert.equal(staff.ok, true);

console.log("role-invites checks passed");
