from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, InventoryItem, Notification, Bundle, BundleItem, Sale, SaleItem, UserProfile, PendingOrder

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['role', 'authority_level', 'facility', 'avatar']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active', 'profile', 'password']
        extra_kwargs = {'password': {'write_only': True, 'required': False}}

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        
        if profile_data:
            for attr, value in profile_data.items():
                setattr(user.profile, attr, value)
            user.profile.save()
        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        password = validated_data.pop('password', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()

        if profile_data:
            for attr, value in profile_data.items():
                setattr(instance.profile, attr, value)
            instance.profile.save()
        return instance

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

class BundleItemSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='inventory_item.item_name', read_only=True)
    inventory_item_id = serializers.PrimaryKeyRelatedField(
        queryset=InventoryItem.objects.all(), source='inventory_item', write_only=True
    )

    class Meta:
        model = BundleItem
        fields = ['id', 'inventory_item_id', 'name', 'quantity']

class BundleSerializer(serializers.ModelSerializer):
    items = BundleItemSerializer(many=True)
    status = serializers.SerializerMethodField()

    class Meta:
        model = Bundle
        fields = ['id', 'name', 'description', 'icon', 'items', 'status', 'created_date', 'last_updated']

    def get_status(self, obj):
        # Optional: check if all items in bundle are in stock
        # For simplicity, returning 'In Stock' or logic based on threshold
        for item in obj.items.all():
            if item.inventory_item.quantity < item.quantity:
                if item.inventory_item.quantity == 0:
                    return 'Out of Stock'
                return 'Low Stock'
        return 'In Stock'

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        bundle = Bundle.objects.create(**validated_data)
        for item_data in items_data:
            BundleItem.objects.create(bundle=bundle, **item_data)
        return bundle

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.icon = validated_data.get('icon', instance.icon)
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                BundleItem.objects.create(bundle=instance, **item_data)
        
        return instance

class SaleItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleItem
        fields = ['id', 'item_name', 'quantity', 'price']

class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True)

    class Meta:
        model = Sale
        fields = [
            'id', 'invoice_number', 'customer_name', 'customer_email', 
            'total_quantity', 'tax_percentage', 'tax_amount', 'subtotal', 'grand_total', 
            'payment_status', 'payment_method', 'notes',
            'created_at', 'updated_at', 'items'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # Calculate total_quantity if not provided
        if 'total_quantity' not in validated_data or validated_data['total_quantity'] == 0:
            validated_data['total_quantity'] = sum(item['quantity'] for item in items_data)
            
        sale = Sale.objects.create(**validated_data)
        for item_data in items_data:
            SaleItem.objects.create(sale=sale, **item_data)
        return sale

class PendingOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = PendingOrder
        fields = ['id', 'order_id', 'customer_name', 'items_description', 'status', 'created_at', 'updated_at']
