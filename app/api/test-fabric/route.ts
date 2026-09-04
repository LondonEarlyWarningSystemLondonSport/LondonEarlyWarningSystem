// Trigger Vercel deployment
import { NextResponse } from "next/server";
import sql from "mssql";

export const runtime = "nodejs";

export async function GET() {
  const config: sql.config = {
    server: process.env.FABRIC_SQL_SERVER!,
    database: process.env.FABRIC_SQL_DATABASE!,
    authentication: {
      type: "azure-active-directory-service-principal-secret",
      options: {
        clientId: process.env.AZURE_CLIENT_ID!,
        clientSecret: process.env.AZURE_CLIENT_SECRET!,
        tenantId: process.env.AZURE_TENANT_ID!,
      },
    },
    options: {
      encrypt: true,
      trustServerCertificate: false,
    },
  };

  try {
    const pool = await sql.connect(config);

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

    await pool.close();

    return NextResponse.json({
      success: true,
      rows: result.recordset,
    });
  } catch (error) {
    console.error("Fabric connection failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown connection error",
      },
      { status: 500 }
    );
  }
}
