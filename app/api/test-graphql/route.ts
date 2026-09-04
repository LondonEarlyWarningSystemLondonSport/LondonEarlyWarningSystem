import { NextResponse } from "next/server";

export const runtime = "nodejs";

async function getFabricToken(): Promise<string> {
  const tenantId = process.env.AZURE_TENANT_ID?.trim();
  const clientId = process.env.AZURE_CLIENT_ID?.trim();
  const clientSecret = process.env.AZURE_CLIENT_SECRET?.trim();

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Azure identity environment variables are missing");
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: "https://api.fabric.microsoft.com/.default",
    grant_type: "client_credentials",
  });

  const response = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    }
  );

  const result = await response.json();

  if (!response.ok || !result.access_token) {
    throw new Error(
      result.error_description ||
        result.error ||
        "Unable to obtain Fabric access token"
    );
  }

  return result.access_token;
}

export async function GET(): Promise<Response> {
  try {
    const endpoint = process.env.FABRIC_GRAPHQL_ENDPOINT?.trim();

    if (!endpoint) {
      throw new Error("FABRIC_GRAPHQL_ENDPOINT is missing");
    }

    const token = await getFabricToken();

    const query = `
      query {
        app_site_summaries(first: 5) {
          items {
            site_id
            site_name
            borough
            priority_category
            risk_band
          }
        }
      }
    `;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          status: response.status,
          response: result,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      errors: result.errors ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown GraphQL error",
      },
      { status: 500 }
    );
  }
}
