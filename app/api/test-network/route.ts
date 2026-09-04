import { NextResponse } from "next/server";
import net from "net";

export const runtime = "nodejs";

export async function GET() {
  const host = process.env.FABRIC_SQL_SERVER;

  if (!host) {
    return NextResponse.json(
      { success: false, error: "FABRIC_SQL_SERVER is missing" },
      { status: 500 }
    );
  }

  return new Promise((resolve) => {
    const socket = net.createConnection({
      host,
      port: 1433,
      timeout: 10000,
    });

    socket.on("connect", () => {
      socket.destroy();

      resolve(
        NextResponse.json({
          success: true,
          host,
          port: 1433,
          message: "TCP connection to Fabric SQL endpoint succeeded",
        })
      );
    });

    socket.on("timeout", () => {
      socket.destroy();

      resolve(
        NextResponse.json(
          {
            success: false,
            host,
            port: 1433,
            error: "TCP connection timed out",
          },
          { status: 500 }
        )
      );
    });

    socket.on("error", (error) => {
      socket.destroy();

      resolve(
        NextResponse.json(
          {
            success: false,
            host,
            port: 1433,
            error: error.message,
          },
          { status: 500 }
        )
      );
    });
  });
}
