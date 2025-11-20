import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as CryptoJS from 'crypto-js';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { _ekspedisi } from '@/lib/constant/expeditions';

const createTimers = (resi: string) => {
    try {
        const key = CryptoJS.enc.Hex.parse('79540e250fdb16afac03e19c46dbdeb3');
        const iv = CryptoJS.enc.Hex.parse('eb2bb9425e81ffa942522e4414e95bd0');

        const encrypted = CryptoJS.AES.encrypt(resi, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        return encrypted.toString();
    } catch (error) {
        return null;
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const expedition = searchParams.get('expedition');
    const trackingNumber = searchParams.get('trackingNumber');

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    if (!expedition || !trackingNumber) {
        return NextResponse.json(
            { success: false, error: 'Missing expedition or trackingNumber parameter' },
            { status: 400 }
        );
    }

    try {
        const expeditionIndex = _ekspedisi.findIndex(e => e.id === expedition);
        if (expeditionIndex === -1) throw new Error(`List ekspedisi yang tersedia: ${_ekspedisi.map(e => e.id).join(', ')}`);
        let ekspedisi = _ekspedisi.find(e => e.id === expedition);

        if (!ekspedisi?.private) {

            const { data: html } = await axios.get('https://cekresi.com/');
            const $ = cheerio.load(html);

            const timers = createTimers(trackingNumber.toUpperCase().replace(/\s/g, ''));

            // Create URLSearchParams instead of FormData for x-www-form-urlencoded
            const params = new URLSearchParams();
            params.append('viewstate', $('input[name="viewstate"]').attr('value') || '');
            params.append('secret_key', $('input[name="secret_key"]').attr('value') || '');
            params.append('e', ekspedisi?.code || '');
            params.append('noresi', trackingNumber.toUpperCase().replace(/\s/g, ''));
            params.append('timers', timers || '');

            const { data } = await axios.post(`https://apa2.cekresi.com/cekresi/resi/initialize.php?ui=e0ad7e971ce77822056ba7a155f85c11&p=1&w=${Math.random().toString(36).substring(7)}`, params, {
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                    referer: 'https://cekresi.com/',
                    origin: 'https://cekresi.com',
                    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
                }
            });

            const $response = cheerio.load(data);

            const result = {
                success: false,
                message: '',
                data: {
                    resi: trackingNumber,
                    ekspedisi: '',
                    // ekspedisiCode: _ekspedisi[expedition],
                    ekspedisiCode: ekspedisi?.code,
                    status: '',
                    tanggalKirim: '',
                    customerService: '',
                    lastPosition: '',
                    history: [] as Array<{ tanggal: string; keterangan: string }>
                }
            };

            const alertSuccess = $response('.alert.alert-success');
            if (alertSuccess.length > 0) {
                result.success = true;
                result.message = alertSuccess.text().trim();

                const ekspedisiName = $response('#nama_expedisi').text().trim();
                if (ekspedisiName) result.data.ekspedisi = ekspedisiName;

                const infoTable = $response('table.table-striped tbody tr');
                infoTable.each((_, element) => {
                    const cells = $response(element).find('td');
                    if (cells.length >= 3) {
                        const label = $response(cells[0]).text().trim();
                        const value = $response(cells[2]).text().trim();

                        switch (label) {
                            case 'Tanggal Pengiriman':
                                result.data.tanggalKirim = value;
                                break;
                            case 'Status':
                                result.data.status = value;
                                break;
                        }
                    }
                });

                const csText = $response('h5 center').text();
                if (csText && csText.includes('Customer Service Phone:')) result.data.customerService = csText.replace('Customer Service Phone:', '').trim();

                const lastPosition = $response('#last_position').text().trim();
                if (lastPosition) result.data.lastPosition = lastPosition;

                const historyTable = $response('h4:contains("History")').next('table').find('tbody tr');
                historyTable.each((index, element) => {
                    const cells = $response(element).find('td');
                    if (cells.length >= 2 && index > 0) {
                        const tanggal = $response(cells[0]).text().trim();
                        const keterangan = $response(cells[1]).text().trim();

                        if (tanggal && keterangan) {
                            result.data.history.push({
                                tanggal: tanggal,
                                keterangan: keterangan
                            });
                        }
                    }
                });
            } else {
                const alertError = $response('.alert.alert-danger, .alert.alert-warning');
                if (alertError.length > 0) {
                    result.message = alertError.text().trim();
                } else {
                    result.message = 'Tidak dapat mengambil informasi resi';
                }
            }

            return NextResponse.json(result);
        } else {
            // Private API
            const { data: html } = await axios.get(`https://cekresi.com/cek/?kurir=${ekspedisi?.code || ''}&noresi=${trackingNumber}`);
            const $ = cheerio.load(html);

            const result = {
                success: false,
                message: 'Tidak dapat mengambil informasi resi karena Layanan Private',
                data: {
                    resi: trackingNumber,
                    ekspedisi: ekspedisi?.name,
                    ekspedisiCode: ekspedisi?.code,
                    url: $('p.lead a').attr('href') || '',
                }
            };

            return NextResponse.json(result, { status: 400 });
        }
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            data: null
        }, { status: 500 });
    }
}
