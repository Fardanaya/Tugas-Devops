import { NextResponse } from 'next/server';
import axios from 'axios';

async function Mollygram(username: string) {
    try {
        const url = `https://media.mollygram.com/?url=${encodeURIComponent(username)}`;

        const headers = {
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            'origin': 'https://mollygram.com',
            'referer': 'https://mollygram.com/',
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'
        };

        const { data } = await axios.get(url, { headers });

        if (data.status !== 'ok') throw new Error('gagal ambil data');

        const html = data.html;

        const getMatch = (regex: RegExp) => {
            const match = html.match(regex);
            return match ? match[1].trim() : null;
        };

        const profilePic = getMatch(/<img[^>]*class="[^"]*rounded-circle[^"]*"[^>]*src="([^"]+)"/i)
            || getMatch(/<img[^>]*src="([^"]+)"[^>]*class="[^"]*rounded-circle[^"]*"/i);

        return {
            profilePic
        };

    } catch (error: any) {
        console.error('emror:', error.message);
        return null;
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';
    const query = searchParams.get('username_or_id');

    if (!query) {
        return NextResponse.json({ error: 'Missing username_or_id parameter' }, { status: 400 });
    }

    try {
        const response = await fetch(
            `https://instagram-social-api.p.rapidapi.com/v1/info?username_or_id_or_url=${encodeURIComponent(query)}`,
            {
                headers: {
                    'Cache-Control': 'max-age=259200',
                    "x-rapidapi-host": "instagram-social-api.p.rapidapi.com",
                    'x-rapidapi-key': 'e5f04df655mshb9db55765733948p18fda0jsn4f9ebc9b1d63',
                    // 'x-rapidapi-key': 'c81d51d6fcmsh78e3d292dbd2244p1fe19ejsn017e35867a4e',
                    // 'x-rapidapi-key': '0933c2856emsh06fb1fbe4c865d8p139598jsn9841358c94f0', //ingr.id.p.erm.i.nta@googlemail.com
                    // 'x-rapidapi-key': '444749becbmsh5baf23108b3574fp1e94a3jsn5fa0e5c018df', // b.ethde.l.e.on5.1@googlemail.com
                    // 'x-rapidapi-key': '29609aabacmsheded7140575cf22p1991bbjsn944f989b81de', // m.a.r.is.s.aald.a0@googlemail.com
                },
                cache: forceRefresh ? 'no-cache' : 'force-cache',
                next: {
                    revalidate: 259200,
                    tags: [`instagram-server-${query.toLowerCase()}`]
                }
            }
        );

        if (!response.ok) {
            throw new Error(`RapidAPI error: ${response.status}`);
        }

        const res = await response.json();

        // Get profile pic URL using Mollygram
        const mollyData = await Mollygram(res.data.username);

        // Enhanced response with Mollygram profile pic
        const enhancedData = {
            ...res.data,
            profile_pic_url: mollyData?.profilePic || res.data.profile_pic_url,
        };

        const responseWithUpdatedProfilePic = NextResponse.json({
            status: 200,
            message: 'Instagram Profile fetched successfully',
            data: enhancedData,
        });

        return responseWithUpdatedProfilePic;

    } catch (error) {
        console.error('Error fetching Instagram data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch data from Instagram API' },
            { status: 500 }
        );
    }
}
