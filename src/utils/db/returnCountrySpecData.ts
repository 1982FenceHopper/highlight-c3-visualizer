import { QueryResult } from "pg";
import initDBClient from "./init";

export default async function dbQueryCountrySpecData(
  code: string,
  country: string
) {
  let _data: QueryResult<any>[] | undefined = undefined,
    _error: any | undefined = undefined;

  const { client } = initDBClient();

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
      [code, country]
    );

    _data = result.rows;
  } catch (e: any) {
    _error = e;
  } finally {
    await client.end();
  }

  return { _data, _error };
}
