import { NextResponse } from "next/server";
import { parseSubmission } from "@/lib/validation";

const REPO = "Kadys-dv/ALPHA-Lab";
type SearchItem = { number:number; body?:string|null; created_at?:string; updated_at?:string };
type SearchResult = { ok:boolean; total_count:number|null; items:SearchItem[]; error?:string };

async function search(label:string, perPage=1):Promise<SearchResult>{
  const q=encodeURIComponent(`repo:${REPO} is:issue label:${label} sort:updated-desc`);
  try{
    const response=await fetch(`https://api.github.com/search/issues?q=${q}&per_page=${perPage}`,{headers:{Accept:"application/vnd.github+json"},next:{revalidate:300}});
    if(!response.ok)return {ok:false,total_count:null,items:[],error:`github_${response.status}`};
    const data=await response.json() as {total_count:number;items:SearchItem[]};
    return {ok:true,total_count:data.total_count,items:data.items};
  }catch{return {ok:false,total_count:null,items:[],error:"github_unreachable"};}
}
const round=(value:number)=>Math.round(value*10)/10;

export async function GET(){
  const checkedAt=new Date().toISOString();
  const [submitted,underReview,accepted]=await Promise.all([search("submission",100),search("under-review"),search("accepted",100)]);
  const parsedAccepted=accepted.ok?accepted.items.flatMap(issue=>{const parsed=parseSubmission(issue.body??"");return parsed?[{issue:issue.number,createdAt:issue.created_at??null,updatedAt:issue.updated_at??null,...parsed}]:[]}):[];
  const builders=parsedAccepted.slice(0,12).map(builder=>({issue:builder.issue,repoUrl:builder.repoUrl,evidenceUrl:builder.evidenceUrl,wallet:`${builder.wallet.slice(0,6)}…${builder.wallet.slice(-4)}`,status:"accepted"}));
  const uniqueBuilders=accepted.ok?new Set(parsedAccepted.map(b=>b.wallet.toLowerCase())).size:null;
  const distinctProjects=accepted.ok?new Set(parsedAccepted.map(b=>b.repoUrl.toLowerCase())).size:null;
  const walletCounts=accepted.ok?parsedAccepted.reduce<Map<string,number>>((m,b)=>{const k=b.wallet.toLowerCase();m.set(k,(m.get(k)??0)+1);return m;},new Map()):null;
  const projectCounts=accepted.ok?parsedAccepted.reduce<Map<string,number>>((m,b)=>{const k=b.repoUrl.toLowerCase();m.set(k,(m.get(k)??0)+1);return m;},new Map()):null;
  const repeatBuilders=walletCounts?[...walletCounts.values()].filter(v=>v>1).length:null;
  const repeatProjects=projectCounts?[...projectCounts.values()].filter(v=>v>1).length:null;
  const approvalRate=submitted.ok&&accepted.ok&&submitted.total_count?round(((accepted.total_count??0)/submitted.total_count)*100):submitted.ok&&accepted.ok?0:null;
  const completionRate=submitted.ok&&accepted.ok&&submitted.total_count?round((parsedAccepted.length/submitted.total_count)*100):submitted.ok&&accepted.ok?0:null;
  const acceptedPerBuilder=accepted.ok&&uniqueBuilders?round(parsedAccepted.length/uniqueBuilders):accepted.ok?0:null;
  const reviewHours=accepted.ok?parsedAccepted.flatMap(b=>b.createdAt&&b.updatedAt?[(new Date(b.updatedAt).getTime()-new Date(b.createdAt).getTime())/3600000]:[]):[];
  const averageReviewHours=accepted.ok&&reviewHours.length?round(reviewHours.reduce((a,b)=>a+b,0)/reviewHours.length):accepted.ok?0:null;
  const successfulSources=[submitted.ok,underReview.ok,accepted.ok].filter(Boolean).length;
  const state=successfulSources===3?"ok":successfulSources===0?"unavailable":"partial";
  return NextResponse.json({state,checkedAt,source:{provider:"github",repository:REPO,healthySources:successfulSources,totalSources:3},metrics:{submitted:submitted.total_count,underReview:underReview.total_count,accepted:accepted.total_count,approvalRate,completionRate,uniqueBuilders,distinctProjects,repeatBuilders,repeatProjects,acceptedPerBuilder,averageReviewHours},builders},{headers:{"Cache-Control":"public, s-maxage=300, stale-while-revalidate=600","X-ALPHA-Status":state}});
}
