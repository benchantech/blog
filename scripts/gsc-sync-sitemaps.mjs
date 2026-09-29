import fs from "node:fs";
import path from "node:path";
import {createSign} from "node:crypto";

const SITE_URL="sc-domain:benchantech.com";
const CURRENT_SITEMAP="https://benchantech.com/sitemap.xml";
const STALE_SITEMAPS=[
  "https://benchantech.com/sitemap_index.xml",
  "https://benchantech.com/page-sitemap.xml",
  "https://benchantech.com/post-sitemap.xml"
];
const SCOPE="https://www.googleapis.com/auth/webmasters";

function base64url(value){
  const input=Buffer.isBuffer(value)?value:Buffer.from(value);
  return input.toString("base64").replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
}

function captainHome(){
  if(process.env.BCT_CAPTAIN_HOME) return process.env.BCT_CAPTAIN_HOME;
  const marker=path.join("Library","Application Support","BenChanTech","BctRunner");
  const cwd=process.cwd();
  const index=cwd.indexOf(marker);
  if(index>0) return cwd.slice(0,index).replace(/[\\/]$/,"");
  return process.env.HOME||"";
}

function serviceAccountPath(){
  const explicit=process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if(explicit&&fs.existsSync(explicit)) return explicit;
  const home=captainHome();
  const documented=home?path.join(home,"credentials","benchanviolin-914529c4af97.json"):"";
  if(documented&&fs.existsSync(documented)) return documented;
  throw new Error("No local Google service-account key found for bounded Search Console sitemap maintenance.");
}

async function accessToken(){
  const credential=JSON.parse(fs.readFileSync(serviceAccountPath(),"utf8"));
  if(credential.type!=="service_account"||!credential.client_email||!credential.private_key){
    throw new Error("Search Console sitemap maintenance requires a local service-account credential.");
  }

  const now=Math.floor(Date.now()/1000);
  const header=base64url(JSON.stringify({alg:"RS256",typ:"JWT"}));
  const payload=base64url(JSON.stringify({
    iss:credential.client_email,
    scope:SCOPE,
    aud:credential.token_uri||"https://oauth2.googleapis.com/token",
    iat:now,
    exp:now+3600
  }));
  const unsigned=header+"."+payload;
  const signer=createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const assertion=unsigned+"."+base64url(signer.sign(credential.private_key));

  const response=await fetch(credential.token_uri||"https://oauth2.googleapis.com/token",{
    method:"POST",
    headers:{"content-type":"application/x-www-form-urlencoded"},
    body:new URLSearchParams({
      grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    })
  });
  const json=await response.json();
  if(!response.ok||!json.access_token) throw new Error("Service-account token exchange failed: "+JSON.stringify(json));
  return json.access_token;
}

function endpoint(feedpath){
  const site=encodeURIComponent(SITE_URL);
  const base=`https://www.googleapis.com/webmasters/v3/sites/${site}/sitemaps`;
  return feedpath?`${base}/${encodeURIComponent(feedpath)}`:base;
}

async function sitemapList(token){
  const response=await fetch(endpoint(),{headers:{authorization:`Bearer ${token}`}});
  const text=await response.text();
  let json={};
  try{json=text?JSON.parse(text):{};}catch{}
  if(!response.ok) throw new Error("Search Console sitemap read failed "+response.status+": "+text);
  return json.sitemap||[];
}

async function emptyMutation(token,method,url,label){
  const response=await fetch(url,{method,headers:{authorization:`Bearer ${token}`}});
  const text=await response.text();
  if(!response.ok) throw new Error(label+" failed "+response.status+": "+text);
  return response.status;
}

const token=await accessToken();

/* Fail closed before mutation if this service account cannot read this exact property. */
const before=await sitemapList(token);
const beforePaths=before.map(item=>item.path);

const submitStatus=await emptyMutation(token,"PUT",endpoint(CURRENT_SITEMAP),"current sitemap submission");

const deletions=[];
for(const stale of STALE_SITEMAPS){
  if(beforePaths.includes(stale)){
    const status=await emptyMutation(token,"DELETE",endpoint(stale),"stale sitemap deletion");
    deletions.push({sitemap:stale,status});
  }else{
    deletions.push({sitemap:stale,status:"already_absent"});
  }
}

const after=await sitemapList(token);
const afterPaths=after.map(item=>item.path);
const current=after.find(item=>item.path===CURRENT_SITEMAP)||null;
const staleRemaining=STALE_SITEMAPS.filter(item=>afterPaths.includes(item));

if(!current) throw new Error("Current sitemap was not present after submission.");
if(staleRemaining.length) throw new Error("Stale sitemap registrations remain: "+staleRemaining.join(", "));

console.log(JSON.stringify({
  schemaVersion:1,
  source:"Google Search Console",
  action:"sync_sitemaps",
  property:SITE_URL,
  currentSitemap:CURRENT_SITEMAP,
  submitStatus,
  deleted:deletions,
  confirmedCurrent:true,
  currentLastSubmitted:current.lastSubmitted||null,
  currentLastDownloaded:current.lastDownloaded||null,
  currentWarnings:current.warnings??null,
  currentErrors:current.errors??null,
  finalSitemaps:afterPaths
},null,2));
