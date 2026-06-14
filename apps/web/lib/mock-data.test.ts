import assert from "node:assert/strict";
import test from "node:test";
import { alertRows, counterparties, portfolioRows, relationshipLinks } from "./mock-data.ts";

const validSeverities = new Set(["critical", "high", "medium", "low"]);

test("portfolio and alert rows resolve to a known counterparty", () => {
  const counterpartyIds = new Set(counterparties.map((counterparty) => counterparty.id));

  for (const exposure of portfolioRows) {
    assert.equal(counterpartyIds.has(exposure.entityId), true);
  }

  for (const alert of alertRows) {
    assert.equal(counterpartyIds.has(alert.entityId), true);
  }
});

test("workspace risk severities use the supported contract", () => {
  for (const exposure of portfolioRows) {
    assert.equal(validSeverities.has(exposure.risk), true);
  }

  for (const alert of alertRows) {
    assert.equal(validSeverities.has(alert.severity), true);
  }
});

test("relationship rows always include evidence context", () => {
  for (const relationship of relationshipLinks) {
    assert.notEqual(relationship.source.trim(), "");
    assert.notEqual(relationship.target.trim(), "");
    assert.notEqual(relationship.type.trim(), "");
    assert.notEqual(relationship.confidence.trim(), "");
  }
});
