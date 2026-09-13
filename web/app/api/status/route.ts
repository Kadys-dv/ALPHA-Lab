import { NextResponse } from "next/server";
import { buildPublicStatus, fetchIssuesByLabel } from "@/lib/public-status";

export async function GET(){
  const checkedAt=new Date().toISOString();
  const [submitted,underReview,accepted,started,feedback]=await Promise.all([fetchIssuesByLabel("submission"),fetchIssuesByLabel("under-review"),fetchIssuesByLabel("accepted"),fetchIssuesByLabel("pilot-started"),fetchIssuesByLabel("pilot-feedback")]);
  const status=buildPublicStatus(submitted,underReview,accepted,started,feedback);
  return NextResponse.json({...status,checkedAt},{headers:{"Cache-Control":"public, s-maxage=300, stale-while-revalidate=600","X-ALPHA-Status":status.state}});
}
