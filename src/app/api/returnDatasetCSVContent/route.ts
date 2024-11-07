import { NextResponse, type NextRequest } from "next/server";
import dbReturnDatasetCSV from "@/utils/db/returnDatasetCSV";

export async function GET(request: NextRequest, response: NextResponse) {
  const params = request.nextUrl.searchParams;

  const datasetCode = params.get("code");

  // const client = new Client({
  //   user: process.env.POSTGRES_USER,
  //   password: process.env.POSTGRES_PASSWORD,
  //   host: process.env.POSTGRES_HOST,
  //   port: Number(process.env.POSTGRES_PORT),
  //   database: process.env.POSTGRES_DB,
  // });

  // try {
  //   await client.connect();
  //   const init = await client.query(
  //     "SELECT EXISTS (SELECT 1 FROM dataset.datasets WHERE dataset.datasets.code = $1::text);",
  //     [datasetCode]
  //   );
  //   if (init.rows[0].exists != true) {
  //     const csv_data = await fetch(
  //       `http://127.0.0.1:2130/dataset/${datasetCode}`
  //     )
  //       .then((res) => res.arrayBuffer())
  //       .then((data) => {
  //         const buffed = Buffer.from(data);
  //         const buffstr = buffed.toString("utf-8");

  //         const parsed_csv = parse(buffstr, {
  //           header: true,
  //           skipEmptyLines: true,
  //           dynamicTyping: true,
  //         });

  //         return parsed_csv;
  //       });

  //     const upsert = await client.query(
  //       `INSERT INTO dataset.datasets (code, csv_content) VALUES ($1::text, $2::jsonb);`,
  //       [datasetCode, JSON.stringify(csv_data.data)]
  //     );

  //     return NextResponse.json({
  //       db: upsert.rows[0],
  //       data: csv_data,
  //       type: "Returned from FAOSTAT, upserted into DB",
  //     });
  //   } else {
  //     const data_query = await client.query(
  //       `SELECT dataset.datasets.csv_content FROM dataset.datasets WHERE dataset.datasets.code = $1::text`,
  //       [datasetCode]
  //     );
  //     return NextResponse.json({
  //       data: data_query.rows[0].csv_content,
  //       type: "Returned from DB",
  //     });
  //   }
  // } catch (err: any) {
  //   console.error(err);
  //   return NextResponse.json({ error: err });
  // } finally {
  //   await client.end();
  // }

  const { _data, _error, returnedFromDB } = await dbReturnDatasetCSV(
    datasetCode!
  );

  if (_error != undefined) {
    return NextResponse.json({ error: _error }, { status: 500 });
  } else {
    return NextResponse.json(
      { data: _data, fromDB: returnedFromDB },
      { status: 200 }
    );
  }
}
