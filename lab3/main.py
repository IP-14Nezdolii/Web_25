from bot import TelegramBot
from tokens import TOKEN_TG, TOKEN_GPT 


if __name__ == "__main__":
 
    bot = TelegramBot(TOKEN_TG, TOKEN_GPT )
    bot.run()
    