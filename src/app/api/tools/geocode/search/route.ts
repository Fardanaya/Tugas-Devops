import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

    if (!query) {
        return NextResponse.json(
            { error: 'Missing query parameters' },
            { status: 400 }
        )
    }

    try {
        const response = await fetch(
            `https://us1.locationiq.com/v1/search?key=${process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY}&q=${query}&format=json`
        )
        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json(
            { error: 'Geocoding failed' },
            { status: 500 }
        )
    }
}
