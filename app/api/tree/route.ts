import { NextResponse } from "next/server";

const data: Object[] = [
    { id: 1, name: 'Oak' },
    { id: 2, name: 'Pine' },
    { id: 3, name: 'Maple' },
    // Add more tree data as needed
];

export async function GET(req: Request) {
    // get the reqiest query parameters
    const url = new URL(req.url);
    const error = url.searchParams.get('error');
    if (error) {
        return NextResponse.json({ error: 'An error occurred while fetching tree data' }, { status: 500 });
    }


    return NextResponse.json(data);
}