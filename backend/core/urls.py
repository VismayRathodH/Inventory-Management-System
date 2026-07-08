from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import health_check, login_view, CategoryViewSet, InventoryItemViewSet, NotificationViewSet, BundleViewSet, SaleViewSet, UserViewSet, PendingOrderViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'categories', CategoryViewSet)
router.register(r'inventory', InventoryItemViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'bundles', BundleViewSet)
router.register(r'sales', SaleViewSet)
router.register(r'pending-orders', PendingOrderViewSet)

urlpatterns = [
    path('health/', health_check, name='health-check'),
    path('auth/login/', login_view, name='login'),
    path('', include(router.urls)),
]
