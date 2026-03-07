# Google Sheets Feedback Ingestion (Apps Script)

This folder contains a hardened starter for receiving app feedback and appending it to Google Sheets.

## Target sheet

- Spreadsheet ID: `1TJ4uXfG_cDfbLrp6WG0aTZ7qxy7cfPh9K9fVra0uAnw`
- Tab: `Submissions`

## Security controls included

- Shared app token check (`FEEDBACK_APP_TOKEN`)
- Honeypot field rejection
- Payload validation + strict length limits
- Basic per-installation rate limit (`FEEDBACK_MAX_PER_HOUR`)
- Spreadsheet formula-injection prevention (`=`, `+`, `-`, `@` prefixed values)
- Script lock around writes

## Suggested sheet headers (left to right)

1. `Received At`
2. `Timestamp UTC`
3. `Source`
4. `Platform`
5. `App Version`
6. `App Build`
7. `Installation ID`
8. `User Display Name`
9. `User Email`
10. `Subject`
11. `Message`

## Deploy steps

1. Create a new standalone Apps Script project.
2. Copy `Code.js` and `appsscript.json` into the project.
3. In Script Properties, set:
   - `FEEDBACK_SHEET_ID=1TJ4uXfG_cDfbLrp6WG0aTZ7qxy7cfPh9K9fVra0uAnw`
   - `FEEDBACK_SHEET_TAB=Submissions`
   - `FEEDBACK_APP_TOKEN=<your_random_64_hex_token>`
   - `FEEDBACK_MAX_PER_HOUR=10`
4. Deploy as Web App:
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the deployment URL.

## App configuration

Set these Expo public env vars for the mobile app:

- `EXPO_PUBLIC_FEEDBACK_WEBHOOK_URL=<apps_script_web_app_url>`
- `EXPO_PUBLIC_FEEDBACK_APP_TOKEN=<same_token_as_script_properties>`

Generate a token with:

```bash
openssl rand -hex 32
```

## Notes

- This is not strong authentication because mobile app tokens can be extracted.
- Keep abuse visibility in the Sheet and rotate token if abuse occurs.
