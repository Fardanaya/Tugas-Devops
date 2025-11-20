import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('search');
    const limit = searchParams.get('limit');

    if (!query) {
        return NextResponse.json({ error: 'Missing query parameters' }, { status: 400 });
    }

    try {
        const url = new URL('https://customer.everpro.id/api/logistic/v2/public/location');
        url.searchParams.set('limit', limit || '15');
        url.searchParams.set('useApiKey', 'false');
        url.searchParams.set('name', query);

        const response = await axios.get(url.toString(), {
            headers: {
                "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtc2lzZG4iOiI2MjgyMjk1MTkzNTk1IiwidXNlcl9jYXRlZ29yeV9pZCI6MTAwLCJuYW1lIjoiUmlkd2FuIEhhbmlmIiwiZW1haWwiOiJhdnV4ZGV2QGdtYWlsLmNvbSIsIm93bmVyX2lkIjoiIiwicm9sZSI6IiIsImV4cCI6MTc2MDYzMTc5MSwiaWF0IjoxNzYwMDI2OTkxLCJpc3MiOiJQb3Bha2V0QXV0aCIsInN1YiI6IjNmY2U1M2JmLTEzMjYtNGVhMy1iMzg4LWQ0MTYxNjIwNDEwZCJ9.UGzZOPl6Syp9Xxs6tC5T921AxA4jxNw6LX78TU-6fMg`,
            },
        });

        return NextResponse.json(response.data);
    } catch (error) {
        console.error("Shipping API Error:", error);
        return NextResponse.json({ error: "Failed to load location data" });
    }
}
