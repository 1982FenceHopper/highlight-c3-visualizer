import { QueryResult } from "pg";
import initDBClient from "./init";

export default async function testDB() {
  let data: QueryResult<any> | undefined = undefined,
    error: any | undefined = undefined;

  const { client } = initDBClient();

  try {
    await client.connect();
    const res = await client.query(
      "SELECT EXISTS (SELECT 1 FROM dataset.datasets WHERE dataset.datasets.code = $1::text);",
      ["FS"]
    );
    data = res;
  } catch (e: any) {
    error = e;
  } finally {
    await client.end();
  }

  return { data, error };
}
