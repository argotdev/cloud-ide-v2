import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.json();
  console.log(data["code"]);
  const accessToken = process.env["DEPLOY_ACCESS_TOKEN"];
  const API = "https://api.deno.com/v1";

  // Replace with your desired project ID
  const res = await fetch(`${API}/projects/${data["project"]}/deployments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      entryPointUrl: "main.ts",
      assets: {
        "main.ts": {
          kind: "file",
          content: data["code"],
          //content: `Deno.serve(() => new Response("Hello, World!"));`,
          encoding: "utf-8",
        },
      },
      envVars: {},
    }),
  });

  const deno_data = await res.json();
  console.log("Deno deployment created:", deno_data);

  return Response.json(deno_data);
}
