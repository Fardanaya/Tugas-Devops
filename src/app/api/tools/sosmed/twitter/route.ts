import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('username_or_id');

    if (!query) {
        return NextResponse.json({ error: 'Missing username_or_id parameter' }, { status: 400 });
    }

    try {
        if (!query) throw new Error('Username is required');
        const profile = await axios.get(`https://api.ryzumi.vip/api/stalk/twitter?username=${query}`);
        return NextResponse.json({
            status: 200,
            message: 'Twitter Profile fetched successfully',
            data: profile.data
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}