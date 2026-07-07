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

class Bundle(models.Model):
    name = models.CharField(max_length=150, unique=True)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=50, default='package_2')
    created_date = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class BundleItem(models.Model):
    bundle = models.ForeignKey(Bundle, on_delete=models.CASCADE, related_name='items')
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.RESTRICT, related_name='bundle_occurrences')
    quantity = models.IntegerField(validators=[MinValueValidator(1)])

    class Meta:
        unique_together = ('bundle', 'inventory_item')

    def __str__(self):
        return f"{self.quantity}x {self.inventory_item.item_name} in {self.bundle.name}"

class Sale(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('CANCELLED', 'Cancelled'),
    ]
    PAYMENT_METHOD_CHOICES = [
        ('CASH', 'Cash'),
        ('CREDIT_CARD', 'Credit Card'),
        ('DEBIT_CARD', 'Debit Card'),
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('OTHER', 'Other'),
    ]

    invoice_number = models.CharField(max_length=50, unique=True)
    customer_name = models.CharField(max_length=150, blank=True, null=True)
    customer_email = models.EmailField(blank=True, null=True)
    total_quantity = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    tax_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, validators=[MinValueValidator(Decimal('0.00'))])
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    grand_total = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='PAID')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='CASH')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.invoice_number

class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='items')
    item_name = models.CharField(max_length=150)
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.item_name} in {self.sale.invoice_number}"
