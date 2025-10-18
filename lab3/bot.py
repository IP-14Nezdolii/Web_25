import logging
from telegram import ReplyKeyboardMarkup, Update
from telegram.ext import Application, CommandHandler, ContextTypes, MessageHandler, filters
from telegram.constants import ChatAction
from google import genai

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

class TelegramBot:
    def __init__(self, tg_token, gpt_token):
        self.chatbot = genai.Client(api_key=gpt_token)
        self.application = Application.builder().token(tg_token).build()
        
        self.text = ""

        self.application.add_handler(CommandHandler("start", self.start))
        self.application.add_handler(MessageHandler(filters.TEXT, self.handle_message))

    async def start(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        reply_markup = ReplyKeyboardMarkup(
            keyboard = [
                ["student", "IT"],
                ["email", "Gemini"]
            ],
            resize_keyboard=True,
            one_time_keyboard=False,
        )
        await update.message.reply_text("👋 Привіт! Обери пункт меню:", reply_markup=reply_markup)

    async def handle_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        text = update.message.text.lower()

        if text == "student":
            await update.message.reply_text("Нездолій Владислав ІП-24")
            self.chat_mode = False
        elif text == "it":
            await update.message.reply_text("Python, Docker, AI, ML, Spring Boot, PostgreSQL")
            self.chat_mode = False
        elif text == "email":
            await update.message.reply_text("abab@.com")
            self.chat_mode = False
        elif text == "gemini":
            try:
                if text == "" :
                    await update.message.reply_text('Привіт! Будь ласка, введіть текст, який ви хочете обробити та натисніть "Gemini".')
                else:
                    response = self.chatbot.models.generate_content(
                        model='gemini-2.0-flash',
                        contents=self.text
                    )
                    await update.message.reply_text(response.text)

            except Exception as e:
                await update.message.reply_text(f"⚠️ Сталася помилка: {e}")
        else:
            self.text = text
        
    def run(self):
        self.application.run_polling()