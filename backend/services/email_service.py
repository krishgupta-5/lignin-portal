"""
Email Service for Lignin Yield Predictor.
Sends OTP verification and notification emails via SMTP (e.g. Gmail)
with maximum inbox deliverability and anti-spam RFC header compliance.
"""
import asyncio
import logging
import smtplib
import uuid
from datetime import datetime, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr, formatdate, make_msgid

from config import SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM_NAME

logger = logging.getLogger(__name__)

def _send_smtp_sync(to_email: str, subject: str, html_body: str, plain_text: str) -> bool:
    """
    Synchronous SMTP sending worker supporting STARTTLS (587) and SSL (465).
    Includes complete RFC 5322 headers (Message-ID, Date, Reply-To, Auto-Submitted)
    to maximize inbox placement and prevent spam filter flagging.
    """
    if not SMTP_USER or not SMTP_PASSWORD:
        logger.warning("SMTP credentials not configured. Email not sent.")
        return False

    msg = MIMEMultipart("alternative")
    
    # 1. Standard Subject & Addressing
    msg["Subject"] = subject
    from_address = formataddr((EMAIL_FROM_NAME, SMTP_USER))
    msg["From"] = from_address
    msg["To"] = to_email
    msg["Reply-To"] = from_address

    # 2. Critical Anti-Spam RFC Headers
    msg["Date"] = formatdate(localtime=True)
    msg["Message-ID"] = make_msgid(domain=SMTP_HOST.replace("smtp.", "") if "smtp." in SMTP_HOST else "gmail.com")
    msg["MIME-Version"] = "1.0"
    msg["X-Mailer"] = "Lignin-Research-Portal/1.0"
    msg["Auto-Submitted"] = "auto-generated"
    msg["X-Auto-Response-Suppress"] = "All"
    msg["X-Entity-Ref-ID"] = str(uuid.uuid4())

    # 3. Balanced Multipart/Alternative Payload (Plain text MUST precede HTML)
    part_text = MIMEText(plain_text, "plain", "utf-8")
    part_html = MIMEText(html_body, "html", "utf-8")
    msg.attach(part_text)
    msg.attach(part_html)

    try:
        if SMTP_PORT == 465:
            server = smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=15)
        else:
            server = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15)
            server.ehlo()
            server.starttls()
            server.ehlo()

        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_USER, [to_email], msg.as_string())
        server.quit()
        logger.info(f"Verification email successfully delivered via SMTP ({SMTP_HOST}:{SMTP_PORT}) to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to deliver email to {to_email} via {SMTP_HOST}:{SMTP_PORT}: {e}")
        return False


async def send_verification_otp_email(to_email: str, name: str, otp: str) -> bool:
    """
    Send a 6-digit OTP verification code with high-deliverability clean HTML & text template.
    """
    # High-reputation subject format recognized by email client OTP auto-fillers
    subject = f"{otp} is your verification code for Lignin Yield Predictor"
    current_year = datetime.now(timezone.utc).year
    
    plain_text = (
        f"Hello {name},\n\n"
        f"Your verification code for the AI-Powered Lignin Yield Predictor is:\n\n"
        f"   {otp}\n\n"
        f"This code will expire in 10 minutes.\n\n"
        f"If you did not create an account or request this code, please safely ignore this message. "
        f"Your account remains secure.\n\n"
        f"— AI-Powered Lignin Yield Predictor Research Team\n"
        f"Sustainable Biomass & Deep Learning Intelligence Portal\n"
    )

    # High-contrast, clean, light-themed HTML email layout that avoids spam heuristics
    html_body = f"""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f6f8; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Bar -->
          <tr>
            <td align="center" style="background-color: #1b4332; padding: 26px 20px; border-bottom: 3px solid #2d6a4f;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: -0.3px;">
                    🌿 AI-Powered Lignin Yield Predictor
                  </td>
                </tr>
                <tr>
                  <td align="center" style="color: #d8f3dc; font-size: 13px; font-weight: 400; padding-top: 4px;">
                    Deep Learning &amp; Biomass Extraction Intelligence
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 30px 24px 30px; text-align: left;">
              <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 19px; font-weight: 600;">
                Verify Your Email Address
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.55; color: #475569;">
                Hello <strong>{name}</strong>,<br />
                Thank you for joining the research portal. Please enter the following 6-digit verification code to complete your registration:
              </p>

              <!-- OTP Code Display Card -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0 24px 0;">
                <tr>
                  <td align="center" style="background-color: #f0fdf4; border: 1.5px solid #86efac; border-radius: 10px; padding: 18px 24px;">
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #166534; display: inline-block;">
                      {otp}
                    </span>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 8px 0; font-size: 13px; line-height: 1.5; color: #64748b;">
                ⏱️ This code will expire in <strong>10 minutes</strong>.
              </p>
              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #64748b;">
                🔒 If you did not request this verification code, you can safely ignore this email. No action is required.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 30px; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #94a3b8; line-height: 1.4;">
                &copy; {current_year} AI Lignin Yield Predictor &bull; Capstone Research Project
              </p>
              <p style="margin: 0; font-size: 11px; color: #cbd5e1;">
                This is an automated system notification. Please do not reply directly to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    # Run blocking SMTP in thread pool so it does not block async event loop
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _send_smtp_sync, to_email, subject, html_body, plain_text)


async def send_password_reset_otp_email(to_email: str, name: str, otp: str) -> bool:
    """
    Send a 6-digit OTP password recovery code with high-deliverability clean HTML & text template.
    """
    subject = f"{otp} is your password reset code for Lignin Yield Predictor"
    current_year = datetime.now(timezone.utc).year
    
    plain_text = (
        f"Hello {name},\n\n"
        f"We received a request to reset your password for the AI-Powered Lignin Yield Predictor.\n"
        f"Your 6-digit password reset code is:\n\n"
        f"   {otp}\n\n"
        f"This code will expire in 10 minutes.\n\n"
        f"If you did not request a password reset, please safely ignore this message. "
        f"Your existing password will remain unchanged.\n\n"
        f"— AI-Powered Lignin Yield Predictor Research Team\n"
        f"Sustainable Biomass & Deep Learning Intelligence Portal\n"
    )

    html_body = f"""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f6f8; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Bar -->
          <tr>
            <td align="center" style="background-color: #1b4332; padding: 26px 20px; border-bottom: 3px solid #2d6a4f;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: -0.3px;">
                    🌿 AI-Powered Lignin Yield Predictor
                  </td>
                </tr>
                <tr>
                  <td align="center" style="color: #d8f3dc; font-size: 13px; font-weight: 400; padding-top: 4px;">
                    Password Recovery Assistance
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 30px 24px 30px; text-align: left;">
              <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 19px; font-weight: 600;">
                Password Reset Code
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.55; color: #475569;">
                Hello <strong>{name}</strong>,<br />
                We received a request to reset your password. Please use the following 6-digit verification code to set up a new password:
              </p>

              <!-- OTP Code Display Card -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0 24px 0;">
                <tr>
                  <td align="center" style="background-color: #eff6ff; border: 1.5px solid #93c5fd; border-radius: 10px; padding: 18px 24px;">
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1e40af; display: inline-block;">
                      {otp}
                    </span>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 8px 0; font-size: 13px; line-height: 1.5; color: #64748b;">
                ⏱️ This code is valid for <strong>10 minutes</strong>.
              </p>
              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #64748b;">
                🔒 If you did not initiate this password reset, you can safely ignore this email. Your existing password remains secure.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 30px; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #94a3b8; line-height: 1.4;">
                &copy; {current_year} AI Lignin Yield Predictor &bull; Capstone Research Project
              </p>
              <p style="margin: 0; font-size: 11px; color: #cbd5e1;">
                This is an automated system notification. Please do not reply directly to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _send_smtp_sync, to_email, subject, html_body, plain_text)

