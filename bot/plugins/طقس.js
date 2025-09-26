const axios = require("axios");

module.exports = {
  name: "طقس",
  description: "يعرض حالة الطقس لمدينة معينة",
  async execute(client, message, args) {
    if (!args.length)
      return client.sendMessage(message.from, "✳️ من فضلك اكتب اسم المدينة بعد الأمر");

    const city = args.join(" ");
    const apiKey = "adf0cf22618186fc11e9f89c090cb356"; // مفتاح OpenWeather

    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          city
        )}&appid=${apiKey}&units=metric&lang=ar`
      );
      const data = res.data;
      const weatherMsg = `
🌐 حالة الطقس في *${data.name}*، ${data.sys.country}:
🌡️ الحرارة: ${data.main.temp}°C
🌡️ الحرارة الصغرى: ${data.main.temp_min}°C
🌡️ الحرارة العظمى: ${data.main.temp_max}°C
💧 الرطوبة: ${data.main.humidity}%
💨 سرعة الرياح: ${data.wind.speed} m/s
☁️ الغيوم: ${data.clouds.all}%
🕰️ شروق الشمس: ${new Date(data.sys.sunrise * 1000).toLocaleTimeString("ar-EG")}
🌇 غروب الشمس: ${new Date(data.sys.sunset * 1000).toLocaleTimeString("ar-EG")}
      `;
      await client.sendMessage(message.from, { text: weatherMsg });
    } catch (e) {
      await client.sendMessage(message.from, {
        text: "❌ لم أتمكن من جلب بيانات الطقس، تأكد من اسم المدينة.",
      });
    }
  },
};