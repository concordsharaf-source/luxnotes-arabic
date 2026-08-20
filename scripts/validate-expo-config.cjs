const fs = require("fs");

const config = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
if (config.name !== "دفتر ملاحظاتي الفاخر") throw new Error("اسم التطبيق غير صحيح");
if (config.orientation !== "portrait") throw new Error("يجب أن يبقى اتجاه التطبيق عموديًا");
if (!Array.isArray(config.plugins) || config.plugins.length === 0) throw new Error("إضافات Expo غير متاحة");

console.log(`Expo configuration validated: ${config.name} · ${config.orientation} · ${config.plugins.length} plugins`);
