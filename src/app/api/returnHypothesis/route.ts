import { NextResponse, type NextRequest } from "next/server";
import { queryLLM } from "@/utils/llm/client";

export async function POST(request: NextRequest, response: NextResponse) {
  const data = await request.json();
  const initial_data = data["initial_data"];
  const predictive_data = data["predictive_data"];
  const model_alg = data["model_alg"];
  const message = await queryLLM(initial_data, predictive_data, model_alg);
  return NextResponse.json({ client: message }, { status: 200 });
}
