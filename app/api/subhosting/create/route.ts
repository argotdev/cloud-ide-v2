export async function GET() {
  const accessToken = process.env["DEPLOY_ACCESS_TOKEN"];
  const orgId = process.env["DEPLOY_ORG_ID"];
  const API = "https://api.deno.com/v1";

  console.log({ accessToken, orgId });

  // Create a new project
  const res = await fetch(`${API}/organizations/${orgId}/projects`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: null, // randomly generates project name
    }),
  });

  const project = await res.json();
  console.log("Project created:", project);
  return Response.json(project);
}
