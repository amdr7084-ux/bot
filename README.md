# بوت حماية روم ديسكورد

## بنية المشروع

- `src/config.js`: قراءة والتحقق من متغيرات البيئة.
- `src/client.js`: إعداد عميل Discord والصلاحيات المطلوبة.
- `src/services/logger.js`: Embeds واللوق.
- `src/services/audit.js`: قراءة سجل التدقيق.
- `src/handlers/messages.js`: حماية الروم ولوق حذف الرسائل.
- `src/handlers/members.js`: لوق الدخول والخروج والكيك والباند.
- `src/index.js`: نقطة تشغيل البوت.

## التشغيل

1. انسخ `.env.example` إلى ملف جديد اسمه `.env`.
2. ضع توكن البوت في `DISCORD_TOKEN`.
3. ضع معرّف الروم في `PROTECTED_CHANNEL_ID`.
4. ضع معرّف روم اللوق في `LOG_CHANNEL_ID`.
5. شغّل البوت بالأمر:

```bash
npm start
```

يمكن رفع المشروع على أي استضافة تدعم Node.js. استخدم أمر البناء `npm install` وأمر التشغيل `npm start`، وأضف متغيرات `.env` من لوحة الاستضافة بدل رفع ملف `.env` إليها.

البوت يحذف رسالة أي عضو يكتب في الروم المحدد ثم يحظره نهائيًا. مالك السيرفر مستثنى تلقائيًا. يسجل البوت دخول الأعضاء وخروجهم وطردهم وحظرهم وحذف الرسائل في روم اللوق، مع محتوى الرسالة ومنشن الحاذف والروم وصاحب الرسالة عند توفرها. لإضافة أعضاء مستثنين، ضع أرقامهم في `EXEMPT_USER_IDS` مفصولة بفواصل.

يجب تفعيل **Message Content Intent** و**Server Members Intent** من صفحة البوت في Discord Developer Portal، ومنح البوت صلاحيات `View Channel` و`Manage Messages` و`Ban Members` و`View Audit Log`.