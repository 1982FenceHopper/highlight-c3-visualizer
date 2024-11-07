import { NextResponse, type NextRequest } from "next/server";
import { queryLLM } from "@/utils/llm/client";

export async function POST(request: NextRequest, response: NextResponse) {
  const data = await request.json();
  const country = data["country"];
  const initial_data = data["initial_data"];
  const predictive_data = data["predictive_data"];
  const model_alg = data["model_alg"];
  const message = await queryLLM(
    country,
    initial_data,
    predictive_data,
    model_alg
  );
  // const message = await fetch("http://127.0.0.1:8000/generate", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     query: `${initial_data}\n\n${predictive_data}\n\nAlgorithm Used: ${model_alg}`,
  //   }),
  // })
  //   .then((res) => res.json())
  //   .then((data) => {
  //     return data.response;
  //   })
  //   .catch((err) => console.error(err));
  return NextResponse.json(
    { message: message.choices[0].message.content },
    { status: 200 }
  );
}
