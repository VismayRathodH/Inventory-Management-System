from rest_framework import serializers
from .models import Category, InventoryItem, Notification

class CategorySerializer(serializers.ModelSerializer):
    itemCount = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'itemCount']

    def get_itemCount(self, obj):
        return obj.inventory_items.count()

class InventoryItemSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    category_name = serializers.CharField(source='category.name', read_only=True)
    expiryStatus = serializers.SerializerMethodField()

    class Meta:
        model = InventoryItem
        fields = [
            'id', 'item_name', 'category', 'category_name', 'quantity', 
            'cost_price', 'selling_price', 'threshold_quantity', 'image',
            'expiry_date', 'batch_number', 'created_date', 'last_updated',
            'expiryStatus'
        ]

    def get_expiryStatus(self, obj):
        if not obj.expiry_date:
            return "Safe"
        import datetime
        from django.utils.timezone import now
        today = now().date()
        diff = (obj.expiry_date - today).days

        if diff <= 0:
            return "Expired"
        if diff <= 7:
            return "Expiring in 7 days"
        if diff <= 30:
            return "Expiring in 30 days"
        return "Safe"

class NotificationSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='inventory_item.item_name', read_only=True)
    
    class Meta:
        model = Notification
        fields = ['id', 'inventory_item', 'item_name', 'type', 'severity', 'is_read', 'created_at']
