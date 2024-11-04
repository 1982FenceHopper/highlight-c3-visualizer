import { NextResponse, type NextRequest } from "next/server";
import { Client } from "pg";

export async function GET(request: NextRequest, response: NextResponse) {
  const datasetCode = request.nextUrl.searchParams.get("code");
  const client = new Client({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DB,
  });

  try {
    await client.connect();
    const result = await client.query(
      `
            WITH unnested AS (
  SELECT jsonb_array_elements(csv_content) AS element
  FROM dataset.datasets
  WHERE code = $1::text
)
SELECT DISTINCT element->>'Area' AS country
FROM unnested
ORDER BY country ASC;
            `,
      [datasetCode]
    );
    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err });
  } finally {
    await client.end();
  }
}
