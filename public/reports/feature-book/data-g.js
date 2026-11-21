// Packages and prices. Only the Cafe package that exists in the live admin (plan id 7, created 2026-11-09, inactive draft).
// Price is NOT set yet: the owner decides. Limits are placeholders until the owner confirms them.
window.PKGS = [
 {k: "CAFE", en: "Cafe", or: "କାଫେ", year: null, month: null,
  limits: "10 users · 300 products · 2,000 customers · 50 suppliers · no branches (placeholders, owner to confirm)",
  gives: "Sales and takeaway billing, token numbers, kitchen (KOT and screen), products with modifiers and combos, customers and suppliers, GST, reports, expenses, purchase, inventory with recipes, cash register, coupons, loyalty points, wallet and gift cards, customer dues, QR menu, table QR ordering, advance orders, barcode",
  who: "Cafes: counter and take-away, with QR menu and table QR ordering for seated guests"}
];

// No add-ons are defined yet.
window.ADDONS = [];

// Sell kit. cards = feature names from the book, in the order to show them.
window.KITS = [
{ id: "cafe", en: "Cafe", or: "କାଫେ", pkg: "CAFE",
  who: "A cafe with a counter, a barista or small kitchen, regular customers, and maybe a few tables. Quick bills, repeat customers and tight stock of milk, beans and bakery items.",
  problems: ["Milk, beans, syrups and bakery items run out without warning, or get wasted", "Regular customers are not recognised and get no reward for coming back", "Counter cash does not match the sales at closing", "Prices of add-ons (size, milk type, extra shot) are worked out by hand", "Prepaid cards and offers are tracked on paper"],
  cards: ["POS Billing", "Modifiers (add-ons)", "Combos", "Token numbers", "Token board for a TV", "Kitchen tickets (KOT)", "Table QR Ordering", "Recipes", "Stock alerts", "Expiry tracking", "Wastage", "Purchases", "Loyalty points", "Wallet and gift cards", "Coupons", "Cash register", "Advance orders", "Barcode and labels", "GST invoices and settings", "Sales reports"],
  demo: [["0-2", "Counter bill", "Make a coffee bill with a size and a milk choice, take UPI, print the bill."], ["2-4", "Token and kitchen", "Show the token number and the kitchen ticket for the same order."], ["4-6", "Regulars", "Add a customer, give loyalty points, then redeem on the next bill. Sell a gift card."], ["6-8", "Stock", "Show a recipe, buy milk through Purchase, and show a stock alert."], ["8-10", "Closing", "Open and close the cash register and open the day's sales report."]],
  qa: [["Do we need GST?", "GST is off by default; the owner can switch it on."], ["Can we take orders from the table?", "QR menu and table QR ordering are in the package. Test them on a Cafe plan before showing a customer."], ["Can staff see everything?", "No. Staff roles control what each login can open."]],
  notpromise: ["Price and limits are not set yet (the plan is an inactive draft)", "Dine In order type, Delivery, Online Store and Branches are not in this package", "Offline billing has not been tested on a phone", "Do not promise table QR ordering as a dine-in feature until it is tested on a Cafe plan"],
  next: "Owner sets the price and limits, then switches the Cafe plan on in Admin > Plans." }
];

window.PRICE_NOTES = {
  anchors: [],
  points: [
    "The Cafe package exists in the live admin as plan id 7, created 2026-11-09, and is an inactive draft.",
    "Price and limits are not final: the owner decides. Do not quote a price until the plan is switched on.",
    "Modules on: Sales, Takeaway, Token numbers, Products, Kitchen, Parties, GST, Reports, Expenses, Purchase, Inventory, Cash Register, Coupons, Loyalty Points, Wallet & Gift Cards, Due List, QR Menu, Table QR Ordering, Advance Orders, Barcode, plus Payment Type and Tables (needed by the others).",
    "Modules off: Dine In, Delivery, Quotation, QR Ordering, Reservation, HRM, Branch, Incomes, Online Store, Partner API."
  ]
};
