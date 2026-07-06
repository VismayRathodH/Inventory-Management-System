from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework import status, viewsets, filters
from django.contrib.auth import authenticate, get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, InventoryItem, Notification
from .serializers import CategorySerializer, InventoryItemSerializer, NotificationSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({'status': 'ok'})

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username_or_email = request.data.get('email') or request.data.get('username')
    password = request.data.get('password')
    
    if not username_or_email or not password:
        return Response({'error': 'Please provide email/username and password'}, status=status.HTTP_400_BAD_REQUEST)
        
    User = get_user_model()
    user_obj = User.objects.filter(email=username_or_email).first() or User.objects.filter(username=username_or_email).first()
    
    if user_obj:
        user = authenticate(username=user_obj.username, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key})
            
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.inventory_items.exists():
            return Response(
                {"error": f"Cannot delete category '{instance.name}' because it contains inventory items."},
                status=status.HTTP_400_BAD_REQUEST
            )
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all().order_by('-created_date')
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['item_name', 'batch_number', 'category__name']
    filterset_fields = ['category', 'expiry_date']
    ordering_fields = ['item_name', 'quantity', 'cost_price', 'selling_price', 'expiry_date', 'created_date']

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['type', 'severity', 'is_read']

    def get_queryset(self):
        # Auto-generate notifications based on current inventory
        import datetime
        from django.utils.timezone import now
        today = now().date()
        
        for item in InventoryItem.objects.all():
            # 1. Low Stock
            if item.quantity < item.threshold_quantity:
                severity = 'WARNING'
                if item.quantity == 0:
                    severity = 'CRITICAL'
                elif item.quantity < (item.threshold_quantity * 0.5):
                    severity = 'HIGH'
                
                Notification.objects.get_or_create(
                    inventory_item=item,
                    type='LOW_STOCK',
                    defaults={'severity': severity}
                )
            else:
                Notification.objects.filter(inventory_item=item, type='LOW_STOCK').delete()
            
            # 2. Expiry
            if item.expiry_date:
                diff = (item.expiry_date - today).days
                if diff <= 0:
                    Notification.objects.get_or_create(
                        inventory_item=item,
                        type='EXPIRED',
                        defaults={'severity': 'CRITICAL'}
                    )
                    Notification.objects.filter(inventory_item=item, type='EXPIRING_SOON').delete()
                elif diff <= 7:
                    Notification.objects.get_or_create(
                        inventory_item=item,
                        type='EXPIRING_SOON',
                        defaults={'severity': 'HIGH'}
                    )
                    Notification.objects.filter(inventory_item=item, type='EXPIRED').delete()
                elif diff <= 30:
                    Notification.objects.get_or_create(
                        inventory_item=item,
                        type='EXPIRING_SOON',
                        defaults={'severity': 'WARNING'}
                    )
                    Notification.objects.filter(inventory_item=item, type='EXPIRED').delete()
                else:
                    # Not expiring soon
                    Notification.objects.filter(inventory_item=item, type__in=['EXPIRED', 'EXPIRING_SOON']).delete()
            else:
                Notification.objects.filter(inventory_item=item, type__in=['EXPIRED', 'EXPIRING_SOON']).delete()

        return Notification.objects.all().order_by('-created_at')
