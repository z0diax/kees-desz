const SHEET_NAME = 'RSVP';
const RSVP_HEADERS = [
    'Submitted At',
    'Full Name',
    'Attendance',
    'Food Allergies / Restrictions / Cultural Practices',
    'Contact Number',
    'Source'
];

function doPost(e) {
    try {
        const payload = JSON.parse(e.postData.contents || '{}');
        const sheet = getOrCreateSheet_();

        ensureHeaders_(sheet);
        sheet.appendRow([
            payload.submittedAt || new Date().toISOString(),
            cleanText_(payload.fullname),
            formatAttendance_(payload.attendance),
            cleanMultilineText_(payload.dietary),
            cleanText_(payload.phone),
            cleanText_(payload.source || 'kees-desz-rsvp')
        ]);

        return jsonResponse_({ success: true });
    } catch (error) {
        return jsonResponse_({
            success: false,
            message: error && error.message ? error.message : 'Unable to save RSVP.'
        });
    }
}

function getOrCreateSheet_() {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const existingSheet = spreadsheet.getSheetByName(SHEET_NAME);
    return existingSheet || spreadsheet.insertSheet(SHEET_NAME);
}

function ensureHeaders_(sheet) {
    if (sheet.getLastRow() === 0) {
        sheet.appendRow(RSVP_HEADERS);
        return;
    }

    const currentHeaders = sheet.getRange(1, 1, 1, RSVP_HEADERS.length).getValues()[0];
    const needsUpdate = RSVP_HEADERS.some((header, index) => currentHeaders[index] !== header);

    if (needsUpdate) {
        sheet.getRange(1, 1, 1, RSVP_HEADERS.length).setValues([RSVP_HEADERS]);
    }
}

function formatAttendance_(value) {
    if (value === 'yes') {
        return "Yes, I'll be there to celebrate!";
    }

    if (value === 'no') {
        return "Sorry, I won't be able to attend";
    }

    return cleanText_(value);
}

function cleanText_(value) {
    return String(value || '').trim().replace(/\s+/g, ' ');
}

function cleanMultilineText_(value) {
    return String(value || '').trim();
}

function jsonResponse_(body) {
    return ContentService
        .createTextOutput(JSON.stringify(body))
        .setMimeType(ContentService.MimeType.JSON);
}
