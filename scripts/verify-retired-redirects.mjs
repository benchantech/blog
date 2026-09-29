import fs from "node:fs";

const config=fs.readFileSync(new URL("../next.config.ts",import.meta.url),"utf8");

const permanent=[
  '{ source: "/watch-your-step", destination: "/", permanent: true }',
  '{ source: "/watch-your-step/:path+", destination: "/", permanent: true }',
  '{ source: "/bridge", destination: "/", permanent: true }',
  '{ source: "/standing-orders", destination: "/", permanent: true }',
  '{ source: "/ships-log", destination: "/", permanent: true }',
  '{ source: "/crew", destination: "/", permanent: true }',
  '{ source: "/ben", destination: "/", permanent: true }',
  '{ source: "/system", destination: "/", permanent: true }'
];

const temporary=[
  '{ source: "/lab", destination: "/neon", permanent: false }',
  '{ source: "/about", destination: "/", permanent: false }',
  '{ source: "/posts", destination: "https://benchanviolin.substack.com", permanent: false }',
  '{ source: "/upwork", destination: "https://www.upwork.com/freelancers/~01a10f284f33009412", permanent: false }',
  '{ source: "/df", destination: "/developer-forward", permanent: false }'
];

for(const row of permanent){
  if(!config.includes(row)) throw new Error("missing permanent retirement redirect: "+row);
}
for(const row of temporary){
  if(!config.includes(row)) throw new Error("temporary shortcut permanence changed unexpectedly: "+row);
}

const adr=fs.readFileSync(new URL("../docs/adr/0012-permanent-redirects-for-retired-surfaces.md",import.meta.url),"utf8");
if(!adr.includes("**Status:** ACCEPTED")) throw new Error("ADR 0012 must remain accepted");
if(!adr.includes("source remains preserved")) throw new Error("ADR 0012 must preserve historical source");

console.log("retired redirect permanence contract ok");
