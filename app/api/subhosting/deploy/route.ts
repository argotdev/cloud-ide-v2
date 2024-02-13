import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.json();
  console.log(data.documents);
  const accessToken = process.env["DEPLOY_ACCESS_TOKEN"];
  const API = "https://api.deno.com/v1";

  let assets = {};
  for (const document of data.documents) {
    assets[document.name] = {
      // Use bracket notation to set the key based on document.name
      kind: "file",
      content: document.text,
      encoding: "utf-8",
    };
  }

  // Replace with your desired project ID
  const res = await fetch(`${API}/projects/${data["project"]}/deployments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      entryPointUrl: "main.ts",
      assets: assets,
      envVars: {},
    }),
  });

  const deno_data = await res.json();
  console.log("Deno deployment created:", deno_data);

  return Response.json(deno_data);
}

//content: `Deno.serve(() => new Response("Hello, World!"));`,
