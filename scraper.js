const { chromium } = require('playwright');
const axios = require('axios');

async function enviarTelegram(mensaje) {
  const token = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    await axios.post(url, {
      chat_id: chatId,
      text: mensaje,
      parse_mode: 'Markdown'
    });
    console.log("Respuesta de Telegram: ¡Enviado!");
  } catch (e) {
    console.error("Error en Telegram:", e.response ? e.response.data : e.message);
  }
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  // Palabra clave actualizada a "seiko 5"
  const query = "seiko 5";
  console.log(`Buscando "${query}" en Wallapop...`);

  try {
    await page.goto(`https://es.wallapop.com/app/search?keywords=${encodeURIComponent(query)}&order_by=newest`, { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    await page.waitForTimeout(5000); 

    const firstTitle = page.locator('[class*="ItemCard__title"]').first();
    const firstPrice = page.locator('[class*="ItemCard__price"]').first();

    const titleText = await firstTitle.innerText();
    const priceText = await firstPrice.innerText();
    const link = page.url();

    const aviso = `⌚ *¡Nuevo Seiko 5 encontrado!* \n📦 ${titleText} \n💰 ${priceText} \n🔗 [Ver anuncio](${link})`;
    
    console.log(`Encontrado: ${titleText}`);
    await enviarTelegram(aviso);

  } catch (error) {
    console.error("Error al buscar:", error.message);
  }

  await browser.close();
})();