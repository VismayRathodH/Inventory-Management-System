import os
import sys
import django
from decimal import Decimal
from datetime import date, timedelta

# Set up Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.models import Category, InventoryItem, Bundle, BundleItem

def run():
    print("Clearing existing data (optional, but good for fresh seed)...")
    Bundle.objects.all().delete()
    InventoryItem.objects.all().delete()
    Category.objects.all().delete()

    print("Creating Categories...")
    cat_electronics = Category.objects.create(name="Electronics", description="Electronic devices and accessories")
    cat_furniture = Category.objects.create(name="Furniture", description="Office furniture")
    cat_stationery = Category.objects.create(name="Stationery", description="Office supplies and stationery")
    cat_kitchen = Category.objects.create(name="Kitchen Supplies", description="Breakroom and kitchen items")
    cat_cleaning = Category.objects.create(name="Cleaning Supplies", description="Janitorial and cleaning products")
    cat_it_infra = Category.objects.create(name="IT Infrastructure", description="Servers, networking, and cables")
    cat_merch = Category.objects.create(name="Merchandise", description="Company branded merchandise")

    print("Creating Inventory Items...")
    # Electronics
    item_laptop = InventoryItem.objects.create(item_name="ThinkPad T14", category=cat_electronics, quantity=50, cost_price=Decimal("850.00"), selling_price=Decimal("1200.00"), threshold_quantity=10, batch_number="B-ELEC-001")
    item_mouse = InventoryItem.objects.create(item_name="Logitech Wireless Mouse", category=cat_electronics, quantity=150, cost_price=Decimal("15.00"), selling_price=Decimal("35.00"), threshold_quantity=20, batch_number="B-ELEC-002")
    item_monitor = InventoryItem.objects.create(item_name="Dell 27-inch Monitor", category=cat_electronics, quantity=30, cost_price=Decimal("150.00"), selling_price=Decimal("250.00"), threshold_quantity=5, batch_number="B-ELEC-003")
    item_keyboard = InventoryItem.objects.create(item_name="Mechanical Keyboard", category=cat_electronics, quantity=40, cost_price=Decimal("45.00"), selling_price=Decimal("90.00"), threshold_quantity=10, batch_number="B-ELEC-004")
    item_webcam = InventoryItem.objects.create(item_name="1080p HD Webcam", category=cat_electronics, quantity=60, cost_price=Decimal("30.00"), selling_price=Decimal("60.00"), threshold_quantity=15, batch_number="B-ELEC-005")

    # Furniture
    item_desk = InventoryItem.objects.create(item_name="Standing Desk", category=cat_furniture, quantity=20, cost_price=Decimal("200.00"), selling_price=Decimal("350.00"), threshold_quantity=5, batch_number="B-FURN-001")
    item_chair = InventoryItem.objects.create(item_name="Ergonomic Office Chair", category=cat_furniture, quantity=40, cost_price=Decimal("100.00"), selling_price=Decimal("180.00"), threshold_quantity=10, batch_number="B-FURN-002")
    item_filing = InventoryItem.objects.create(item_name="Filing Cabinet", category=cat_furniture, quantity=15, cost_price=Decimal("80.00"), selling_price=Decimal("150.00"), threshold_quantity=5, batch_number="B-FURN-003")
    item_lamp = InventoryItem.objects.create(item_name="LED Desk Lamp", category=cat_furniture, quantity=35, cost_price=Decimal("20.00"), selling_price=Decimal("45.00"), threshold_quantity=10, batch_number="B-FURN-004")

    # Stationery
    item_notebook = InventoryItem.objects.create(item_name="A4 Ruled Notebook", category=cat_stationery, quantity=500, cost_price=Decimal("2.00"), selling_price=Decimal("5.00"), threshold_quantity=50, batch_number="B-STAT-001")
    item_pen = InventoryItem.objects.create(item_name="Gel Pen (Pack of 10)", category=cat_stationery, quantity=300, cost_price=Decimal("3.00"), selling_price=Decimal("8.00"), threshold_quantity=30, batch_number="B-STAT-002")
    item_paper = InventoryItem.objects.create(item_name="Printer Paper (Ream)", category=cat_stationery, quantity=200, cost_price=Decimal("4.00"), selling_price=Decimal("7.00"), threshold_quantity=40, batch_number="B-STAT-003")
    item_sticky = InventoryItem.objects.create(item_name="Sticky Notes", category=cat_stationery, quantity=400, cost_price=Decimal("1.00"), selling_price=Decimal("2.50"), threshold_quantity=50, batch_number="B-STAT-004")
    item_stapler = InventoryItem.objects.create(item_name="Heavy Duty Stapler", category=cat_stationery, quantity=25, cost_price=Decimal("8.00"), selling_price=Decimal("15.00"), threshold_quantity=5, batch_number="B-STAT-005")

    # Kitchen Supplies
    item_coffee = InventoryItem.objects.create(item_name="Arabica Coffee Beans 1kg", category=cat_kitchen, quantity=20, cost_price=Decimal("12.00"), selling_price=Decimal("25.00"), threshold_quantity=5, batch_number="B-KITCH-001")
    item_tea = InventoryItem.objects.create(item_name="Green Tea Bags (100)", category=cat_kitchen, quantity=30, cost_price=Decimal("5.00"), selling_price=Decimal("12.00"), threshold_quantity=10, batch_number="B-KITCH-002")
    item_sugar = InventoryItem.objects.create(item_name="Sugar Packets (500)", category=cat_kitchen, quantity=15, cost_price=Decimal("3.00"), selling_price=Decimal("8.00"), threshold_quantity=5, batch_number="B-KITCH-003")
    item_milk = InventoryItem.objects.create(item_name="Coffee Milk Pack", category=cat_kitchen, quantity=2, cost_price=Decimal("1.50"), selling_price=Decimal("3.00"), threshold_quantity=10, batch_number="B-KITCH-004", expiry_date=date.today() + timedelta(days=2))
    item_cups = InventoryItem.objects.create(item_name="Paper Cups (1000)", category=cat_kitchen, quantity=10, cost_price=Decimal("20.00"), selling_price=Decimal("40.00"), threshold_quantity=3, batch_number="B-KITCH-005")

    # Cleaning Supplies
    item_sanitizer = InventoryItem.objects.create(item_name="Hand Sanitizer 5L", category=cat_cleaning, quantity=10, cost_price=Decimal("15.00"), selling_price=Decimal("35.00"), threshold_quantity=3, batch_number="B-CLEAN-001")
    item_wipes = InventoryItem.objects.create(item_name="Disinfectant Wipes", category=cat_cleaning, quantity=50, cost_price=Decimal("4.00"), selling_price=Decimal("9.00"), threshold_quantity=15, batch_number="B-CLEAN-002")
    item_trashbags = InventoryItem.objects.create(item_name="Trash Bags 30G (100)", category=cat_cleaning, quantity=25, cost_price=Decimal("10.00"), selling_price=Decimal("22.00"), threshold_quantity=5, batch_number="B-CLEAN-003")
    
    # IT Infrastructure
    item_router = InventoryItem.objects.create(item_name="Enterprise Router", category=cat_it_infra, quantity=5, cost_price=Decimal("300.00"), selling_price=Decimal("600.00"), threshold_quantity=2, batch_number="B-IT-001")
    item_switch = InventoryItem.objects.create(item_name="24-Port Switch", category=cat_it_infra, quantity=8, cost_price=Decimal("150.00"), selling_price=Decimal("300.00"), threshold_quantity=2, batch_number="B-IT-002")
    item_cable = InventoryItem.objects.create(item_name="Cat6 Ethernet Cable (100ft)", category=cat_it_infra, quantity=40, cost_price=Decimal("15.00"), selling_price=Decimal("35.00"), threshold_quantity=10, batch_number="B-IT-003")

    # Merchandise
    item_tshirt = InventoryItem.objects.create(item_name="Company Logo T-Shirt", category=cat_merch, quantity=100, cost_price=Decimal("8.00"), selling_price=Decimal("20.00"), threshold_quantity=20, batch_number="B-MERCH-001")
    item_mug = InventoryItem.objects.create(item_name="Ceramic Logo Mug", category=cat_merch, quantity=80, cost_price=Decimal("4.00"), selling_price=Decimal("12.00"), threshold_quantity=15, batch_number="B-MERCH-002")
    item_hoodie = InventoryItem.objects.create(item_name="Premium Company Hoodie", category=cat_merch, quantity=30, cost_price=Decimal("25.00"), selling_price=Decimal("55.00"), threshold_quantity=10, batch_number="B-MERCH-003")

    print("Creating Bundles...")
    # Bundle 1: WFH Setup
    bundle_wfh = Bundle.objects.create(name="Work From Home Premium Setup", description="Complete WFH package including desk, chair, monitor, laptop and accessories.", icon="home_work")
    BundleItem.objects.create(bundle=bundle_wfh, inventory_item=item_laptop, quantity=1)
    BundleItem.objects.create(bundle=bundle_wfh, inventory_item=item_monitor, quantity=1)
    BundleItem.objects.create(bundle=bundle_wfh, inventory_item=item_mouse, quantity=1)
    BundleItem.objects.create(bundle=bundle_wfh, inventory_item=item_desk, quantity=1)
    BundleItem.objects.create(bundle=bundle_wfh, inventory_item=item_chair, quantity=1)

    # Bundle 2: New Hire Welcome Kit
    bundle_new_hire = Bundle.objects.create(name="New Hire Welcome Kit", description="Standard items provided to all new employees.", icon="card_travel")
    BundleItem.objects.create(bundle=bundle_new_hire, inventory_item=item_laptop, quantity=1)
    BundleItem.objects.create(bundle=bundle_new_hire, inventory_item=item_mouse, quantity=1)
    BundleItem.objects.create(bundle=bundle_new_hire, inventory_item=item_notebook, quantity=2)
    BundleItem.objects.create(bundle=bundle_new_hire, inventory_item=item_pen, quantity=1)
    BundleItem.objects.create(bundle=bundle_new_hire, inventory_item=item_mug, quantity=1)
    BundleItem.objects.create(bundle=bundle_new_hire, inventory_item=item_tshirt, quantity=1)

    # Bundle 3: Office Expansion Kit
    bundle_office = Bundle.objects.create(name="Office Expansion Kit", description="Essential furniture and tech for new office rooms.", icon="meeting_room")
    BundleItem.objects.create(bundle=bundle_office, inventory_item=item_desk, quantity=4)
    BundleItem.objects.create(bundle=bundle_office, inventory_item=item_chair, quantity=4)
    BundleItem.objects.create(bundle=bundle_office, inventory_item=item_monitor, quantity=4)
    BundleItem.objects.create(bundle=bundle_office, inventory_item=item_filing, quantity=1)
    BundleItem.objects.create(bundle=bundle_office, inventory_item=item_lamp, quantity=4)

    # Bundle 4: Breakroom Starter
    bundle_breakroom = Bundle.objects.create(name="Breakroom Starter Kit", description="Supplies for a standard office breakroom.", icon="coffee")
    BundleItem.objects.create(bundle=bundle_breakroom, inventory_item=item_coffee, quantity=2)
    BundleItem.objects.create(bundle=bundle_breakroom, inventory_item=item_tea, quantity=1)
    BundleItem.objects.create(bundle=bundle_breakroom, inventory_item=item_sugar, quantity=2)
    BundleItem.objects.create(bundle=bundle_breakroom, inventory_item=item_cups, quantity=1)
    BundleItem.objects.create(bundle=bundle_breakroom, inventory_item=item_wipes, quantity=3)

    # Bundle 5: IT Network Upgrade
    bundle_it = Bundle.objects.create(name="Network Upgrade Package", description="Networking gear for expanding office internet.", icon="router")
    BundleItem.objects.create(bundle=bundle_it, inventory_item=item_router, quantity=1)
    BundleItem.objects.create(bundle=bundle_it, inventory_item=item_switch, quantity=2)
    BundleItem.objects.create(bundle=bundle_it, inventory_item=item_cable, quantity=10)

    # Bundle 6: Stationery Bulk Pack
    bundle_stationery = Bundle.objects.create(name="Stationery Bulk Replenishment", description="Monthly replenishment of standard stationery.", icon="edit_document")
    BundleItem.objects.create(bundle=bundle_stationery, inventory_item=item_paper, quantity=10)
    BundleItem.objects.create(bundle=bundle_stationery, inventory_item=item_notebook, quantity=20)
    BundleItem.objects.create(bundle=bundle_stationery, inventory_item=item_pen, quantity=5)
    BundleItem.objects.create(bundle=bundle_stationery, inventory_item=item_sticky, quantity=15)
    BundleItem.objects.create(bundle=bundle_stationery, inventory_item=item_stapler, quantity=2)

    print("Database seeded successfully!")

if __name__ == "__main__":
    run()
