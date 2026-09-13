import { describe, expect, it } from "vitest";
import { parseReviewRecord } from "@/lib/builders";

describe("builder review record", () => {
  it("parses a stored public rubric", () => {
    const review = {
      criteria: { context: "aprovado", installation: "aprovado", decisions: "ajustes necessários", tests: "aprovado", demo: "não se aplica" },
      result: "aprovado",
      recommendation: "Documentar a decisão principal.",
      reviewer: "maintainer",
    };
    const parsed = parseReviewRecord(`Issue body\n<!-- alpha-review-record\n${JSON.stringify(review)}\n-->`);
    expect(parsed).toEqual(review);
  });

  it("rejects incomplete records", () => {
    expect(parseReviewRecord("<!-- alpha-review-record\n{}\n-->")).toBeNull();
  });
});
