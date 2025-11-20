import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('search');

    if (!query) {
        return NextResponse.json({ error: 'Missing query parameters' }, { status: 400 });
    }

    try {
        const response = await axios.get(`https://everpro.id/wp-admin/cek_lokasi.php?name=${query}`, {
            headers: {
                "Origin": `https://everpro.id`,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
            },
        });

        return NextResponse.json(response.data);
    } catch (error) {
        console.error("Shipping API Error:", error);
        return NextResponse.json({ error: "Failed to calculate shipping cost" });
    }
}