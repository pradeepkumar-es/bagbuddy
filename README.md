# BagBuddy

BagBuddy is a Node.js + Express ecommerce application for selling bags and accessories. The app includes a storefront, shopping cart, user authentication, order history, profile management, product creation for owners, and Stripe-based checkout.

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- EJS templates
- bcrypt for password hashing
- JWT-based auth cookies
- express-session with MongoDB session storage
- Stripe for payment checkout
- Multer for image uploads
- connect-flash for temporary success/error messages

## Current Project Structure

- `app.js` — app bootstrap and middleware setup
- `routes/` — route modules for home, users, owners, products, and payments
- `controllers/` — auth logic for registration/login/logout/profile updates
- `models/` — Mongoose schemas for users, products, orders, and owners
- `config/` — Mongo connection and upload configuration
- `middlewares/` — login guard middleware
- `views/` — EJS pages for storefront, cart, orders, admin, and account pages
- `public/` — static CSS/JS/images served by Express
- `utils/` — token generation helper

## Features

### Customer Features
- Browse products on the storefront
- Filter products by discounted items
- Add products to cart
- Increase/decrease product quantity
- View cart summary with totals and discount calculation
- Checkout with Stripe using `/payment-checkout`
- Redirect to success/cancel pages after payment
- View past orders from `/users/orders`
- Update profile information and upload a profile image
- Change password
- Log in / log out

### Owner/Admin Features
- Admin product creation page at `/owners/admin`
- Create products with image, name, price, discount, and color options
- Owner account creation route exists in development mode only

## Environment Variables

Create a `.env` file in the project root with values like:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/bagbuddy
JWT_KEY=your_jwt_secret_key
EXPRESS_SESSION_SECRET=your_session_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
NODE_ENV=development
```

Notes:
- The app expects `MONGODB_URI` and `JWT_KEY` from environment variables.
- `config/development.json` currently contains a legacy Mongo URI, but the active app uses `process.env.MONGODB_URI` in the database connection logic.
- `NODE_ENV=development` enables the owner account creation route at `/owners/create`.

## Installation

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Create your `.env` file.
4. Start the server:

```bash
npm start
```

The app starts on the configured `PORT` or default `3000`.

## Main Routes

### Public / Storefront
- `GET /` — home/shop page
- `GET /discounted-products` — discounted items page
- `GET /users/login` — login page
- `GET /cart` — cart page (requires login)

### User Auth
- `POST /users/register` — register new user
- `POST /users/login` — login
- `GET /users/logout` — logout
- `GET /users/account` — account page (requires login)
- `POST /users/update-profile` — update profile (requires login)
- `POST /users/update-password` — update password
- `GET /users/orders` — order history page (requires login)

### Cart / Purchase
- `GET /addtocart/:productid` — add item to cart
- `GET /buy/:productid` — add item to cart and go to cart
- `GET /addquantity/:productid` — increase quantity
- `GET /minusquantity/:productid` — decrease quantity/remove item
- `POST /payment-checkout` — Stripe checkout (requires login)
- `GET /success` — successful order completion
- `GET /cancel` — cancelled payment

### Owner/Admin
- `GET /owners/admin` — create product page
- `POST /owners/create` — create product (development only)

## Database Models

### User
- `fullName`
- `email`
- `password` (hashed)
- `cart` with product references and quantity
- `contact`
- `picture` (stored as Buffer)

### Product
- `image` (Buffer)
- `name`
- `price`
- `quantity`
- `discount`
- `bgcolor`
- `panelcolor`
- `textcolor`

### Order
- `user`
- `orders` (array of product references + quantity)
- `totalAmount`
- `createdAt`

### Owner
- `fullName`
- `email`
- `password`
- `products`
- `picture`
- `gstin`

## Notes and Assumptions

- Product and profile images are stored in MongoDB as binary buffers with `multer`.
- Session cookies are configured with `express-session` and stored in MongoDB via `connect-mongo`.
- Flash messages are used to show login/account/cart/payment status messages.
- Stripe is integrated for checkout using the `STRIPE_SECRET_KEY` environment variable.
- The app is built around a local development workflow and is not yet documented as a production-ready deployment setup.

## License

This project currently uses the ISC license in `package.json`.
