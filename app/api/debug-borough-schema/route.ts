import { NextResponse } from "next/server";
import { fabricGraphQL } from "../../../lib/fabricGraphql";

export const runtime = "nodejs";

type IntrospectionResponse = {
  __type: {
    name: string;
    fields: {
      name: string;
    }[];
  } | null;
};

export async function GET(): Promise<Response> {
  try {
    const query = `
      query GetBoroughSummarySchema {
        __type(name: "app_borough_summary") {
          name
          fields {
            name
          }
        }
      }
    `;

    const data =
      await fabricGraphQL<IntrospectionResponse>(
        query
      );

    return NextResponse.json({
      success: true,
      type: data.__type?.name || null,
      fields:
        data.__type?.fields
          ?.map((field) => field.name)
          .sort() || [],
    });
  } catch (error) {
    console.error(
      "Borough schema inspection failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown schema inspection error",
      },
      {
        status: 500,
      }
    );
  }
}
