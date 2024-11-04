import { NextResponse, type NextRequest } from "next/server";
import { Client } from "pg";

export async function GET(request: NextRequest, response: NextResponse) {
  const client = new Client({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DB,
  });

  try {
    await client.connect();
    const res = await client.query(
      "SELECT EXISTS (SELECT 1 FROM dataset.datasets WHERE dataset.datasets.code = $1::text);",
      ["F"]
    );
    return NextResponse.json(res.rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err });
  } finally {
    await client.end();
  }
}
