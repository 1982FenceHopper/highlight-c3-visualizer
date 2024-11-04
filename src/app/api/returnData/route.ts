import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest, response: NextResponse) {
  const data = await fetch("http://localhost:2130/").then((res) => res.json());
  return NextResponse.json(data);
}
