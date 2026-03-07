/**
 * Google Apps Script Web App endpoint for mobile feedback ingestion.
 *
 * Script Properties required:
 * - FEEDBACK_SHEET_ID
 * - FEEDBACK_SHEET_TAB
 * - FEEDBACK_APP_TOKEN
 * Optional:
 * - FEEDBACK_MAX_PER_HOUR (default 10)
 */

function doPost(e) {
  var config = getConfig_();
  var payload = parsePayload_(e);
  if (!payload.ok) {
    return jsonResponse_(400, { ok: false, message: payload.message });
  }

  var input = payload.data;

  if ((input.appToken || '') !== config.appToken) {
    return jsonResponse_(403, { ok: false, message: 'Unauthorized request.' });
  }

  if ((input.honeypot || '').trim() !== '') {
    return jsonResponse_(400, { ok: false, message: 'Rejected.' });
  }

  var validation = validateFeedback_(input);
  if (!validation.ok) {
    return jsonResponse_(400, { ok: false, message: validation.message });
  }

  var installationId = safeValue_(input.installationId, 64);
  var rateCheck = rateLimitCheck_(installationId, config.maxPerHour);
  if (!rateCheck.ok) {
    return jsonResponse_(429, { ok: false, message: rateCheck.message });
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(5000);

  try {
    var sheet = SpreadsheetApp.openById(config.sheetId).getSheetByName(config.sheetTab);
    if (!sheet) {
      return jsonResponse_(500, { ok: false, message: 'Feedback sheet tab not found.' });
    }

    sheet.appendRow([
      new Date(),
      safeValue_(input.timestampUtc, 40),
      safeValue_(input.source, 40),
      safeValue_(input.platform, 20),
      safeValue_(input.appVersion, 32),
      safeValue_(input.appBuild, 32),
      installationId,
      safeValue_(input.userDisplayName, 120),
      safeValue_(input.userEmail, 200),
      safeValue_(input.subject, 140),
      safeValue_(input.message, 4000),
    ]);
  } finally {
    lock.releaseLock();
  }

  return jsonResponse_(200, { ok: true, message: 'Feedback submitted.' });
}

function getConfig_() {
  var props = PropertiesService.getScriptProperties();
  return {
    appToken: props.getProperty('FEEDBACK_APP_TOKEN') || '',
    maxPerHour: Number(props.getProperty('FEEDBACK_MAX_PER_HOUR') || 10),
    sheetId: props.getProperty('FEEDBACK_SHEET_ID') || '',
    sheetTab: props.getProperty('FEEDBACK_SHEET_TAB') || 'Submissions',
  };
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return { ok: false, message: 'Missing request body.' };
  }
  try {
    return { ok: true, data: JSON.parse(e.postData.contents) };
  } catch (err) {
    return { ok: false, message: 'Invalid JSON payload.' };
  }
}

function validateFeedback_(input) {
  var subject = (input.subject || '').trim();
  var message = (input.message || '').trim();
  if (!subject || !message) {
    return { ok: false, message: 'Subject and message are required.' };
  }
  if (subject.length > 140) {
    return { ok: false, message: 'Subject too long.' };
  }
  if (message.length > 4000) {
    return { ok: false, message: 'Message too long.' };
  }
  return { ok: true };
}

function rateLimitCheck_(installationId, maxPerHour) {
  var key = 'feedback-rate:' + (installationId || 'unknown');
  var cache = CacheService.getScriptCache();
  var now = Date.now();
  var history = [];
  var cached = cache.get(key);
  if (cached) {
    try {
      history = JSON.parse(cached);
    } catch (err) {
      history = [];
    }
  }

  var windowMs = 60 * 60 * 1000;
  history = history.filter(function(ts) {
    return now - ts < windowMs;
  });

  if (history.length >= maxPerHour) {
    return { ok: false, message: 'Rate limit reached. Please try again later.' };
  }

  history.push(now);
  cache.put(key, JSON.stringify(history), 60 * 60);
  return { ok: true };
}

function safeValue_(value, maxLength) {
  var str = String(value || '').trim().slice(0, maxLength);
  if (/^[=+\-@]/.test(str)) {
    return "'" + str;
  }
  return str;
}

function jsonResponse_(statusCode, payload) {
  var output = ContentService.createTextOutput(JSON.stringify(payload));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
