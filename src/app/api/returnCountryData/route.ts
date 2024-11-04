import { NextResponse, type NextRequest } from "next/server";
import { Client } from "pg";

export async function GET(request: NextRequest, response: NextResponse) {
  const datasetCode = request.nextUrl.searchParams.get("code");
  const country = request.nextUrl.searchParams.get("area");

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
      `WITH unnested AS (
	SELECT jsonb_array_elements(csv_content) AS element
	FROM dataset.datasets
	WHERE code = $1::text
),
filtered AS (
	SELECT DISTINCT element->>'Item' AS idx_item, element->>'Value' AS idx_value, element->>'Unit' AS idx_unit, element->>'Year' AS idx_year
	FROM unnested
	WHERE element->>'Area' = $2::text
)
SELECT DISTINCT idx_item, jsonb_build_object (
	'contents', ARRAY_AGG (
		jsonb_build_object (
			'idx_value', idx_value,
            'idx_unit', idx_unit,
            'idx_year', idx_year
		)
    ORDER BY idx_year
	) 
) AS idx_item_data
FROM filtered
GROUP BY idx_item
ORDER BY idx_item ASC;`,
      [datasetCode, country]
    );
    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err });
  } finally {
    await client.end();
  }
}
