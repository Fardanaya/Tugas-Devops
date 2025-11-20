import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
    let body;
    try {
        body = await request.json();
    } catch (error) {
        return NextResponse.json(
            { error: "Invalid JSON in request body" },
            { status: 400 }
        );
    }

    if (!body || typeof body !== 'object') {
        return NextResponse.json(
            { error: "Request body is required and must be a valid JSON object" },
            { status: 400 }
        );
    }

    const {
        origin_postal_code,
        origin_sub_district_name,
        destination_postal_code,
        destination_sub_district_name,
        weight,
        is_cod = false
    } = body;

    const formData = new FormData();
    formData.append("origin_postal_code", origin_postal_code || "61234");
    formData.append("origin_sub_district_name", origin_sub_district_name || "Sari Rogo");
    formData.append("destination_postal_code", destination_postal_code || "60111");
    formData.append("destination_sub_district_name", destination_sub_district_name || "Keputih");
    formData.append("weight", weight.toString() || "1");
    formData.append("is_cod", is_cod ? "true" : "false");

    try {
        const response = await axios.post(`https://everpro.id/wp-admin/cek_ongkir.php`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                "Origin": `https://everpro.id`,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
            },
        });

        return NextResponse.json(response.data);
    } catch (error) {
        console.error("Shipping API Error:", error);
        return NextResponse.json({ error: error });
    }
}
