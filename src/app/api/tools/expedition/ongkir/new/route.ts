import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    // Required parameters
    const originSubDistrict = searchParams.get('origin_sub_district');
    const destinationSubDistrict = searchParams.get('destination_sub_district');
    const originSubDistrictId = searchParams.get('origin_sub_district_id');
    const destinationSubDistrictId = searchParams.get('destination_sub_district_id');
    const weight = searchParams.get('weight');

    if (!originSubDistrict || !destinationSubDistrict || !originSubDistrictId || !destinationSubDistrictId || !weight) {
        return NextResponse.json({ error: 'Missing required parameters: origin_sub_district, destination_sub_district, origin_sub_district_id, destination_sub_district_id, weight' }, { status: 400 });
    }

    try {
        const url = new URL('https://customer.everpro.id/api/logistic/v6/public/rate');
        url.searchParams.set('origin_sub_district', originSubDistrict);
        url.searchParams.set('destination_sub_district', destinationSubDistrict);
        url.searchParams.set('origin_sub_district_id', originSubDistrictId);
        url.searchParams.set('destination_sub_district_id', destinationSubDistrictId);
        url.searchParams.set('weight', weight);

        // Optional parameters with defaults from the request
        url.searchParams.set('length', searchParams.get('length') || '0');
        url.searchParams.set('width', searchParams.get('width') || '0');
        url.searchParams.set('height', searchParams.get('height') || '0');
        url.searchParams.set('item_price', searchParams.get('item_price') || '0');
        url.searchParams.set('cod_price', searchParams.get('cod_price') || '0');
        url.searchParams.set('disbursement', searchParams.get('disbursement') || '0');
        url.searchParams.set('filter_shipment_type', searchParams.get('filter_shipment_type') || 'DROP');
        url.searchParams.set('shipment_type', searchParams.get('shipment_type') || 'drop');
        url.searchParams.set('package_type', searchParams.get('package_type') || '1');
        url.searchParams.set('package_type_id', searchParams.get('package_type_id') || '1');
        url.searchParams.set('is_use_insurance', searchParams.get('is_use_insurance') || 'false');
        url.searchParams.set('origin_longitude', searchParams.get('origin_longitude') || '0');
        url.searchParams.set('origin_latitude', searchParams.get('origin_latitude') || '0');
        url.searchParams.set('destination_longitude', searchParams.get('destination_longitude') || '0');
        url.searchParams.set('destination_latitude', searchParams.get('destination_latitude') || '0');
        url.searchParams.set('rate_type_id', searchParams.get('rate_type_id') || '1,2,3,5,7,11');
        url.searchParams.set('rate_type_ids', searchParams.get('rate_type_ids') || '1,2,3,5,7,11');
        url.searchParams.set('is_with_performance', searchParams.get('is_with_performance') || 'true');
        url.searchParams.set('include_flat_rate', searchParams.get('include_flat_rate') || 'true');
        url.searchParams.set('is_cod_shipment_price_only', searchParams.get('is_cod_shipment_price_only') || 'false');

        const response = await axios.get(url.toString(), {
            headers: {
                "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtc2lzZG4iOiI2MjgyMjk1MTkzNTk1IiwidXNlcl9jYXRlZ29yeV9pZCI6MTAwLCJuYW1lIjoiUmlkd2FuIEhhbmlmIiwiZW1haWwiOiJhdnV4ZGV2QGdtYWlsLmNvbSIsIm93bmVyX2lkIjoiIiwicm9sZSI6IiIsImV4cCI6MTc2MDYzMTA4NiwiaWF0IjoxNzYwMDI2Mjg2LCJpc3MiOiJQb3Bha2V0QXV0aCIsInN1YiI6IjNmY2U1M2JmLTEzMjYtNGVhMy1iMzg4LWQ0MTYxNjIwNDEwZCJ9.Li_8CBvmwpe0E3msPvrvKIZxAf6GFDlkImn8lsEdkBc`,
            },
        });

        return NextResponse.json(response.data);
    } catch (error) {
        console.error("Shipping API Error:", error);
        return NextResponse.json({ error: "Failed to calculate shipping rate" });
    }
}
