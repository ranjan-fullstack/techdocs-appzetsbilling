import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import MobileToc from '../components/MobileToc.jsx';
import StartHereCard from '../components/StartHereCard.jsx';
import FlowSummary from '../components/FlowSummary.jsx';

const TOC = [
  { id: 'sales', num: '01', label: 'Sales & Orders' },
  { id: 'editdelete', num: '02', label: 'Edit / Delete a Sale' },
  { id: 'purchases', num: '03', label: 'Purchases' },
  { id: 'quotations', num: '04', label: 'Quotations' },
  { id: 'catalog', num: '05', label: 'Catalog' },
  { id: 'kitchen', num: '06', label: 'Kitchen' },
  { id: 'reservations', num: '07', label: 'Reservations' },
  { id: 'parties', num: '08', label: 'Parties' },
  { id: 'incomeexpense', num: '09', label: 'Incomes & Expenses' },
  { id: 'tax', num: '10', label: 'Tax (VAT)' },
  { id: 'dues', num: '11', label: 'Due Collection' },
  { id: 'paymenttypes', num: '12', label: 'Payment Types' },
  { id: 'reports', num: '13', label: 'Reports' },
  { id: 'branch', num: '14', label: 'Branch' },
  { id: 'hrm', num: '15', label: 'HRM' },
  { id: 'cashregister', num: '16', label: 'Cash Register' },
  { id: 'inventory', num: '17', label: 'Inventory Ledger' },
  { id: 'onlinestore', num: '18', label: 'Online Store' },
  { id: 'onboarding', num: '19', label: 'Onboarding & Billing' },
  { id: 'others', num: '20', label: 'Other App Areas' },
  { id: 'tenancy', num: '21', label: 'Tenancy at Runtime' },
  { id: 'gating', num: '22', label: 'Plan Gating at Runtime' },
];

const META = (
  <>
    Traced from real Controllers<br />
    &amp; Services on the VPS<br />
    Hostinger VPS · Ubuntu 24.04<br />
    Investigated 2026-09-14
  </>
);

const BRANCH_SCOPE_MODELS = ['Area', 'DueCollect', 'Expense', 'Income', 'Ingredient', 'Kitchen', 'KotTicket', 'Modifier', 'Product', 'Purchase', 'Quotation', 'Reservation', 'Sale', 'Table', 'Transaction'];
const DATA_MANAGER_MODELS = ['DueCollect', 'Party', 'Product', 'Purchase', 'Quotation', 'Sale'];

export default function ApplicationFlow() {
  const [activeSection, setActiveSection] = useState('sales');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) setActiveSection(en.target.id);
        });
      },
      { rootMargin: '-15% 0px -70% 0px' },
    );
    TOC.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <MobileToc toc={TOC} />
      <div className="shell">
        <Sidebar toc={TOC} activeSection={activeSection} meta={META} />
        <main>
          <div className="topband" style={{ margin: '-38px -56px 0', padding: '26px clamp(16px,4vw,56px)' }}>
            <div className="title-row">
              <div>
                <h1>AppzetBilling — Application Flow</h1>
                <div className="desc">
                  What actually happens in code, module by module — every one of the 18 real plan modules (§05 of the DB
                  doc) plus every other app area, each traced to its actual Controller/Service file(s) on the VPS and the
                  exact tables it writes, in order. Not started from assumption: every claim below is a grep or a read of
                  the live source.
                </div>
              </div>
              <div className="badge-date">investigated 2026‑09‑14</div>
            </div>

            <StartHereCard
              items={[
                { q: 'How does a POS sale actually get built?', a: '§01 Sales & Orders', href: '#sales' },
                { q: 'How is the online store different from POS?', a: '§01 Sales & Orders, and §18 Online Store', href: '#sales' },
                { q: 'How does ingredient stock actually move?', a: '§17 Inventory Ledger', href: '#inventory' },
                { q: 'How does a new tenant sign up and pay?', a: '§19 Onboarding & Billing', href: '#onboarding' },
                { q: 'Where do the multi-tenancy scopes actually attach?', a: '§21 Tenancy at Runtime', href: '#tenancy' },
                { q: 'How does plan/addon gating work at request time?', a: '§22 Plan Gating at Runtime', href: '#gating' },
              ]}
              note={
                <>
                  §01–§18 map 1:1 onto the 18 real <code className="mono">available_modules</code> plan-gate keys from the
                  DB doc's <a href="/db-architecture#planModules">§05 Plan Modules</a>; §20 covers everything else — Staff
                  &amp; Roles, Coupons, Tables, Settings, and the rest of the App Areas that no plan toggle can switch off.
                  For the static shape of the schema itself, see the <a href="/db-architecture">DB Architecture</a> doc.
                </>
              }
            />
          </div>

          <section id="sales">
            <div className="eyebrow">01 · Sales &amp; Orders</div>
            <h2>Two independent implementations build a sale — not one</h2>
            <p className="lede">
              <code className="mono">AcnooSaleController::store()</code> (POS, staff-facing) and{' '}
              <code className="mono">AcnooCheckoutController::createSale()</code> (online store, customer-facing) both
              turn a cart into a sale, but they are two separate hand-written implementations, not one shared path — see
              Finding 26. What one POS sale actually writes:
            </p>
            <div className="steps">
              <div className="step" data-n="1">
                <h4>Validate &amp; price</h4>
                <p>
                  Cart must be non-empty; a dine-in KOT sale must have a <code className="mono">table_id</code>. Subtotal,
                  VAT, discount, coupon and cashback are computed in PHP from the session cart — none of this touches the DB
                  yet.
                </p>
              </div>
              <div className="step" data-n="2">
                <h4>Create the sale</h4>
                <p>
                  If dine-in, <code className="mono">tables.is_booked</code> flips to true. One{' '}
                  <code className="mono">sales</code> row is inserted with the computed totals, an auto-incrementing
                  per-business invoice number, and status <code className="mono">pending</code> (KOT/table) or{' '}
                  <code className="mono">completed</code>.
                </p>
              </div>
              <div className="step" data-n="3">
                <h4>Write the line items</h4>
                <p>
                  One <code className="mono">sale_details</code> row per cart item. Chosen variations are synced into{' '}
                  <code className="mono">sale_detail_product_variations</code>; chosen modifiers are bulk-inserted into{' '}
                  <code className="mono">sale_detail_options</code>.
                </p>
              </div>
              <div className="step" data-n="4">
                <h4>Route to the kitchen (if KOT)</h4>
                <p>
                  Line items are grouped by the product's <code className="mono">kitchen_product</code> assignment. One{' '}
                  <code className="mono">kot_tickets</code> row is created per kitchen group, and each{' '}
                  <code className="mono">sale_details</code> row in that group is stamped with its{' '}
                  <code className="mono">kot_ticket_id</code>. A push notification goes to staff with role{' '}
                  <code className="mono">chef</code>/<code className="mono">kitchen</code> — no further DB write.
                </p>
              </div>
              <div className="step" data-n="5">
                <h4>Settle the party's due, drop the quotation</h4>
                <p>
                  If there's an outstanding balance and a customer is attached, <code className="mono">parties.due</code> is
                  incremented directly — no <code className="mono">due_collects</code> row is created at sale time. If this
                  sale came from a quotation, that <code className="mono">quotations</code> row is hard-deleted — Finding 23.
                </p>
              </div>
              <div className="step" data-n="6">
                <h4>Deduct stock, log the transaction</h4>
                <p>
                  <code className="mono">Transaction::create()</code> writes one <code className="mono">transactions</code>{' '}
                  row unconditionally. Then <code className="mono">StockService::processSale()</code> runs — see §17 — and
                  updates <code className="mono">business.remainingShopBalance</code>. All of this is one DB transaction;
                  any exception rolls the whole sale back.
                </p>
              </div>
            </div>
            <h3 style={{ marginTop: 30 }}>The online-store version — same tables, different code, one missing step</h3>
            <p>
              <code className="mono">Modules/RestaurantOnlineStore/App/Http/Controllers/OnlineStore/AcnooCheckoutController.php</code>{' '}
              — <code className="mono">checkoutPayment()</code> prices the cart and stashes it in session as{' '}
              <code className="mono">online_order</code>; <code className="mono">createSale()</code> then writes{' '}
              <code className="mono">sales</code>, <code className="mono">sale_details</code>,{' '}
              <code className="mono">sale_detail_options</code>, the kitchen-grouped{' '}
              <code className="mono">kot_tickets</code>, and a <code className="mono">transactions</code> row —{' '}
              <i>copy-pasted</i> from the POS flow above, not shared with it (Finding 26). One real behavioral difference:
              it never calls <code className="mono">StockService::processSale()</code>, so an online order for a
              recipe-tracked product does not reduce ingredient stock the way the identical POS sale would (Finding 25).
              It does set <code className="mono">billing_address_id</code> from a real, validated{' '}
              <code className="mono">billing_addresses.id</code> — direct evidence, not just a schema guess, for what
              Finding 1 already found broken at the constraint level (Finding 27).
            </p>
            <FlowSummary
              files={['AcnooSaleController.php', 'AcnooCheckoutController.php (online)']}
              tables={['sales', 'sale_details', 'sale_detail_options', 'sale_detail_product_variations', 'kot_tickets', 'transactions', 'parties', 'businesses']}
              note="online orders identify the customer as a users row (auth('customer') guard, provider: users in config/auth.php) via sales.user_id, not a parties row — a second, parallel customer-identity path alongside the staff-entered parties table used everywhere else."
            />
          </section>

          <section id="editdelete">
            <div className="eyebrow">02 · Edit / Delete a Sale</div>
            <h2>Stock has to be reversed by hand — and it is, just not where you'd expect</h2>
            <p className="lede">
              A sale isn't append-only: editing or deleting one has to undo whatever stock it deducted, or ingredient counts
              drift permanently. AppzetBilling handles this correctly for POS sales, but through a slightly confusing path
              — and, per §01, not at all for online-store sales, since those never deducted stock in the first place.
            </p>
            <p>
              <code className="mono">AcnooSaleController::update()</code> calls{' '}
              <code className="mono">StockService::reverseSale()</code> then{' '}
              <code className="mono">StockService::processSale()</code> again — deleting the old{' '}
              <code className="mono">stock_movements</code> rows for that sale and recomputing fresh ones from the edited
              line items. <code className="mono">destroy()</code> calls just{' '}
              <code className="mono">reverseSale()</code>, then also reverses the party's{' '}
              <code className="mono">due</code>, deletes any <code className="mono">kot_tickets</code> for that sale, and
              unbooks the table.
            </p>
            <p>
              What's confusing: <code className="mono">Modules/InventoryAddon/App/Observers/SaleObserver.php</code> exists
              and implements exactly this — <code className="mono">created</code>/<code className="mono">updated</code>/
              <code className="mono">deleted</code> hooks that call the same two service methods. It is never registered
              (no <code className="mono">Sale::observe(SaleObserver::class)</code> anywhere), so it never runs. The
              controller's manual calls are what actually keeps stock correct — the observer is inert, duplicate logic.
              See Finding 22.
            </p>
          </section>

          <section id="purchases">
            <div className="eyebrow">03 · Purchases</div>
            <h2>The one flow that actually uses a shared service class</h2>
            <p className="lede">
              Unlike sales, <code className="mono">AcnooPurchaseController</code> delegates the real work to{' '}
              <code className="mono">Modules/RestaurantWebAddon/App/Services/PurchaseService.php</code> — one place, used
              by both <code className="mono">store()</code> and <code className="mono">destroy()</code>.
            </p>
            <div className="steps">
              <div className="step" data-n="1">
                <h4>Price, then update party due and shop balance</h4>
                <p>
                  Subtotal from the cart, VAT/discount from the request. If there's a due amount,{' '}
                  <code className="mono">parties.due</code> increments. <code className="mono">businesses.remainingShopBalance</code>{' '}
                  <i>decrements</i> by whatever was actually paid — the mirror image of a sale.
                </p>
              </div>
              <div className="step" data-n="2">
                <h4>Create the purchase and its lines</h4>
                <p>
                  One <code className="mono">purchases</code> row, then a bulk{' '}
                  <code className="mono">PurchaseDetails::insert()</code> — one row per ingredient line, unlike sales
                  which loop-creates one at a time.
                </p>
              </div>
              <div className="step" data-n="3">
                <h4>Stock in, log the transaction</h4>
                <p>
                  <code className="mono">StockService::processPurchase()</code> runs (§17) — converts each line's quantity
                  to the ingredient's base unit and writes <code className="mono">stock_in</code>{' '}
                  <code className="mono">stock_movements</code> rows. Then one{' '}
                  <code className="mono">transactions</code> row (<code className="mono">type: 'debit'</code>, the
                  opposite of a sale's <code className="mono">'credit'</code>).
                </p>
              </div>
            </div>
            <p>
              <code className="mono">PurchaseService::delete()</code> mirrors this exactly in reverse:{' '}
              <code className="mono">StockService::reversePurchase()</code>, un-does the party due and shop balance
              changes, then deletes the purchase.
            </p>
            <FlowSummary
              files={['AcnooPurchaseController.php', 'PurchaseService.php']}
              tables={['purchases', 'purchase_details', 'stock_movements', 'transactions', 'parties', 'businesses']}
            />
          </section>

          <section id="quotations">
            <div className="eyebrow">04 · Quotations</div>
            <h2>A quote never becomes a sale directly — it re-fills the cart</h2>
            <p className="lede">
              <code className="mono">QuotationController::store()</code> writes{' '}
              <code className="mono">quotations</code>, <code className="mono">quotation_details</code>,{' '}
              <code className="mono">quotation_detail_options</code>, and syncs{' '}
              <code className="mono">quotation_detail_product_variations</code> — structurally identical to a sale, using
              the same subtotal/VAT/discount/coupon math as §01.
            </p>
            <p>
              <code className="mono">convertSale()</code> does <i>not</i> touch the database at all. It loads the
              quotation's line items and pushes them back into the session cart (type <code className="mono">'sale'</code>
              ), then renders the normal sale-creation screen pre-filled. The actual <code className="mono">sales</code>{' '}
              row only gets created when that pre-filled cart is submitted through §01's{' '}
              <code className="mono">AcnooSaleController::store()</code> — which is also the exact moment the original{' '}
              <code className="mono">quotations</code> row gets hard-deleted (Finding 23). There is no FK and no status
              flag connecting the two rows; the only proof a quotation became a sale is momentary, in a request that
              already finished.
            </p>
            <FlowSummary
              files={['QuotationController.php']}
              tables={['quotations', 'quotation_details', 'quotation_detail_options', 'quotation_detail_product_variations']}
            />
          </section>

          <section id="catalog">
            <div className="eyebrow">05 · Catalog</div>
            <h2>Products, categories, menus, modifiers — five controllers, one shape</h2>
            <p className="lede">
              Every catalog controller follows the same pattern: validate, then a single{' '}
              <code className="mono">Model::create($request-&gt;except(...) + ['business_id' =&gt; ...])</code>. Products
              is the one with real branching logic.
            </p>
            <div className="gapcard">
              <div className="g">
                <h4>AcnooProductController::store()</h4>
                <p>
                  One <code className="mono">products</code> row. If <code className="mono">price_type</code> is{' '}
                  <code className="mono">'variation'</code>, loops creating <code className="mono">product_variations</code>{' '}
                  rows instead of using the flat <code className="mono">sales_price</code> column. Each selected modifier
                  group creates one <code className="mono">modifiers</code> row linking the product to it.
                </p>
              </div>
              <div className="g">
                <h4>AcnooModifierGroupController::store()</h4>
                <p>
                  One <code className="mono">modifier_groups</code> row, then one{' '}
                  <code className="mono">modifier_group_options</code> row per option — the two-level structure ("Toppings"
                  group, "Extra Cheese" option) the DB doc's Catalog notes describe.
                </p>
              </div>
            </div>
            <FlowSummary
              files={['AcnooProductController.php', 'AcnooCategoryController.php', 'AcnooMenuController.php', 'AcnooModifierGroupController.php', 'AcnooModifierController.php']}
              tables={['products', 'product_variations', 'modifiers', 'categories', 'menus', 'modifier_groups', 'modifier_group_options']}
            />
          </section>

          <section id="kitchen">
            <div className="eyebrow">06 · Kitchen</div>
            <h2>Per-item cooking status rolls up into the ticket automatically</h2>
            <p className="lede">
              <code className="mono">AcnooKitchenController::store()</code> is a plain{' '}
              <code className="mono">Kitchen::create()</code> (which stations exist). The interesting logic is in{' '}
              <code className="mono">AcnooKotController</code>, which never creates a <code className="mono">kot_tickets</code>{' '}
              row itself — that only happens inside §01's sale creation — but drives its lifecycle after.
            </p>
            <div className="steps">
              <div className="step" data-n="1">
                <h4>cookingStatus() — per line item</h4>
                <p>
                  A kitchen marks one <code className="mono">sale_details.cooking_status</code> as{' '}
                  <code className="mono">start</code> or <code className="mono">ready</code>.
                </p>
              </div>
              <div className="step" data-n="2">
                <h4>Auto-aggregate to the ticket</h4>
                <p>
                  After every update, it recounts sibling line items on the same{' '}
                  <code className="mono">kot_ticket_id</code>: zero still <code className="mono">pending</code> flips{' '}
                  <code className="mono">kot_tickets.status</code> to <code className="mono">preparing</code>; zero not
                  yet <code className="mono">ready</code> flips it to <code className="mono">ready</code>. No item is
                  updated directly by staff — the ticket status is entirely derived.
                </p>
              </div>
              <div className="step" data-n="3">
                <h4>kotStatus() — the ticket itself</h4>
                <p>
                  A direct status change (<code className="mono">served</code>, <code className="mono">cancelled</code>{' '}
                  — with a required <code className="mono">cancel_reason_id</code>) on{' '}
                  <code className="mono">kot_tickets</code> itself, bypassing the per-item rollup.
                </p>
              </div>
            </div>
            <FlowSummary files={['AcnooKitchenController.php', 'AcnooKotController.php']} tables={['kitchens', 'sale_details', 'kot_tickets', 'cancel_reasons']} />
          </section>

          <section id="reservations">
            <div className="eyebrow">07 · Reservations</div>
            <h2>A minimum party size lives in the generic options table, not a column</h2>
            <p className="lede">
              <code className="mono">AcnooReservationController::store()</code> checks the requested{' '}
              <code className="mono">guest</code> count against a <code className="mono">minimum_party_size</code> pulled
              from <code className="mono">Option::where('key', 'reservation-setting')</code> — the per-tenant reservation
              settings screen writes JSON into the shared <code className="mono">options</code> table rather than a
              dedicated settings table (see §20). Only then does it write one{' '}
              <code className="mono">reservations</code> row.
            </p>
            <p>
              <code className="mono">assignTable()</code> is the one place with a real conflict check: before syncing{' '}
              <code className="mono">reservation_tables</code>, it queries for any <i>other</i> reservation on the same{' '}
              <code className="mono">date</code>/<code className="mono">time</code> already holding that table, and refuses
              with a 422 if one exists — this is the only double-booking guard in the schema; nothing enforces it at the
              database level (§05 Multi-Tenancy on the DB doc covers a very similar pattern with{' '}
              <code className="mono">coupons.code</code>/<code className="mono">parties.phone</code>).
            </p>
            <FlowSummary files={['AcnooReservationController.php']} tables={['reservations', 'reservation_tables', 'options']} note="minimum-party-size is read from options, not a dedicated column — see §20 Settings." />
          </section>

          <section id="parties">
            <div className="eyebrow">08 · Parties</div>
            <h2>One contact table for both customers and suppliers</h2>
            <p>
              <code className="mono">AcnooPartyController::store()</code> writes one <code className="mono">parties</code>{' '}
              row (<code className="mono">type</code> distinguishes customer from supplier — this is what §11 Due
              Collection and §03 Purchases branch on) and, if a delivery address was supplied inline, one{' '}
              <code className="mono">delivery_addresses</code> row alongside it.
            </p>
            <FlowSummary files={['AcnooPartyController.php']} tables={['parties', 'delivery_addresses']} />
          </section>

          <section id="incomeexpense">
            <div className="eyebrow">09 · Incomes &amp; Expenses</div>
            <h2>Plain ledger entries — no automatic shop-balance side effect</h2>
            <p>
              Both <code className="mono">AcnooIncomeController::store()</code> and{' '}
              <code className="mono">AcnooExpenseController::store()</code> are a single{' '}
              <code className="mono">Model::create()</code> against their own table plus a category table. Unlike sales,
              purchases, and payroll (§15), neither touches{' '}
              <code className="mono">businesses.remainingShopBalance</code> — manual income/expense entries are tracked
              for reporting, not folded into the live balance figure the other flows maintain.
            </p>
            <FlowSummary
              files={['AcnooIncomeController.php', 'AcnooIncomeCategoryController.php', 'AcnooExpenseController.php', 'AcnooExpenseCategoryController.php']}
              tables={['incomes', 'income_categories', 'expenses', 'expense_categories']}
            />
          </section>

          <section id="tax">
            <div className="eyebrow">10 · Tax (VAT)</div>
            <h2>Only one tax can be "the" sale-time VAT at once</h2>
            <p>
              <code className="mono">AcnooVatController</code> writes ordinary <code className="mono">taxes</code> rows,
              but enforces one real business rule at write time: whenever a tax is saved with{' '}
              <code className="mono">vat_on_sale</code> true, every other tax row for that tenant is force-updated to{' '}
              <code className="mono">vat_on_sale: false</code> first. It's how §01–§04's sale/purchase/quotation flows all
              know unambiguously which single tax rate to auto-apply — a uniqueness rule enforced in the controller, not
              by a database constraint.
            </p>
            <FlowSummary files={['AcnooVatController.php']} tables={['taxes']} />
          </section>

          <section id="dues">
            <div className="eyebrow">11 · Due Collection</div>
            <h2>The most branching write path in the app</h2>
            <p className="lede">
              <code className="mono">AcnooDueController::collectDueStore()</code> settles a due either against a specific
              invoice or, for a walk-in with no linked party, against nothing but an invoice number.
            </p>
            <div className="steps">
              <div className="step" data-n="1">
                <h4>Find what's being paid</h4>
                <p>
                  With an invoice number: looks up a <code className="mono">purchases</code> row (party type{' '}
                  <code className="mono">supplier</code>) or a <code className="mono">sales</code> row (anyone else),
                  scoped to that party — or, with no party at all, a <code className="mono">sales</code> row with{' '}
                  <code className="mono">party_id</code> null. Rejects if the payment would exceed that invoice's real due.
                </p>
              </div>
              <div className="step" data-n="2">
                <h4>Record the payment</h4>
                <p>
                  One <code className="mono">due_collects</code> row, pointing at whichever of{' '}
                  <code className="mono">sale_id</code>/<code className="mono">purchase_id</code> applies (never both),
                  snapshotting the due before and after.
                </p>
              </div>
              <div className="step" data-n="3">
                <h4>Update the invoice, the party, and the shop balance</h4>
                <p>
                  The source <code className="mono">sales</code>/<code className="mono">purchases</code> row's{' '}
                  <code className="mono">dueAmount</code>/<code className="mono">paidAmount</code> both update.{' '}
                  <code className="mono">parties.due</code> and, if there was no invoice,{' '}
                  <code className="mono">parties.opening_balance</code> decrease by the payment. The direction{' '}
                  <code className="mono">businesses.remainingShopBalance</code> moves depends on{' '}
                  <code className="mono">party.type</code> — up for a customer paying down what they owe, down for
                  settling what's owed to a supplier.
                </p>
              </div>
            </div>
            <FlowSummary files={['AcnooDueController.php']} tables={['due_collects', 'sales', 'purchases', 'parties', 'businesses']} />
          </section>

          <section id="paymenttypes">
            <div className="eyebrow">12 · Payment Types</div>
            <h2>A per-tenant lookup list, nothing more</h2>
            <p>
              <code className="mono">AcnooPaymentTypeController::store()</code> is a single{' '}
              <code className="mono">PaymentType::create()</code> — the list every{' '}
              <code className="mono">payment_type_id</code> column across sales, purchases, dues, income, and expenses
              picks from.
            </p>
            <FlowSummary files={['AcnooPaymentTypeController.php']} tables={['payment_types']} />
          </section>

          <section id="reports">
            <div className="eyebrow">13 · Reports</div>
            <h2>Confirmed: no dedicated tables, by design</h2>
            <p>
              A dozen-plus controllers (<code className="mono">AcnooSaleReportController</code>,{' '}
              <code className="mono">AcnooPurchaseReportController</code>,{' '}
              <code className="mono">AcnooVatReportController</code>,{' '}
              <code className="mono">AcnooDueReportController</code>, and more) share one shape:{' '}
              <code className="mono">only('index')</code> routes, an <code className="mono">acnooFilter()</code> for
              search, and PDF/Excel/CSV export actions. All of them read — none writes. This matches what §05 Plan
              Modules already found from the entitlement-gating side: the <code className="mono">reports</code> plan
              module owns zero tables because there's nothing to own.
            </p>
          </section>

          <section id="branch">
            <div className="eyebrow">14 · Branch</div>
            <h2>Creating the first branch quietly restructures existing data</h2>
            <p>
              <code className="mono">Modules/MultiBranchAddon/App/Http/Controllers/AcnooBranchController::store()</code>{' '}
              checks whether a <code className="mono">business_id</code> already has a branch flagged{' '}
              <code className="mono">is_main</code>. If not — meaning this is the tenant's very first branch —{' '}
              it calls <code className="mono">manipulateBranchData($business_id)</code> before creating the new{' '}
              <code className="mono">branches</code> row, which (by name) backfills a main branch for whatever data
              already existed pre-multi-branch. Given <code className="mono">branches</code> has 0 live rows today (DB
              doc §04), this path has likely never actually executed in production.
            </p>
            <FlowSummary files={['AcnooBranchController.php']} tables={['branches']} />
          </section>

          <section id="hrm">
            <div className="eyebrow">15 · HRM</div>
            <h2>Payroll is the only HR flow with a business-balance side effect</h2>
            <p className="lede">
              Employees, attendance, and leave are all a single <code className="mono">Model::create()</code> against
              their own table. Payroll is different.
            </p>
            <div className="steps">
              <div className="step" data-n="1">
                <h4>Guard against double payment</h4>
                <p>
                  <code className="mono">AcnooPayrollController::store()</code> refuses if a{' '}
                  <code className="mono">payrolls</code> row already exists for that{' '}
                  <code className="mono">employee_id</code> + <code className="mono">month</code> +{' '}
                  <code className="mono">payment_year</code> — a uniqueness rule enforced in the controller, not a
                  database constraint.
                </p>
              </div>
              <div className="step" data-n="2">
                <h4>Move the shop balance</h4>
                <p>
                  Calls the shared <code className="mono">updateBalance($amount, 'decrement')</code> helper (
                  <code className="mono">app/Helpers/Helper.php</code>) — the same{' '}
                  <code className="mono">businesses.remainingShopBalance</code> column §01/§03/§11 touch inline, here
                  moved through a named helper instead.
                </p>
              </div>
              <div className="step" data-n="3">
                <h4>Write the payroll row</h4>
                <p>
                  One <code className="mono">payrolls</code> row. <code className="mono">payment_type_id</code> is only
                  set if the payment method wasn't plain cash.
                </p>
              </div>
            </div>
            <FlowSummary
              files={['AcnooEmployeeController.php', 'AcnooAttendanceController.php', 'AcnooPayrollController.php', 'AcnooLeaveController.php']}
              tables={['employees', 'attendances', 'payrolls', 'leaves', 'businesses']}
            />
          </section>

          <section id="cashregister">
            <div className="eyebrow">16 · Cash Register</div>
            <h2>Every open and close is its own audit row</h2>
            <div className="steps">
              <div className="step" data-n="1">
                <h4>Open a shift</h4>
                <p>
                  <code className="mono">AcnooCashRegisterController::store()</code> writes one{' '}
                  <code className="mono">cash_registers</code> row (<code className="mono">opening_balance</code>,{' '}
                  <code className="mono">closing_balance_expected</code> starting equal to it) and one{' '}
                  <code className="mono">cash_register_transactions</code> row logging that opening balance —
                  every register session is auditable from its very first cent.
                </p>
              </div>
              <div className="step" data-n="2">
                <h4>Close it</h4>
                <p>
                  <code className="mono">closing()</code> compares the staff-counted{' '}
                  <code className="mono">closing_balance_counted</code> against{' '}
                  <code className="mono">closing_balance_expected</code>, stores the difference on the same row (not a
                  new transaction), and stamps <code className="mono">closed_by</code>/<code className="mono">closed_at</code>{' '}
                  — the <code className="mono">NO ACTION</code> FK on those two columns the DB doc's Finding 3 already
                  flagged means deleting that closing user later will fail outright, not null quietly.
                </p>
              </div>
            </div>
            <FlowSummary files={['AcnooCashRegisterController.php']} tables={['cash_registers', 'cash_register_transactions']} />
          </section>

          <section id="inventory">
            <div className="eyebrow">17 · Inventory Ledger</div>
            <h2>Stock moves through one service, two directions — plus a running total kept in sync automatically</h2>
            <p className="lede">
              Every write to <code className="mono">stock_movements</code> — from a purchase, a sale, or a manual
              adjustment — goes through <code className="mono">Modules/InventoryAddon/App/Services/StockService.php</code>.
              There's no other path that creates one.
            </p>
            <div className="gapcard">
              <div className="g">
                <h4>Purchase → stock in</h4>
                <p>
                  <code className="mono">processPurchase()</code> loads every{' '}
                  <code className="mono">purchase_details</code> line, converts its quantity into the ingredient's base
                  unit (via <code className="mono">units.factor</code>/<code className="mono">operator</code>, e.g. 500g →
                  0.5kg), and writes one <code className="mono">stock_movements</code> row per line with{' '}
                  <code className="mono">type: 'stock_in'</code>, tagged back to the purchase via{' '}
                  <code className="mono">reference_id</code>/<code className="mono">reference_type</code>.
                </p>
              </div>
              <div className="g">
                <h4>Sale → stock out</h4>
                <p>
                  <code className="mono">processSale()</code> looks up a <code className="mono">recipes</code> row per
                  sold product (scoped to the sale's business and branch); no recipe, no deduction. For each{' '}
                  <code className="mono">recipe_ingredients</code> line it writes one{' '}
                  <code className="mono">stock_movements</code> row (<code className="mono">type: 'stock_out'</code>) sized
                  by quantity sold × the recipe's per-unit ingredient amount. Called from POS (§01) unconditionally; never
                  called from online-store checkout (§01, §18 — Finding 25).
                </p>
              </div>
            </div>
            <p style={{ marginTop: 16 }}>
              Both directions are cleanly reversible: <code className="mono">reversePurchase()</code>/
              <code className="mono">reverseSale()</code> just delete every{' '}
              <code className="mono">stock_movements</code> row matching that{' '}
              <code className="mono">reference_id</code>/<code className="mono">reference_type</code> pair, which is what
              §02 relies on — and that delete is itself what keeps the running total correct, because of what happens next.
            </p>
            <h3 style={{ marginTop: 30 }}>The running total lives on the ingredient row, kept in sync automatically</h3>
            <p>
              Neither <code className="mono">StockService</code> method ever touches{' '}
              <code className="mono">ingredients.stock_quantity</code> directly. Instead,{' '}
              <code className="mono">Modules/InventoryAddon/App/Models/StockMovement.php</code> has its own{' '}
              <code className="mono">booted()</code> hooks — <code className="mono">creating</code>,{' '}
              <code className="mono">updating</code>, <code className="mono">deleting</code> — that increment or decrement
              the ingredient's <code className="mono">stock_quantity</code> by the signed amount every time a{' '}
              <code className="mono">stock_movements</code> row is written or removed, regardless of which service call
              created it. Creating an ingredient by hand (<code className="mono">AcnooInventoryItemController::store()</code>
              ) sets an initial <code className="mono">stock_quantity</code> directly too — so the figure has two write
              paths: a manual starting value, then automatic ledger-driven adjustments after.
            </p>
            <p>
              Low-stock alerting is fully implemented but currently dormant in production:{' '}
              <code className="mono">app/Console/Kernel.php</code> schedules{' '}
              <code className="mono">ingredient:check-low-stock</code> to run every minute, and the command itself finds
              every ingredient where <code className="mono">stock_quantity &lt;= stock_alert</code> and{' '}
              <code className="mono">last_notified_at</code> isn't today, notifies every user on that business, and stamps{' '}
              <code className="mono">last_notified_at</code> — capping each ingredient to one alert per day no matter how
              many times a minute the check runs. But Laravel's scheduler only ever fires if something calls{' '}
              <code className="mono">php artisan schedule:run</code> once a minute, normally via one system cron line —
              and checking the VPS directly (root's crontab, the app user's crontab, <code className="mono">/etc/cron.d/</code>,{' '}
              <code className="mono">/var/spool/cron/crontabs/</code>) turned up no such entry anywhere. The job is correct
              and ready, but it has never actually executed in production (Finding 28).
            </p>
            <p>
              Recipes themselves (<code className="mono">AcnooRecipeController::store()</code>) write one{' '}
              <code className="mono">recipes</code> header plus one <code className="mono">recipe_ingredients</code> row
              per ingredient line, converting each to the ingredient's base unit the same way a purchase line does, and
              rolling the total back up into <code className="mono">recipes.cost_price</code>.
            </p>
            <FlowSummary
              files={['StockService.php', 'StockMovement.php (model hooks)', 'AcnooInventoryItemController.php', 'AcnooRecipeController.php', 'CheckLowStockIngredients.php (scheduled)']}
              tables={['stock_movements', 'ingredients', 'recipes', 'recipe_ingredients']}
            />
          </section>

          <section id="onlinestore">
            <div className="eyebrow">18 · Online Store</div>
            <h2>The customer-facing side — checkout is covered in §01; here's the rest</h2>
            <p>
              <code className="mono">AcnooCustomerBillingAddressController::store()</code> writes real{' '}
              <code className="mono">billing_addresses</code> rows from the storefront's saved-address form — the
              write path Finding 27 confirms is live, even at today's 0 rows. Content management for the public storefront
              (<code className="mono">AcnooBlogController</code>, <code className="mono">AcnooTestimonialController</code>,{' '}
              <code className="mono">AcnooCommentController</code>) writes ordinary <code className="mono">blogs</code>,{' '}
              <code className="mono">testimonials</code>, and <code className="mono">comments</code> rows — the same three
              tables §20's Front CMS section covers on the admin side, since both the admin and the storefront edit the
              same content.
            </p>
            <FlowSummary
              files={['AcnooCheckoutController.php (§01)', 'AcnooCustomerBillingAddressController.php', 'AcnooBlogController.php', 'AcnooTestimonialController.php', 'AcnooCommentController.php']}
              tables={['billing_addresses', 'blogs', 'testimonials', 'comments']}
            />
          </section>

          <section id="onboarding">
            <div className="eyebrow">19 · Onboarding &amp; Billing</div>
            <h2>A new tenant starts with an empty catalog</h2>
            <p className="lede">
              Traced from <code className="mono">RegisteredUserController::store()</code> and{' '}
              <code className="mono">PaymentController</code>. This corrects an assumption this doc used to carry: nothing
              in self-signup calls <code className="mono">clone_business_catalog</code> — a repo-wide grep across{' '}
              <code className="mono">app/</code>, <code className="mono">Modules/</code> and{' '}
              <code className="mono">routes/</code> turns up zero call sites. It's a script someone runs by hand, never
              application code.
            </p>
            <h3 style={{ marginTop: 26 }}>Self-signup</h3>
            <div className="steps">
              <div className="step" data-n="1">
                <h4>Create business &amp; user</h4>
                <p>
                  One <code className="mono">businesses</code> row (rejected if{' '}
                  <code className="mono">companyName</code> isn't unique), then one <code className="mono">users</code>{' '}
                  row (rejected if the email is already tied to a business).
                </p>
              </div>
              <div className="step" data-n="2">
                <h4>Attach a free plan, if one exists</h4>
                <p>
                  Looks up a <code className="mono">plans</code> row priced at ₹0. If found: a{' '}
                  <code className="mono">plan_subscribes</code> row is created carrying that plan's limits and{' '}
                  <code className="mono">available_modules</code> verbatim, and{' '}
                  <code className="mono">businesses.plan_subscribe_id</code> is backfilled to point at it. If no free plan
                  exists, the business is created with no subscription at all.
                </p>
              </div>
              <div className="step" data-n="3">
                <h4>Seed one currency, nothing else</h4>
                <p>
                  A single <code className="mono">user_currencies</code> row is copied from whichever{' '}
                  <code className="mono">currencies</code> row is marked default. No categories, products, taxes, payment
                  types, or units are seeded — the catalog starts genuinely empty.
                </p>
              </div>
            </div>
            <h3 style={{ marginTop: 30 }}>Upgrading a plan</h3>
            <p>
              <code className="mono">PaymentController::payment()</code> forks on the gateway type. A manual gateway
              (bank transfer, etc.) requires a proof-of-payment attachment and creates a{' '}
              <code className="mono">plan_subscribes</code> row with <code className="mono">payment_status: 'unpaid'</code>{' '}
              plus an admin notification — it sits pending until staff approve it. An online gateway redirects out with the
              plan stashed in session; the <code className="mono">success()</code> callback creates the{' '}
              <code className="mono">plan_subscribes</code> row with <code className="mono">payment_status: 'paid'</code>{' '}
              and updates <code className="mono">businesses.plan_subscribe_id</code>. Either way, a new{' '}
              <code className="mono">plan_subscribes</code> row is added rather than the old one being edited — which is
              exactly why that table has more rows than there are businesses (75 vs. 38 — history is kept, as the DB doc
              already noted).
            </p>
            <FlowSummary
              files={['RegisteredUserController.php', 'PaymentController.php']}
              tables={['businesses', 'users', 'plan_subscribes', 'user_currencies']}
            />
          </section>

          <section id="others">
            <div className="eyebrow">20 · Other App Areas</div>
            <h2>Everything no plan module can gate</h2>
            <p className="lede">
              These App Areas (§03/§04 of the DB doc) sit outside the 18 plan-gated modules entirely — nothing in{' '}
              <code className="mono">ModuleSubscriptionService::routeMap()</code> mentions any of them, confirmed by the
              same grep that built the DB doc's §05.
            </p>
            <div className="gapcard">
              <div className="g">
                <h4>Staff &amp; Roles</h4>
                <p>
                  <code className="mono">AcnooStaffController::store()</code> writes one <code className="mono">staff</code>{' '}
                  row. Its <code className="mono">destroy()</code> does something no FK does: it hard-deletes the linked{' '}
                  <code className="mono">users</code> row first (<code className="mono">User::where('staff_id', $id)-&gt;delete()</code>
                  ) — application code doing at the row level what the DB's <code className="mono">users.staff_id SET NULL</code>{' '}
                  rule deliberately doesn't. <code className="mono">UserRoleController::store()</code> creates a{' '}
                  <code className="mono">users</code> row with a role — inviting an admin/manager account, not defining a
                  new Spatie role.
                </p>
              </div>
              <div className="g">
                <h4>Coupon, Tables &amp; Areas</h4>
                <p>
                  <code className="mono">AcnooCouponController</code>, <code className="mono">AcnooTableController</code>,{' '}
                  and <code className="mono">AcnooAreaController</code> are each a single{' '}
                  <code className="mono">Model::create()</code> against <code className="mono">coupons</code>,{' '}
                  <code className="mono">tables</code>, and <code className="mono">areas</code>.
                </p>
              </div>
              <div className="g">
                <h4>Settings</h4>
                <p>
                  Not one table — a scatter of them. <code className="mono">SettingController</code> and{' '}
                  <code className="mono">AcnooSettingsManagerController</code> write to the generic{' '}
                  <code className="mono">options</code> key/value table (the same table §07 Reservations reads its
                  minimum-party-size from). <code className="mono">AcnooCurrencyController</code> writes{' '}
                  <code className="mono">user_currencies</code>. Delivery charge, discount, online-store schedule, and
                  loyalty-point configuration are each their own small controller, mostly also writing into{' '}
                  <code className="mono">options</code> under a distinct key.
                </p>
              </div>
              <div className="g">
                <h4>Messages, Newsletters, My Domains</h4>
                <p>
                  <code className="mono">AcnooMessageController</code> and <code className="mono">AcnooNewsLetterController</code>{' '}
                  only expose read/delete on the business side — both tables are written by the public-facing
                  contact-form and signup pages, outside the authenticated <code className="mono">business.*</code> route
                  group entirely. My Domains (CustomDomainAddon) writes one <code className="mono">domains</code> row per
                  custom-domain mapping.
                </p>
              </div>
              <div className="g">
                <h4>Store List, Category List, Front CMS (superadmin)</h4>
                <p>
                  Superadmin-only: <code className="mono">AcnooBusinessController</code> manages every tenant's{' '}
                  <code className="mono">businesses</code> row directly; a category controller manages{' '}
                  <code className="mono">business_categories</code>; Front CMS controllers manage the same{' '}
                  <code className="mono">blogs</code>/<code className="mono">testimonials</code>/<code className="mono">faqs</code>/
                  <code className="mono">features</code> tables §18's storefront-side controllers also touch.
                </p>
              </div>
            </div>
          </section>

          <section id="tenancy">
            <div className="eyebrow">21 · Tenancy at Runtime</div>
            <h2>Where the two application-layer scopes actually attach</h2>
            <p className="lede">
              The DB doc's Multi-Tenancy section names <code className="mono">BranchScope</code> and{' '}
              <code className="mono">DataManager</code> as Eloquent global scopes layered on top of the{' '}
              <code className="mono">business_id</code> column discipline. Here's exactly which models carry each,
              confirmed by grepping every file in <code className="mono">app/Models</code>.
            </p>
            <div className="gapcard">
              <div className="g">
                <h4>BranchScope — 15 models</h4>
                <p style={{ fontFamily: 'var(--mono)', fontSize: '.82rem' }}>{BRANCH_SCOPE_MODELS.join(' · ')}</p>
                <p>Attached in each model's <code className="mono">booted()</code>, e.g. <code className="mono">static::addGlobalScope(new BranchScope);</code> in <code className="mono">Product.php</code>. Filters to the active branch once MultiBranchAddon is enabled and the user has an <code className="mono">active_branch_id</code> — and only these 15 models get it, so anything outside this list (parties, categories, taxes, staff…) is never branch-filtered even where MultiBranchAddon is active.</p>
              </div>
              <div className="g">
                <h4>DataManager — 6 models</h4>
                <p style={{ fontFamily: 'var(--mono)', fontSize: '.82rem' }}>{DATA_MANAGER_MODELS.join(' · ')}</p>
                <p>A permission-driven ownership scope: <code className="mono">static::addGlobalScope(new DataManager('products.view-all-data'));</code> — restricts a query to rows the current user created unless they hold the named <code className="mono">view-all-data</code> permission or are <code className="mono">shop-owner</code>. Only these 6 transactional models get it.</p>
              </div>
            </div>
          </section>

          <section id="gating">
            <div className="eyebrow">22 · Plan Gating at Runtime</div>
            <h2>Two independent gates, already fully mapped</h2>
            <p className="lede">
              This one doesn't need re-investigating here — it's the DB Architecture doc's{' '}
              <a href="/db-architecture#planModules">§05 Plan Modules</a> section, built by tracing this exact runtime
              path: <code className="mono">moduleCheck()</code> (is the addon package installed at all, install-wide) is a
              completely separate gate from <code className="mono">plan_module_enabled()</code> (does this tenant's plan
              include the feature, per-tenant) — enforced together in the sidebar Blade views and in{' '}
              <code className="mono">CheckModuleAccess</code> middleware. That section has the full 18-module table, the
              route evidence, and the two live bugs it turned up (Findings 19–20). Nothing to add from the request-flow
              side beyond what's already there.
            </p>
          </section>

          <footer>
            AppzetBilling Application Flow · built by reading Controllers, Services and Observers on the VPS · 2026‑09‑14
          </footer>
        </main>
      </div>
    </>
  );
}
