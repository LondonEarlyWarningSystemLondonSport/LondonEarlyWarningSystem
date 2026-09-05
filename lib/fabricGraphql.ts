type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{
    message: string;
    path?: Array<string | number>;
  }>;
};

async function getFabricAccessToken(): Promise<string> {
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

export async function fabricGraphQL<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const endpoint = process.env.FABRIC_GRAPHQL_ENDPOINT?.trim();

  if (!endpoint) {
    throw new Error("FABRIC_GRAPHQL_ENDPOINT is missing");
  }

  const token = await getFabricAccessToken();

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
    cache: "no-store",
  });

  const result: GraphQLResponse<T> = await response.json();

  if (!response.ok) {
    throw new Error(`Fabric GraphQL request failed: ${response.status}`);
  }

  if (result.errors?.length) {
    throw new Error(
      result.errors.map((error) => error.message).join("; ")
    );
  }

  if (!result.data) {
    throw new Error("Fabric GraphQL returned no data");
  }

  return result.data;
}
