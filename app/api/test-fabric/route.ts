import { NextResponse } from "next/server";
import sql from "mssql";

export const runtime = "nodejs";

async function getSqlAccessToken(): Promise<string> {
  const tenantId = process.env.AZURE_TENANT_ID?.trim();
  const clientId = process.env.AZURE_CLIENT_ID?.trim();
  const clientSecret = process.env.AZURE_CLIENT_SECRET?.trim();

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Azure identity environment variables are missing");
  }

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

  if (!response.ok || !result.access_token) {
    throw new Error(
      result.error_description || result.error || "Unable to obtain SQL access token"
    );
  }

  return result.access_token;
}

export async function GET(): Promise<Response> {
  let pool: sql.ConnectionPool | undefined;

  try {
    const token = await getSqlAccessToken();

    const config: sql.config = {
      server: process.env.FABRIC_SQL_SERVER!.trim(),
      database: process.env.FABRIC_SQL_DATABASE!.trim(),
      port: 1433,

      authentication: {
        type: "azure-active-directory-access-token",
        options: {
          token,
        },
      },

      options: {
        encrypt: true,
        trustServerCertificate: false,
      },

      connectionTimeout: 30000,
      requestTimeout: 30000,
    };

    pool = await new sql.ConnectionPool(config).connect();

    const result = await pool.request().query(`
      SELECT TOP 5
        site_id,
        site_name,
        borough,
        priority_category,
        risk_band
      FROM dbo.app_site_summary
      ORDER BY priority_sort_order, site_name;
    `);

    return NextResponse.json({
      success: true,
      rows: result.recordset,
    });
  } catch (error) {
    console.error("Fabric SQL test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown Fabric SQL error",
      },
      { status: 500 }
    );
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}
