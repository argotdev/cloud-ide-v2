import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.json();
  console.log(data);
  const deploymentId = data["deploymentId"];

  const accessToken = process.env["DEPLOY_ACCESS_TOKEN"];
  const orgId = process.env["DEPLOY_ORG_ID"];
  const API = "https://api.deno.com/v1";

  // Create a new project
  const res = await fetch(`${API}/deployments/${deploymentId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  const response = await res.json();
  console.log(response);
  return Response.json(response.status);
}
