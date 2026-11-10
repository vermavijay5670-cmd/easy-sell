# Online Grocery Store (React + Vite + Supabase)

A mobile-friendly online shop for a local grocery / kirana store. Customers browse products, sign up, order with cash on delivery and track their orders. The shopkeeper manages everything from an admin panel.

**Customer side:** product browsing and search, cart, login/signup, forgot password, checkout (login required), live order tracking, cancel a pending order, "Order again", and a downloadable PDF order slip once the shop confirms the order.

**Admin side (`/admin`):** dashboard, orders (search, filters, status updates, WhatsApp message button, printable slip), products (add, edit, remove, photo from camera or device, stock), and shop settings (shop name, banner text, categories, contact details, social links, reviews).

**Behind the scenes:** prices and stock are enforced by the database (customers cannot change prices), stock goes down when an order is placed, and the shopkeeper gets a Telegram alert for each new order.

**Built with:** React 19, Vite, Tailwind CSS 3, React Router, Supabase (database, login, file storage, Edge Functions). Hosting: Vercel.

---

## Contents

1. [Prepare a new computer](#1-prepare-a-new-computer)
2. [Get the code](#2-get-the-code)
3. [Create the Supabase project](#3-create-the-supabase-project)
4. [Connect the website to Supabase (.env)](#4-connect-the-website-to-supabase-env)
5. [Set up the database](#5-set-up-the-database)
6. [Login settings in Supabase](#6-login-settings-in-supabase)
7. [Create the admin account](#7-create-the-admin-account)
8. [Run the website on your computer](#8-run-the-website-on-your-computer)
9. [Telegram order alerts (optional)](#9-telegram-order-alerts-optional)
10. [Put the website online (Vercel)](#10-put-the-website-online-vercel)
11. [Handover checklist for the client](#11-handover-checklist-for-the-client)
12. [Everyday commands](#12-everyday-commands)
13. [Troubleshooting](#13-troubleshooting)
14. [Security rules](#14-security-rules)
15. [Project structure](#15-project-structure)

---

## 1. Prepare a new computer

Install these once (Windows steps; macOS/Linux are the same apart from the installers):

1. **Node.js** (LTS version, 20.19 or newer, or 22.12 or newer): https://nodejs.org
2. **Git:** https://git-scm.com/downloads
3. **VS Code** (optional but recommended): https://code.visualstudio.com

Check they work. Open **Command Prompt** (Windows key, type `cmd`) and run:

```
node -v
npm -v
git --version
```

Each should print a version number. If `node -v` shows a version older than 20.19, install a newer one.

---

## 2. Get the code

Pick a folder, for example `E:\projects`, then:

```
cd /d E:\projects
git clone https://github.com/vermavijay5670-cmd/easy-sell.git easy-sell
cd easy-sell
npm install
```

`npm install` downloads all the packages into a `node_modules` folder. It takes a minute or two.

> If you received the project as a **zip file** instead, extract it, open a Command Prompt inside the extracted folder, and run only `npm install`.

---

## 3. Create the Supabase project

Supabase is the online database and login system. It's free to start.

1. Go to https://supabase.com and sign up.
2. Click **New project**. Choose a name, a **database password** (save it somewhere safe), and the region closest to your customers (for India, **Mumbai** if available, otherwise **Singapore**).
3. Wait a couple of minutes until the project finishes setting up.
4. Copy two values (menu names can differ slightly between Supabase versions):
   - **Project URL.** It looks like `https://abcdxyz.supabase.co`. It is shown under **Project Settings → Data API**, or behind the **Connect** button at the top.
   - **Publishable key.** It starts with `sb_publishable_`. It is under **Project Settings → API Keys**. (Older projects call it the "anon public" key. That works too.)

> Use only the **publishable / anon** key. Never use the key named **secret** or **service_role** anywhere in this website.

---

## 4. Connect the website to Supabase (.env)

In the project folder, copy the example file:

```
copy .env.example .env
```

Open `.env` in VS Code and fill in the two values, with no quotes and no spaces:

```
VITE_SUPABASE_URL=https://abcdxyz.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxxxxxxxxx
```

- The names must be spelled exactly as shown. A single wrong letter makes the website ignore the value and show "Supabase not configured".
- The `.env` file is private and is already excluded from Git. **Never upload it to GitHub.**
- If the website is already running, stop it and start it again after editing `.env`.

---

## 5. Set up the database

All the database files are in the project folder. For **each file below, in this order**:

1. Open the file in VS Code and copy everything (Ctrl+A, Ctrl+C).
2. In Supabase, open **SQL Editor → New query**.
3. Paste, then click **Run**. You should see "Success".

| # | File | What it does |
|---|------|--------------|
| 1 | `supabase-schema.sql` | Creates the products and orders tables and adds 24 sample products. Orders stay locked until file 2. |
| 2 | `supabase-migration-customer-auth.sql` | Customer accounts, order history, the admin list, access rules |
| 3 | `supabase-migration-order-safety.sql` | Server-side prices, stock reduction, limit of 5 pending orders |
| 4 | `supabase-migration-products.sql` | Admin can delete products, photo storage for product pictures |
| 5 | `supabase-migration-settings.sql` | Shop name, banner, categories, contact details, reviews |
| 6 | `supabase-migration-admin-orders.sql` | Fast dashboard numbers and order list |
| 7 | `supabase-migration-customer-cancel.sql` | Lets customers cancel their own pending orders |
| 8 | `supabase-migration-grants.sql` | **Required on new Supabase projects.** Lets the website reach the tables (see the note below) |
| 9 | `supabase-migration-hardening.sql` | Abuse limits (per phone / per hour), field size limits, throttled order tracking, hides inactive products |
| 10 | `supabase-migration-telegram.sql` | Telegram alerts. **Do this one later, in step 9 below.** |

Notes:
- **Do not skip file 8.** Newer Supabase projects do not give tables created in the SQL Editor to the website automatically. Without it, every request fails with "permission denied": admin login says "does not have admin access" and orders say "Could not place your order", even though the data looks correct in Supabase.
- Every file is safe to run again. Running one twice never deletes data.
- If a file says something "already exists", that's fine.
- Run them in the order shown. File 9 stops with a clear message if files 2 or 3 haven't been run.
- After you update the project in the future, re-run the files that changed (see [Updating the website later](#updating-the-website-later)).

**Check that it worked.** After file 9, run this in the SQL Editor. Every column must say `true`:

```sql
select
  has_table_privilege('authenticated', 'public.orders', 'INSERT')  as orders_insert,
  has_table_privilege('authenticated', 'public.admins', 'SELECT')  as admins_read,
  has_table_privilege('anon', 'public.products', 'SELECT')         as products_read,
  to_regprocedure('public.is_admin()') is not null                 as is_admin_function,
  to_regclass('public.track_attempts') is not null                 as hardening_applied;
```

If `orders_insert`, `admins_read` or `products_read` is `false`, run file 8 again. If `is_admin_function` is `false`, run file 2. If `hardening_applied` is `false`, run file 9.

The 24 sample products are vegetables and spices with stock photos. The client should replace them with their real products from the admin panel.

---

## 6. Login settings in Supabase

In Supabase go to **Authentication**:

1. **Sign In / Providers → Email:** make sure Email is turned on.
   - **Confirm email:** if this is on, new customers must click a link in an email before they can log in. This is the best protection against fake accounts filling up your orders and using up your stock. Supabase's built-in email service only sends a few emails per hour, so for a real shop **turn it on and connect your own email service** (Authentication → Emails → SMTP Settings). While you are only testing, you can leave it off, but turn it on before the shop goes public. If it stays off, the per-phone and per-hour order limits from file 9 are the only protection against abuse.
2. **URL Configuration:**
   - **Site URL:** `http://localhost:5173` for now (change it to your real website address in step 10).
   - **Redirect URLs:** add `http://localhost:5173/**`

The password-reset link emailed to customers only works for addresses listed here.

---

## 7. Create the admin account

The admin panel is only for people listed in the `admins` table. Customers can never open it.

1. In Supabase: **Authentication → Users → Add user → Create new user**.
2. Enter the admin's email and a strong password. Tick **Auto Confirm User**. Click **Create user**.
3. Go to **SQL Editor → New query**, paste this with the same email, and click **Run**:

```sql
INSERT INTO admins (user_id)
SELECT id FROM auth.users WHERE email = 'admin@example.com';
```

It should say "1 row affected". If it says 0, the email doesn't match the user you created.

To add another admin later, repeat the two steps with their email.

---

## 8. Run the website on your computer

```
npm run dev
```

Open http://localhost:5173 in your browser.

**First-time check (about 10 minutes):**

1. Open http://localhost:5173/admin and log in with the admin account. You should reach the dashboard.
2. **Shop Settings:** set the shop name, the banner text, the categories, and your phone, address and email. These are empty until you fill them in, and empty details are hidden on the site.
3. **Manage Products:** replace the sample products with real ones. Use **Add Product**, and **Take Photo** or **Upload from Device** for the picture. Products still using a sample photo show an orange "stock photo" tag.
4. Open the shop in a private window, sign up as a customer, add products to the cart and place a test order. If this says "Could not place your order", run the check query from step 5 and press F12 → Console for the exact error.
5. In admin **Orders**, open the test order and change its status. The customer's My Orders page updates.

---

## 9. Telegram order alerts (optional)

The shopkeeper gets a Telegram message for every new order and for customer cancellations. The bot token is stored safely inside Supabase and is never in the website code.

**A. Create the bot**
1. In Telegram, open **@BotFather** and send `/newbot`. Follow the steps. It gives you a **token** like `123456789:AAH...`.
2. Open your new bot and press **Start** (or send it any message).
3. Find your chat ID. Open this address in a browser with your token filled in:
   `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
   Look for `"chat":{"id":` and note the number after it (a group's ID starts with a minus sign).

**B. Deploy the function**
1. In Supabase: **Edge Functions → Deploy a new function → Via Editor**. Name it exactly `notify-order`.
2. Delete the sample code in `index.ts`, paste in the contents of `supabase/functions/notify-order/index.ts` from this project, and click **Deploy**.
3. Open the function's **Details** and turn **off** "Enforce JWT Verification". (The database calls it using a secret header instead.)

**C. Add the secrets**
In **Edge Functions → Secrets**, add three:

| Name | Value |
|------|-------|
| `TELEGRAM_BOT_TOKEN` | the full token from BotFather |
| `TELEGRAM_CHAT_ID` | your chat ID number |
| `WEBHOOK_SECRET` | any long random text you make up (letters and numbers only) |

To make a random secret on Windows, open PowerShell and run:
`[guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N")`

Supabase hides secret values after saving, so keep a copy in your notes.

**D. Connect the database**
1. Open `supabase-migration-telegram.sql` and replace the two placeholders **once each** (they appear in the INSERT near the top):
   - `YOUR_PROJECT_REF` becomes the part before `.supabase.co` in your Project URL.
   - `YOUR_WEBHOOK_SECRET` becomes the **same** value you used for `WEBHOOK_SECRET`.
2. Run the file in the SQL Editor.

**E. Test it**
Place a test order. A Telegram message should arrive within seconds. If not, open **Edge Functions → notify-order → Logs**:
- `401` means the secret in the SQL doesn't match the `WEBHOOK_SECRET` secret.
- `404` from Telegram means the bot token is wrong.
- `400 chat not found` means the chat ID is wrong, or you haven't pressed Start on the bot.

---

## 10. Put the website online (Vercel)

1. **Put the code on GitHub.** Create a GitHub account and a new repository, then in the project folder:
   ```
   git add -A
   git status
   ```
   Check that the list does **not** include `.env` or `node_modules`. Then:
   ```
   git commit -m "first version"
   git push
   ```
2. Go to https://vercel.com, sign in with GitHub, click **Add New → Project**, and import the repository. Vercel detects Vite automatically.
3. Before deploying, open **Environment Variables** and add these two. Choose type **Config** (not Secret), because the values are public by design:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

   Leave **Production** ticked, and tick **Preview** too if you want. Vercel shows a warning about the `VITE_` prefix. That's expected and safe for these two values.
4. Click **Deploy**. You get an address like `https://your-shop.vercel.app`.
5. **Update Supabase** (Authentication → URL Configuration):
   - **Site URL:** your real address, e.g. `https://your-shop.vercel.app`
   - **Redirect URLs:** add `https://your-shop.vercel.app/**`
6. If you changed or added environment variables after the first deploy, go to **Deployments → ⋯ → Redeploy**. Variables only take effect on a new deployment.

The included `vercel.json` makes direct links like `/admin` and `/my-orders` work after a page refresh.

---

## 11. Handover checklist for the client

- [ ] Create the **client's own admin login** (step 7) and test it in a private window. Remove your own admin access when you're done supporting the shop:
  ```sql
  DELETE FROM admins WHERE user_id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
  ```
  (Only after you've confirmed the client's login works. If no admin remains, nobody can open the panel.)
- [ ] Shop Settings filled in: name, banner, categories, phone, address, email, social links.
- [ ] Sample products replaced with real products and the client's own photos.
- [ ] Real customer reviews added (or left empty, which hides the section).
- [ ] Telegram alerts tested with a real order.
- [ ] A full test order placed, confirmed, cancelled and delivered.
- [ ] Supabase on a **paid plan** (free projects pause after about a week without activity).
- [ ] Client knows: status updates, WhatsApp message button, Print Slip, and how to change stock.
- [ ] Ask the client about: delivery charges and areas, their FSSAI licence number, and Terms / Privacy / Refund pages. These aren't built yet.

### Updating the website later

```
git pull
npm install
npm test
```

Then re-run in the Supabase SQL Editor any `supabase-migration-*.sql` file that changed (they're all safe to re-run), paste the updated `supabase/functions/notify-order/index.ts` into the Edge Function and redeploy it if that file changed, and push to GitHub. Vercel redeploys automatically.

---

## 12. Everyday commands

| Command | What it does |
|---------|--------------|
| `npm run dev` | Starts the website on your computer at http://localhost:5173 |
| `npm run build` | Builds the production version (checks for errors) |
| `npm run preview` | Previews the production build |
| `npm test` | Runs the automatic tests (cart, settings, products) |
| `npm run lint` | Checks the code for common mistakes |

An extra database-level test for developers is described in `tests/README.md`.

---

## 13. Troubleshooting

| Problem | Fix |
|---------|-----|
| "Supabase not configured yet" when signing up or logging in | The URL or key is missing. Check `.env` (names spelled exactly, no quotes) and restart `npm run dev`. On Vercel, add the two variables and **Redeploy**. |
| `'vitest' is not recognized` | Run `npm install` in the project folder. |
| `npm install` or `npm run dev` errors about Node | Install Node 20.19+ or 22.12+ and try again. |
| Admin login says "does not have admin access" | Two possible causes. (1) The account isn't in the `admins` table: do step 7 (the INSERT) with the exact email. (2) The `admins` row is there but the website can't read it: run `supabase-migration-grants.sql` (step 5, file 8). |
| "Could not place your order" with no other message | Usually missing table permissions: run `supabase-migration-grants.sql`, then run the check query in step 5. If it still fails, press F12 → Console and read the `Order save failed:` line. |
| "Shop is not set up yet" on the live site | The two `VITE_` variables are missing on Vercel. Add them and **Redeploy** (step 10). |
| Page shows 404 after refreshing on Vercel | Make sure `vercel.json` is in the project root and redeploy. |
| Customer signup works but no email arrives, or "email rate limit" | Turn off **Confirm email** (step 6) or connect your own email service in Supabase. |
| Password-reset link doesn't work | Add the site address to **Redirect URLs** (step 6 / step 10). |
| Photo upload fails | Run `supabase-migration-products.sql` (it creates the storage bucket). You must be logged in as admin. |
| Shop Settings page says "Couldn't load the current settings" | Run `supabase-migration-settings.sql`, then refresh. |
| Dashboard numbers stop at 1000 orders | Run `supabase-migration-admin-orders.sql`. |
| "Not enough stock" or a product disappears from the cart | Expected. The cart syncs with live stock and prices. |
| "You already have 5 orders waiting" / "This phone number already has 5 orders waiting" | At most 5 pending orders per customer and per phone number. They can cancel one or wait for confirmation. |
| "You have placed many orders in the last hour" | Limit of 10 orders per customer per hour. They can try again later or call the shop. |
| Order tracking says "Too many attempts" | 15 look-ups per phone number per 10 minutes. Wait a few minutes. |
| No Telegram message | See step 9E for what each log error means. |
| Changes to `.env` don't apply | Stop `npm run dev` (Ctrl+C) and start it again. On Vercel, redeploy. |

---

## 14. Security rules

- **Never** commit `.env` or share it. It is in `.gitignore`.
- Only use the **publishable (anon)** key in the website. Never put a `secret` or `service_role` key in any `VITE_` variable, because those values are visible to everyone who opens the site.
- The Telegram token and webhook secret live only in Supabase Edge Function secrets.
- Prices, totals and stock are decided by the database, not the browser.
- Order limits (per customer, per phone number, per hour) and field size limits are enforced by the database (file 9). Turn on **Confirm email** (step 6) before going public.
- The `app_secrets` table (Telegram webhook secret) is deliberately not granted to the website. Don't add grants for it.
- Only users listed in the `admins` table can use the admin panel.
- Use a strong password for the admin account. Anyone with it can see all customer details.

---

## 15. Project structure

```
src/
  pages/            Customer pages (Home, Products, Cart, Checkout, My Orders, ...)
  pages/Admin/      Admin pages (Dashboard, Orders, Products, Settings, Login)
  components/       Navbar, Footer, product cards, cart sidebar, ...
  context/          Shared state: cart, products, settings, customer and admin login
  lib/              Supabase connection, image resizing
  __tests__/        Automatic tests
supabase/functions/notify-order/   Telegram alert function
supabase-schema.sql                First database file
supabase-migration-*.sql           Database updates, run in the order in step 5 (grants and hardening are part of the set)
tests/                             Optional database-level tests
vercel.json, public/_redirects     Make direct links work on hosting
```
