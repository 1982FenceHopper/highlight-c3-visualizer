import initDBClient from "./init";
import { parse } from "papaparse";

export default async function dbPrimeUpsert(code: string) {
  let data: any | undefined = undefined,
    error: any | undefined = undefined;

  const { client } = initDBClient();

  try {
    await client.connect();

    const csv_data = await fetch(`http://127.0.0.1:2130/dataset/${code}`)
      .then((res) => res.arrayBuffer())
      .then((data) => {
        const buffed = Buffer.from(data);
        const buffstr = buffed.toString("utf-8");

        const parsed_csv = parse(buffstr, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
        });

        return parsed_csv;
      });

    await client.query(
      `INSERT INTO dataset.datasets (code, csv_content) VALUES ($1::text, $2::jsonb)
ON CONFLICT (code) DO UPDATE SET csv_content = $2::jsonb;`,
      [code, JSON.stringify(csv_data.data)]
    );

    data = csv_data;
  } catch (e: any) {
    error = e;
  } finally {
    await client.end();
  }

  return { data, error };
}
