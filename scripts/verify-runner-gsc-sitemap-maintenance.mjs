import fs from "node:fs";

const source=fs.readFileSync(new URL("./gsc-sync-sitemaps.mjs",import.meta.url),"utf8");

for(const required of [
  'const SITE_URL="sc-domain:benchantech.com"',
  'const CURRENT_SITEMAP="https://benchantech.com/sitemap.xml"',
  '"https://benchantech.com/sitemap_index.xml"',
  '"https://benchantech.com/page-sitemap.xml"',
  '"https://benchantech.com/post-sitemap.xml"',
  'const SCOPE="https://www.googleapis.com/auth/webmasters"',
  'emptyMutation(token,"PUT",endpoint(CURRENT_SITEMAP)',
  'emptyMutation(token,"DELETE",endpoint(stale)'
]){
  if(!source.includes(required)) throw new Error("missing bounded GSC sitemap-maintenance contract: "+required);
}

if(!source.includes("const before=await sitemapList(token);")) throw new Error("must verify property access before mutation");
if(!source.includes("const after=await sitemapList(token);")) throw new Error("must verify sitemap state after mutation");
if(source.includes("sites.delete")||source.includes("urlInspection")||source.includes("searchAnalytics/query")){
  throw new Error("unrelated Search Console capability detected");
}

console.log("benchantech GSC sitemap-maintenance contract ok");
