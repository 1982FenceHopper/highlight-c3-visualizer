import { QueryResult } from "pg";
import initDBClient from "./init";

export default async function dbQueryAllCountries(code: string) {
  let _data: QueryResult<any>[] | undefined = undefined,
    _error: any | undefined = undefined;

  const { client } = initDBClient();

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
      [code]
    );

    _data = result.rows;
  } catch (e: any) {
    _error = e;
  } finally {
    await client.end();
  }

  return { _data, _error };
}
