import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
    const requestData = {
        "email": "avuxdev@gmail.com",
        "name": "",
        "password": "pujapahazeta",
        "device_id": "dab8e5a1-1388-a82a-7386-4718098bb87f",
        "cancelToken": { "promise": {} }
    };

    try {
        const response = await axios.post(`https://customer.everpro.id/api/auth/v2/login-email`, requestData, {
            headers: {
                "Content-Type": "application/json",
                "Origin": "https://customer.everpro.id",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0",
                "Accept": "application/json, text/plain, */*",
                "Referer": "https://customer.everpro.id/auth/login",
            },
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error("Login API Error:", error.response?.data || error.message);
        return NextResponse.json({
            error: error.response?.data || "An error occurred during login"
        }, { status: error.response?.status || 500 });
    }
}
