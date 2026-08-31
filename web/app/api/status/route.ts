import { NextResponse } from "next/server";
import { parseSubmission } from "@/lib/validation";

const REPO = "Kadys-dv/ALPHA-Lab";
async function search(label:string, perPage=1){
  const q=encodeURIComponent(`repo:${REPO} is:issue label:${label} sort:updated-desc`);
  const response=await fetch(`https://api.github.com/search/issues?q=${q}&per_page=${perPage}`,{headers:{Accept:"application/vnd.github+json"},next:{revalidate:300}});
  if(!response.ok)return {total_count:0,items:[]} as {total_count:number;items:Array<{number:number;body?:string|null}>};
  return response.json() as Promise<{total_count:number;items:Array<{number:number;body?:string|null}>}>;
}
export async function GET(){
  const [submitted,underReview,accepted]=await Promise.all([search("submission"),search("under-review"),search("accepted",12)]);
  const builders=accepted.items.flatMap(issue=>{const parsed=parseSubmission(issue.body??"");return parsed?[{issue:issue.number,repoUrl:parsed.repoUrl,wallet:`${parsed.wallet.slice(0,6)}…${parsed.wallet.slice(-4)}`,status:"accepted"}]:[]});
  return NextResponse.json({metrics:{submitted:submitted.total_count,underReview:underReview.total_count,accepted:accepted.total_count},builders},{headers:{"Cache-Control":"public, s-maxage=300, stale-while-revalidate=600"}});
}
