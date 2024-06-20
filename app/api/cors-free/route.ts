import { NextResponse, NextRequest } from "next/server";


export async function GET(
  req: NextRequest,
) {
  const searchParams = req.nextUrl.searchParams
  const url = decodeURIComponent(searchParams.get('url') as string)
  const response = await fetch(url);
  const data = await response.text();
  return new Response(data, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
