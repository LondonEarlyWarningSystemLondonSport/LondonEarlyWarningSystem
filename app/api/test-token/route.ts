import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  const tenantId = process.env.AZURE_TENANT_ID?.trim();
  const clientId = process.env.AZURE_CLIENT_ID?.trim();
  const clientSecret = process.env.AZURE_CLIENT_SECRET?.trim();

  if (!tenantId || !clientId || !clientSecret) {
    return NextResponse.json(
      {
        success: false,
        error: "One or more Azure identity environment variables are missing",
      },
      { status: 500 }
    );
  }

  try {
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: "https://database.windows.net/.default",
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

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          status: response.status,
          error: result.error,
          error_description: result.error_description,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      token_received: Boolean(result.access_token),
      token_type: result.token_type,
      expires_in: result.expires_in,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown token error",
      },
      { status: 500 }
    );
  }
}
