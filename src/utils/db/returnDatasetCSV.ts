import { Client, QueryResult } from "pg";
import initDBClient from "./init";
import dbPrimeUpsert from "./updateDB";

async function checkExistence(client: Client, code: string) {
  const _runner = await client.query(
    "SELECT EXISTS (SELECT 1 FROM dataset.datasets WHERE dataset.datasets.code = $1::text);",
    [code]
  );
  return _runner.rows[0].exists ? true : false;
}

async function queryInfo(client: Client, code: string) {
  const _runner = await client.query(
    "SELECT dataset.datasets.csv_content FROM dataset.datasets WHERE dataset.datasets.code = $1::text",
    [code]
  );

  return _runner;
}

export default async function dbReturnDatasetCSV(code: string) {
  let _data: QueryResult<any> | undefined = undefined,
    _error: any | undefined = undefined;

  let returnedFromDB = false;

  const { client } = initDBClient();

  try {
    await client.connect();

    const checkIfExists = await checkExistence(client, code);
    if (!checkIfExists) {
      const { data, error } = await dbPrimeUpsert(code);
      if (error) {
        console.log(error);
      } else {
        _data = data;
      }
    } else {
      const query_res = await queryInfo(client, code);
      _data = query_res.rows[0].csv_content;
      returnedFromDB = true;
    }
  } catch (e: any) {
    _error = e;
  } finally {
    await client.end();
  }

  return { _data, _error, returnedFromDB };
}
