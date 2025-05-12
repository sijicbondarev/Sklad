from fastapi import FastAPI, APIRouter, Body, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import requests
from fastapi.responses import JSONResponse

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'sklad_production')]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class TelegramMessage(BaseModel):
    chat_id: str
    text: str

class TelegramResponse(BaseModel):
    success: bool
    message: str

class ContactForm(BaseModel):
    name: str
    contacts: str
    message: Optional[str] = None

class OrderForm(BaseModel):
    timing_value: str
    due_date_value: str
    video_type: str
    graphics: str
    purpose: str
    actor: Optional[bool] = False
    speaker: Optional[bool] = False
    location: Optional[bool] = False
    name: str
    contacts: str
    total: float

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

@api_router.post("/send-telegram", response_model=TelegramResponse)
async def send_telegram_message(message: TelegramMessage = Body(...)):
    try:
        bot_token = "7600038581:AAHwCKHfXp61Txg8HuU1mAL6KbvoVXTJn4o"
        response = requests.post(
            f"https://api.telegram.org/bot{bot_token}/sendMessage",
            json={"chat_id": message.chat_id, "text": message.text}
        )
        response.raise_for_status()
        return TelegramResponse(success=True, message="Message sent successfully")
    except Exception as e:
        logging.error(f"Error sending Telegram message: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")

@api_router.post("/contact", response_model=TelegramResponse)
async def submit_contact_form(form_data: ContactForm):
    try:
        # Format the message for Telegram
        message_text = f"""
Новый запрос от пользователя:
Имя: {form_data.name}
Контакт: {form_data.contacts}
Сообщение: {form_data.message or 'Не указано'}
"""
        
        # Store in database
        await db.contact_submissions.insert_one(form_data.dict())
        
        # Send to Telegram
        bot_token = "7600038581:AAHwCKHfXp61Txg8HuU1mAL6KbvoVXTJn4o"
        chat_id = "542053490"
        
        telegram_response = requests.post(
            f"https://api.telegram.org/bot{bot_token}/sendMessage",
            json={"chat_id": chat_id, "text": message_text}
        )
        
        if telegram_response.status_code != 200:
            raise Exception(f"Telegram API returned status code {telegram_response.status_code}")
        
        return TelegramResponse(success=True, message="Contact form submitted successfully")
    except Exception as e:
        logging.error(f"Error submitting contact form: {e}")
        return TelegramResponse(success=False, message=f"Failed to submit form: {str(e)}")

@api_router.post("/order", response_model=TelegramResponse)
async def submit_order_form(form_data: OrderForm):
    try:
        # Format the message for Telegram
        message_text = f"""
Новый заказ:
Хронометраж: {form_data.timing_value}
Срок: {form_data.due_date_value}
Тип видео: {form_data.video_type}
Тип производства: {form_data.graphics}
Размещение: {form_data.purpose}
Актеры, модели: {"Да" if form_data.actor else "Нет"}
Диктор: {"Да" if form_data.speaker else "Нет"}
Локации: {"Да" if form_data.location else "Нет"}
Имя: {form_data.name}
Контакт: {form_data.contacts}
Стоимость: ${form_data.total}
"""
        
        # Store in database
        await db.order_submissions.insert_one(form_data.dict())
        
        # Send to Telegram
        bot_token = "7600038581:AAHwCKHfXp61Txg8HuU1mAL6KbvoVXTJn4o"
        chat_id = "542053490"
        
        telegram_response = requests.post(
            f"https://api.telegram.org/bot{bot_token}/sendMessage",
            json={"chat_id": chat_id, "text": message_text}
        )
        
        if telegram_response.status_code != 200:
            raise Exception(f"Telegram API returned status code {telegram_response.status_code}")
        
        return TelegramResponse(success=True, message="Order submitted successfully")
    except Exception as e:
        logging.error(f"Error submitting order form: {e}")
        return TelegramResponse(success=False, message=f"Failed to submit order: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
