import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/* =========================================================
   FABRIC AUTH
   ========================================================= */

async function getFabricAccessToken() {
  const tenantId =
    process.env.AZURE_TENANT_ID;

  const clientId =
    process.env.AZURE_CLIENT_ID;

  const clientSecret =
    process.env.AZURE_CLIENT_SECRET;

  if (
    !tenantId ||
    !clientId ||
    !clientSecret
  ) {
    throw new Error(
      "Azure service principal environment variables are missing."
    );
  }

  const tokenUrl =
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const body =
    new URLSearchParams();

  body.set(
    "grant_type",
    "client_credentials"
  );

  body.set(
    "client_id",
    clientId
  );

  body.set(
    "client_secret",
    clientSecret
  );

  body.set(
    "scope",
    "https://api.fabric.microsoft.com/.default"
  );

  const response =
    await fetch(
      tokenUrl,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },

        body,

        cache: "no-store",
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error_description ||
        data?.error ||
        "Unable to obtain Fabric access token."
    );
  }

  return data.access_token as string;
}

/* =========================================================
   GRAPHQL
   ========================================================= */

async function runGraphQL(
  query: string
) {
  const endpoint =
    process.env.FABRIC_GRAPHQL_ENDPOINT;

  if (!endpoint) {
    throw new Error(
      "FABRIC_GRAPHQL_ENDPOINT is missing."
    );
  }

  const token =
    await getFabricAccessToken();

  const response =
    await fetch(
      endpoint,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${token}`,

          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            query,
          }),

        cache: "no-store",
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      `Fabric GraphQL request failed: ${response.status}`
    );
  }

  if (data.errors?.length) {
    throw new Error(
      data.errors
        .map(
          (
            error: {
              message?: string;
            }
          ) =>
            error.message ||
            "Unknown GraphQL error"
        )
        .join("; ")
    );
  }

  return data.data;
}

/* =========================================================
   ROUTE
   ========================================================= */

export async function GET() {
  try {
    /*
      Temporary schema-inspection route.

      We already know the GraphQL type exists:
      app_pps_reconciliation

      This query asks Fabric to return the actual
      fields exposed on that type so we can build
      the final Protection API against the real
      contract rather than guessing field names.
    */

    const query = `
      query ProtectionSchema {
        __type(name: "app_pps_reconciliation") {
          name
          fields {
            name
          }
        }
      }
    `;

    const data =
      await runGraphQL(
        query
      );

    return NextResponse.json({
      success: true,

      schema:
        data?.__type ??
        null,
    });
  } catch (error) {
    console.error(
      "Protection schema inspection error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Unable to inspect the protection schema.",
      },
      {
        status: 500,
      }
    );
  }
}
