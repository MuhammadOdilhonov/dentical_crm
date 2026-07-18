# -*- coding: utf-8 -*-
"""Chiroyli HTML emaillar uchun umumiy yordamchilar.

Barcha emaillar bir xil dizaynda: tepada Dentical + klinika logotipi,
o'rtada hamkorlik GIF'i (sidebar'dagi kabi), pastda dentical.uz/login tugmasi.
"""
import logging

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)


def build_email_context(clinic=None, **extra) -> dict:
    """Har bir email uchun umumiy kontekst (logolar, GIF, havolalar)."""
    frontend = settings.FRONTEND_URL.rstrip('/')
    ctx = {
        'frontend_url': frontend,
        'login_url': f'{frontend}/login',
        'dentical_logo_url': f'{frontend}/images/dentical_logo.png',
        'gif_url': f'{frontend}/images/contract-icon.gif',
        'clinic_logo_url': '',
        'clinic_name': '',
        'year': __import__('datetime').date.today().year,
    }
    if clinic is not None:
        ctx['clinic_name'] = getattr(clinic, 'name', '') or ''
        try:
            if getattr(clinic, 'logo', None):
                logo_url = clinic.logo.url
                if not logo_url.startswith('http'):
                    logo_url = settings.BACKEND_URL.rstrip('/') + logo_url
                ctx['clinic_logo_url'] = logo_url
        except Exception:
            pass
    ctx.update(extra)
    return ctx


def send_html_email(subject, recipient, template, context,
                    plain_message=None, fail_silently=True) -> bool:
    """HTML shablonli email yuborish (plain-text fallback bilan)."""
    try:
        html_message = render_to_string(template, context)
        send_mail(
            subject=subject,
            message=plain_message or strip_tags(html_message),
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[recipient],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        logger.error("Email yuborilmadi (%s): %s", recipient, e)
        if not fail_silently:
            raise
        return False
