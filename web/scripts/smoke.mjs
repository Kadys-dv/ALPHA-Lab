const url=process.env.PUBLIC_SITE_URL||"https://alpha-builders.kadys-v2.chatgpt.site";
const response=await fetch(url,{redirect:"follow"});
if(!response.ok)throw new Error(`Site returned ${response.status}`);
const html=await response.text();
for(const marker of ["ALPHA","84532","Base Sepolia"]){if(!html.includes(marker))throw new Error(`Missing marker: ${marker}`)}
for(const marker of ["Base Mainnet","Comprar ALPHA","Swap ALPHA","Stake ALPHA"]){if(html.includes(marker))throw new Error(`Forbidden marker: ${marker}`)}
console.log(`Smoke OK: ${url}`);
