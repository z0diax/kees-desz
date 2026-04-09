const VALID_ATTENDANCE = new Set(['yes', 'no']);

function json(body, status = 200) {
    return Response.json(body, { status });
}

function normalizeText(value, maxLength = 500) {
    return String(value || '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function normalizeMultilineText(value, maxLength = 2000) {
    return String(value || '').trim().slice(0, maxLength);
}

function buildPayload(body) {
    const payload = {
        fullname: normalizeText(body?.fullname, 120),
        phone: normalizeText(body?.phone, 40),
        attendance: normalizeText(body?.attendance, 8).toLowerCase(),
        dietary: normalizeMultilineText(body?.dietary, 1000),
        website: normalizeText(body?.website, 120)
    };

    const errors = [];

    if (!payload.fullname) {
        errors.push('Full name is required.');
    }

    if (!VALID_ATTENDANCE.has(payload.attendance)) {
        errors.push('Please select whether you will be attending.');
    }

    return { payload, errors };
}

async function forwardToGoogleSheets(payload) {
    const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

    if (!scriptUrl) {
        console.error('Missing GOOGLE_APPS_SCRIPT_URL environment variable.');
        return {
            ok: false,
            status: 500,
            message: 'RSVP submissions are not configured yet.'
        };
    }

    try {
        const upstreamResponse = await fetch(scriptUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                ...payload,
                source: 'kees-desz-rsvp',
                submittedAt: new Date().toISOString()
            }),
            cache: 'no-store'
        });

        const responseText = await upstreamResponse.text();
        let responseBody = null;

        try {
            responseBody = responseText ? JSON.parse(responseText) : null;
        } catch (error) {
            responseBody = null;
        }

        if (!upstreamResponse.ok || responseBody?.success === false) {
            console.error('Google Sheets forwarding failed.', {
                status: upstreamResponse.status,
                body: responseText.slice(0, 500)
            });

            return {
                ok: false,
                status: 502,
                message: 'Unable to save your RSVP right now. Please try again.'
            };
        }

        return {
            ok: true,
            status: 200,
            message: 'Thank you for your RSVP! We look forward to celebrating with you.'
        };
    } catch (error) {
        console.error('Unexpected RSVP forwarding error.', error);

        return {
            ok: false,
            status: 502,
            message: 'Unable to save your RSVP right now. Please try again.'
        };
    }
}

export async function GET() {
    return json({
        ok: true,
        message: 'RSVP endpoint is running.'
    });
}

export async function POST(request) {
    let body;

    try {
        body = await request.json();
    } catch (error) {
        return json({
            ok: false,
            message: 'Invalid RSVP request payload.'
        }, 400);
    }

    const { payload, errors } = buildPayload(body);

    if (payload.website) {
        return json({
            ok: true,
            message: 'Thank you for your RSVP! We look forward to celebrating with you.'
        });
    }

    if (errors.length > 0) {
        return json({
            ok: false,
            message: errors[0]
        }, 400);
    }

    const result = await forwardToGoogleSheets(payload);

    return json({
        ok: result.ok,
        message: result.message
    }, result.status);
}
