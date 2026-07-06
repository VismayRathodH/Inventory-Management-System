from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class InventoryItem(models.Model):
    item_name = models.CharField(max_length=150, db_index=True)
    category = models.ForeignKey(Category, on_delete=models.RESTRICT, related_name='inventory_items')
    quantity = models.IntegerField(validators=[MinValueValidator(0)])
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))])
    selling_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))])
    threshold_quantity = models.IntegerField(default=10, validators=[MinValueValidator(0)])
    image = models.CharField(max_length=255, blank=True, null=True)
    expiry_date = models.DateField(blank=True, null=True)
    batch_number = models.CharField(max_length=50, blank=True, null=True)
    created_date = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['item_name', 'category', 'batch_number', 'expiry_date'],
                name='unique_inventory_item_batch'
            )
        ]
        indexes = [
            models.Index(fields=['category', 'expiry_date'], name='category_expiry_idx'),
        ]

    def __str__(self):
        return f"{self.item_name} ({self.batch_number})"

class Notification(models.Model):
    TYPE_CHOICES = [
        ('LOW_STOCK', 'Low Stock'),
        ('EXPIRING_SOON', 'Expiring Soon'),
        ('EXPIRED', 'Expired'),
    ]
    SEVERITY_CHOICES = [
        ('WARNING', 'Warning'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    ]
    
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} - {self.inventory_item.item_name}"
