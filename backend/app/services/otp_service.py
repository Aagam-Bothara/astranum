"""OTP Service for email/phone verification."""

import asyncio
import random
import string
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from typing import Optional

import resend
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.otp import OTP, OTPType, OTPPurpose
from app.core.config import settings

# Initialize Resend
resend.api_key = settings.RESEND_API_KEY

# Thread pool for blocking operations
_executor = ThreadPoolExecutor(max_workers=3)


class OTPService:
    """Service for generating and verifying OTPs."""

    OTP_LENGTH = 6
    OTP_EXPIRY_MINUTES = 10
    MAX_ATTEMPTS = 3

    def __init__(self, db: AsyncSession):
        self.db = db

    def _generate_otp(self) -> str:
        """Generate a random 6-digit OTP."""
        return ''.join(random.choices(string.digits, k=self.OTP_LENGTH))

    async def create_otp(
        self,
        target: str,
        otp_type: OTPType,
        purpose: OTPPurpose,
    ) -> str:
        """
        Create and store a new OTP.

        Args:
            target: Email address or phone number
            otp_type: EMAIL or PHONE
            purpose: SIGNUP, LOGIN, or PASSWORD_RESET

        Returns:
            The generated OTP code
        """
        # Invalidate any existing OTPs for this target
        await self._invalidate_existing_otps(target, otp_type, purpose)

        # Generate new OTP
        code = self._generate_otp()
        expires_at = datetime.utcnow() + timedelta(minutes=self.OTP_EXPIRY_MINUTES)

        otp = OTP(
            target=target,
            otp_type=otp_type,
            purpose=purpose,
            code=code,
            expires_at=expires_at,
        )

        self.db.add(otp)
        await self.db.commit()

        return code

    async def verify_otp(
        self,
        target: str,
        code: str,
        otp_type: OTPType,
        purpose: OTPPurpose,
    ) -> tuple[bool, str]:
        """
        Verify an OTP.

        Args:
            target: Email address or phone number
            code: The OTP code to verify
            otp_type: EMAIL or PHONE
            purpose: SIGNUP, LOGIN, or PASSWORD_RESET

        Returns:
            Tuple of (success, message)
        """
        # Find the OTP
        result = await self.db.execute(
            select(OTP).where(
                and_(
                    OTP.target == target,
                    OTP.otp_type == otp_type,
                    OTP.purpose == purpose,
                    OTP.is_used == False,
                )
            ).order_by(OTP.created_at.desc())
        )
        otp = result.scalar_one_or_none()

        if not otp:
            return False, "No OTP found. Please request a new one."

        # Check if expired
        if datetime.utcnow() > otp.expires_at:
            return False, "OTP has expired. Please request a new one."

        # Check attempts
        if otp.attempts >= self.MAX_ATTEMPTS:
            return False, "Too many failed attempts. Please request a new OTP."

        # Verify code
        if otp.code != code:
            otp.attempts += 1
            await self.db.commit()
            remaining = self.MAX_ATTEMPTS - otp.attempts
            return False, f"Invalid OTP. {remaining} attempts remaining."

        # Mark as used
        otp.is_used = True
        await self.db.commit()

        return True, "OTP verified successfully."

    async def _invalidate_existing_otps(
        self,
        target: str,
        otp_type: OTPType,
        purpose: OTPPurpose,
    ):
        """Invalidate any existing unused OTPs for this target."""
        result = await self.db.execute(
            select(OTP).where(
                and_(
                    OTP.target == target,
                    OTP.otp_type == otp_type,
                    OTP.purpose == purpose,
                    OTP.is_used == False,
                )
            )
        )
        existing_otps = result.scalars().all()

        for otp in existing_otps:
            otp.is_used = True

        await self.db.commit()

    def _send_email_sync(self, email: str, code: str) -> dict:
        """Synchronous email sending (runs in thread pool)."""
        from_email = settings.FROM_EMAIL
        params: resend.Emails.SendParams = {
            "from": f"AstraVaani <{from_email}>",
            "to": [email],
            "subject": "Your AstraVaani Verification Code",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #7C3AED; margin: 0;">AstraVaani</h1>
                    <p style="color: #6B7280; margin-top: 5px;">Guidance Through Patterns</p>
                </div>

                <div style="background: linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%); border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 20px;">
                    <p style="color: white; margin: 0 0 10px 0; font-size: 14px;">Your verification code is:</p>
                    <h2 style="color: white; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: monospace;">{code}</h2>
                </div>

                <p style="color: #374151; font-size: 14px; line-height: 1.6;">
                    This code will expire in <strong>10 minutes</strong>.
                    If you didn't request this code, please ignore this email.
                </p>

                <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">

                <p style="color: #9CA3AF; font-size: 12px; text-align: center;">
                    This is an automated message from AstraVaani. Please do not reply.
                </p>
            </div>
            """,
        }
        return resend.Emails.send(params)

    async def send_email_otp(self, email: str, code: str) -> bool:
        """
        Send OTP via email using Resend (non-blocking).
        """
        try:
            # Run blocking Resend call in thread pool
            loop = asyncio.get_event_loop()
            email_response = await loop.run_in_executor(
                _executor, self._send_email_sync, email, code
            )
            print(f"[EMAIL OTP] Sent to {email}, ID: {email_response.get('id', 'unknown')}")
            return True

        except Exception as e:
            print(f"[EMAIL OTP ERROR] Failed to send to {email}: {str(e)}")
            # Fallback: log the OTP for development
            print(f"[EMAIL OTP FALLBACK] Code for {email}: {code}")
            # Return True in development mode so the flow continues
            if settings.DEBUG:
                return True
            return False

    async def send_sms_otp(self, phone: str, code: str) -> bool:
        """
        Send OTP via SMS.

        TODO: Integrate with SMS service (Twilio, MSG91, etc.)
        For now, this just logs the OTP.
        """
        print(f"[SMS OTP] Sending OTP {code} to {phone}")
        # In production, integrate with SMS service:
        # - Twilio
        # - MSG91 (popular in India)
        # - AWS SNS
        # - etc.
        return True
