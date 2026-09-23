# EventHub Event Management System

EventHub is a web-based event discovery and registration application. Visitors can browse events, view event details, register with their contact information, and pay event fees through Razorpay. Administrators can sign in to manage the event catalogue and view registrations.

The project is split into two applications:

- `frontend`: Vite-powered browser application and static admin pages.
- `backend`: Express API backed by MongoDB and Razorpay.

## Features

### Public experience

- Displays available events loaded from the backend.
- Shows event title, description, category, date, location, price, and image.
- Supports event registration with name, email, phone number, and event name.
- Creates Razorpay orders in INR and verifies Razorpay payment signatures.
- Includes event artwork in `frontend/public` and `frontend/src/assets`.

### Administration

- Provides a static admin login page at `/admin-login.html`.
- Allows administrators to add events.
- Allows administrators to edit existing events.
- Allows administrators to delete events.
- Lists registrations through the backend API.

## Technology Stack

| Area | Technology |
| --- | --- |
| Frontend | HTML, CSS, JavaScript, Vite |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |
| Payments | Razorpay |
| Browser utilities | QRCode package |
| Cross-origin requests | CORS |

## Project Structure

```text
EventManagement/
├── backend/
│   ├── models/
│   │   ├── Event.js
│   │   └── Registration.js
│   ├── .env                 # Local configuration; do not commit
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/              # Public images and icons
│   ├── src/
│   │   ├── assets/
│   │   ├── admin.js
│   │   ├── counter.js
│   │   ├── main.js
│   │   └── style.css
│   ├── admin-login.html
│   ├── admin.html
│   ├── index.html
│   └── package.json
├── .gitignore
└── README.md
```

## Requirements

- Node.js 18 or newer
- npm
- A MongoDB database, local or MongoDB Atlas
- Razorpay test or live API credentials for payments

## Installation

Install dependencies independently for each application:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Environment Configuration

Create `backend/.env` locally:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/EventManagement
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

The frontend currently uses the backend URL `http://localhost:5000` directly in its source. For local development, keep the backend on port `5000`, or update the `API_URL` constant in the frontend scripts when using another port.

Never commit `.env` files, MongoDB connection strings, or Razorpay secrets. The repository-wide `.gitignore` excludes them.

## Running Locally

Start the backend in one terminal:

```bash
cd backend
node server.js
```

The API starts after a successful MongoDB connection and listens on `http://localhost:5000` by default.

Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

Open the Vite URL shown in the terminal. The public application is served from `/`, and the administrator pages are available at:

- `/admin-login.html`
- `/admin.html`

To create a production frontend bundle:

```bash
cd frontend
npm run build
npm run preview
```

## API Reference

All API routes are currently served by the backend at `http://localhost:5000`.

### Events

#### `GET /api/events`

Returns all events.

#### `POST /api/events`

Creates an event. Required fields:

```json
{
  "title": "Tech Fest",
  "description": "A technology and innovation event.",
  "category": "Technology",
  "date": "2026-10-15",
  "location": "Main Auditorium",
  "price": 499,
  "image": "tech-fest.jpeg"
}
```

`image` is optional. The event model requires `title`, `description`, `category`, `date`, `location`, and `price`.

#### `PUT /api/events/:id`

Updates an event by its MongoDB document ID. Send the fields to update as JSON.

#### `DELETE /api/events/:id`

Deletes an event by its MongoDB document ID.

### Registrations

#### `POST /api/registrations`

Creates a registration. Required fields:

```json
{
  "name": "Sanjay Gowda",
  "email": "sanjay@example.com",
  "phone": "9876543210",
  "eventName": "Tech Fest"
}
```

Registration documents also receive `createdAt` and `updatedAt` timestamps.

#### `GET /api/registrations`

Returns all registrations.

### Payments

#### `POST /api/payment/create-order`

Accepts an amount in rupees:

```json
{
  "amount": 499
}
```

The backend converts the amount to paise, creates an INR Razorpay order, and returns the order data.

#### `POST /api/payment/verify`

Verifies a Razorpay payment signature. The request must contain:

```json
{
  "razorpay_order_id": "order_example",
  "razorpay_payment_id": "pay_example",
  "razorpay_signature": "signature_example"
}
```

## Data Models

### Event

- `title`: required string
- `description`: required string
- `category`: required string
- `date`: required date
- `location`: required string
- `price`: required number
- `image`: optional string, defaults to an empty string

### Registration

- `name`: required string
- `email`: required string
- `phone`: required string
- `eventName`: required string
- `createdAt`: automatic timestamp
- `updatedAt`: automatic timestamp

## Important Security Notes

This project is suitable for learning and local development, but it needs additional security work before production deployment:

- The admin username and password are currently hardcoded in `frontend/admin-login.html`.
- The login page redirects to the admin page but does not establish a server-side session or token.
- Event management and registration endpoints do not currently require authentication or authorization.
- `GET /api/registrations` exposes all registration records to any caller.
- Request validation, rate limiting, input sanitization, and centralized error handling should be added.
- Razorpay secrets must remain server-side and must be replaced if they are ever exposed.
- Configure CORS for trusted frontend origins instead of allowing all origins in production.
- Use HTTPS and production database access controls when deployed.

## Testing

The backend currently has no automated test suite. The frontend package provides build and preview scripts but no test script.

Before deploying, verify at least:

1. MongoDB connection and startup behavior.
2. Event create, update, list, and delete operations.
3. Registration validation and persistence.
4. Razorpay order creation and signature verification using test credentials.
5. Frontend behavior when the API is unavailable.

## Deployment Checklist

- Provision MongoDB and restrict database network access.
- Add production environment variables through the hosting provider's secret manager.
- Set the frontend API URL to the deployed backend URL.
- Configure CORS for the deployed frontend domain.
- Build the frontend with `npm run build`.
- Run the backend with a process manager or hosting platform service.
- Replace the demo admin login with authenticated server-side access.
- Use Razorpay live credentials only after payment flows are tested with test credentials.

## License

No project license has been specified yet.
