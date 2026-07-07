# FUTURE COMPATIBILITY

Design the Sale and SaleItem models so they can be directly reused by the Analytics module in Phase 3.

Include fields such as:

• created_at
• updated_at
• invoice_number
• total_quantity
• subtotal
• tax
• grand_total
• payment_status (default: PAID)
• payment_method (default: CASH)
• notes (optional)

Do not implement analytics yet.

Only ensure the schema is ready for future phases without requiring database redesign.