# Feedback and Suggestions Bot

## Commands

- `/setup-rating`: ينشئ لوحة تقييم في الروم الحالي، للمشرفين فقط.
- `/setup-suggestions`: ينشئ لوحة اقتراحات في الروم الحالي، للمشرفين فقط.

## Environment variables

- `DISCORD_TOKEN`, `BOT_TOKEN`, or `TOKEN`: توكن البوت.
- `OWNER_ID`: آيدي صاحب البوت المسموح له فقط باستخدام الأوامر.
- `GUILD_ID`: آيدي السيرفر للتسجيل الفوري للأوامر.
- `RATING_CHANNEL_ID`: روم نتائج التقييم، اختياري.
- `SUGGESTION_CHANNEL_ID`: روم نتائج الاقتراحات، اختياري.

إذا تركت روم النتائج فارغًا، تُرسل النتيجة في نفس الروم الذي استُخدمت فيه اللوحة.

## Wispbyte

- Startup File: `index.js`
- Install: اترك تثبيت الحزم مفعّلًا.
- Start command: `npm start`
- Required environment variables:
  - `DISCORD_TOKEN`
  - `OWNER_ID`
- Optional environment variables:
  - `GUILD_ID` (لتسجيل الأوامر فورًا في سيرفر محدد)
  - `RATING_CHANNEL_ID`
  - `SUGGESTION_CHANNEL_ID`
- لا ترفع ملف `.env` إلى المستودع.
- تحقق من أن `bot-config.json` يمكن الكتابة إليه في مجلد التطبيق.
