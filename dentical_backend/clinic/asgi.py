import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinic.settings')

# MUHIM: get_asgi_application() django.setup() ni chaqiradi — bu app.routing
# importidan OLDIN bo'lishi shart, aks holda daphne'da AppRegistryNotReady xatosi chiqadi.
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter  # noqa: E402
from channels.auth import AuthMiddlewareStack  # noqa: E402
from app.routing import websocket_urlpatterns  # noqa: E402  WebSocket marshrutlari

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(  # Foydalanuvchi autentifikatsiyasini qo'shish
        URLRouter(websocket_urlpatterns)
    ),
})
