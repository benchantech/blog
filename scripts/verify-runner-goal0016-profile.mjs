import fs from "node:fs";

const manifest=JSON.parse(fs.readFileSync(new URL("../ops/runner/manifest.json",import.meta.url),"utf8"));
if(manifest.schemaVersion!==1) throw new Error("runner manifest schemaVersion must be 1");
if(manifest.repositoryId!=="benchantech") throw new Error("repositoryId mismatch");
if(manifest.repositoryFullName!=="benchantech/blog") throw new Error("repositoryFullName mismatch");
const profile=manifest.profiles?.find(x=>x.profileId==="goal-0016-site-readiness");
if(!profile) throw new Error("goal-0016-site-readiness profile missing");
if(profile.goalId!=="GOAL-0016") throw new Error("goalId mismatch");
if(profile.cwd!==".") throw new Error("profile cwd must remain repository root");
if(profile.branchRegex!=="^goal-0016-run-[A-Za-z0-9._-]+$") throw new Error("branchRegex widened");
const allowed=[...(profile.allowedNodeScripts||[])].sort();
if(JSON.stringify(allowed)!==JSON.stringify(["scripts/verify-runner-goal0016-profile.mjs"])) {
  throw new Error("readiness profile must authorize only its verifier");
}
for(const required of ["app/sitemap.ts","app/robots.ts","components/GoogleAnalytics.tsx","content/canonical-surfaces.ts"]){
  if(!fs.existsSync(new URL("../"+required,import.meta.url))) throw new Error("required readiness surface missing: "+required);
}
console.log("benchantech GOAL-0016 runner readiness profile ok");
