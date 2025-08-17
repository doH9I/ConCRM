#!/usr/bin/env python3
"""
Telegram Bot for CRM System Notifications
This bot sends alerts and notifications to specified chat
"""

import os
import time
import requests
import logging
from datetime import datetime
from typing import Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class CRMTelegramBot:
    def __init__(self):
        self.bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
        self.chat_id = os.getenv('TELEGRAM_CHAT_ID')
        
        if not self.bot_token or not self.chat_id:
            logger.error("TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set")
            raise ValueError("Missing required environment variables")
        
        self.base_url = f"https://api.telegram.org/bot{self.bot_token}"
        
    def send_message(self, message: str, parse_mode: str = "HTML") -> bool:
        """Send message to Telegram chat"""
        try:
            url = f"{self.base_url}/sendMessage"
            data = {
                "chat_id": self.chat_id,
                "text": message,
                "parse_mode": parse_mode
            }
            
            response = requests.post(url, data=data, timeout=10)
            response.raise_for_status()
            
            logger.info(f"Message sent successfully: {message[:50]}...")
            return True
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to send message: {e}")
            return False
    
    def send_alert(self, alert_type: str, title: str, message: str, severity: str = "info") -> bool:
        """Send formatted alert message"""
        emoji_map = {
            "info": "ℹ️",
            "warning": "⚠️",
            "error": "🚨",
            "success": "✅",
            "critical": "🚨🚨🚨"
        }
        
        emoji = emoji_map.get(severity, "ℹ️")
        
        formatted_message = f"""
{emoji} <b>{alert_type.upper()}</b>

<b>{title}</b>

{message}

<b>Time:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
<b>Severity:</b> {severity.upper()}
        """.strip()
        
        return self.send_message(formatted_message)
    
    def send_system_status(self, status_data: dict) -> bool:
        """Send system status update"""
        message = f"""
🖥️ <b>System Status Update</b>

<b>Backend:</b> {'🟢 Online' if status_data.get('backend', False) else '🔴 Offline'}
<b>Frontend:</b> {'🟢 Online' if status_data.get('frontend', False) else '🔴 Offline'}
<b>Database:</b> {'🟢 Online' if status_data.get('database', False) else '🔴 Offline'}
<b>Redis:</b> {'🟢 Online' if status_data.get('redis', False) else '🔴 Offline'}

<b>CPU Usage:</b> {status_data.get('cpu', 'N/A')}%
<b>Memory Usage:</b> {status_data.get('memory', 'N/A')}%
<b>Disk Usage:</b> {status_data.get('disk', 'N/A')}%

<b>Last Update:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        """.strip()
        
        return self.send_message(message)
    
    def send_backup_notification(self, backup_file: str, size: str, status: str) -> bool:
        """Send backup completion notification"""
        emoji = "✅" if status == "success" else "❌"
        
        message = f"""
💾 <b>Backup Notification</b>

<b>Status:</b> {emoji} {status.upper()}
<b>File:</b> {backup_file}
<b>Size:</b> {size}
<b>Time:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        """.strip()
        
        return self.send_message(message)
    
    def send_deployment_notification(self, environment: str, version: str, status: str) -> bool:
        """Send deployment notification"""
        emoji = "🚀" if status == "success" else "💥"
        
        message = f"""
{emoji} <b>Deployment Notification</b>

<b>Environment:</b> {environment.upper()}
<b>Version:</b> {version}
<b>Status:</b> {emoji} {status.upper()}
<b>Time:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        """.strip()
        
        return self.send_message(message)

def main():
    """Main function for testing the bot"""
    try:
        bot = CRMTelegramBot()
        
        # Test message
        bot.send_message("🤖 CRM Telegram Bot is now online!")
        
        # Test alert
        bot.send_alert(
            "System Test",
            "Bot Initialization",
            "Telegram bot has been successfully initialized and is ready to send notifications.",
            "success"
        )
        
        # Test system status
        test_status = {
            "backend": True,
            "frontend": True,
            "database": True,
            "redis": True,
            "cpu": 45,
            "memory": 67,
            "disk": 23
        }
        bot.send_system_status(test_status)
        
        logger.info("Bot initialization completed successfully")
        
        # Keep the bot running
        while True:
            time.sleep(3600)  # Sleep for 1 hour
            
    except Exception as e:
        logger.error(f"Bot initialization failed: {e}")
        exit(1)

if __name__ == "__main__":
    main()