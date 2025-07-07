# GIA Dashboard - Warehouse Delivery Management System

A comprehensive Express.js application for managing warehouse deliveries and tracking product-level discrepancies with real-time reporting and CSV export capabilities.

## Table of Contents

* [Features](#features)
* [Getting Started](#getting-started)

  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
  * [Running the App](#running-the-app)
* [Project Structure](#project-structure)
* [Data Source](#data-source)
* [Routes](#routes)
* [Views](#views)
* [Public Assets](#public-assets)
* [Contributing](#contributing)
* [License](#license)

## Features

* **Dashboard Overview**: Real-time statistics and delivery tracking
* **Delivery Management**: Create, edit, and track delivery records
* **Discrepancy Reporting**: Detailed product-level discrepancy logging
* **Advanced Filtering**: Search and filter by multiple criteria (status, division, auditor)
* **CSV Export**: Generate and download reports for deliveries and discrepancies
* **File Uploads**: Attach images to discrepancy records
* **Responsive Design**: Optimized for desktop, tablet, and mobile
* **RESTful API**: Endpoints for integration with other systems

## Getting Started

### Prerequisites

* **Node.js** v14 or later
* **npm** (bundled with Node.js)

### Installation

1. Clone the repository:

   ```bash
   git clone <repo-url> GIA_Dashboard
   cd GIA_Dashboard
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. (Optional) Initialize Git and make your first commit:

   ```bash
   git init .
   git add .
   git commit -m "Initial commit"
   ```

### Running the App

Start the server:

```bash
npm start
```

By default, the app listens on port 3000. Open `http://localhost:3000` in your browser.

## Project Structure

```plaintext
GIA_Dashboard/
├── app.js              # Express app and middleware setup
├── bin/
│   └── www             # Server startup script
├── data/
│   └── deliveries.js   # Mock delivery data (used in development)
├── public/             # Static assets
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── main.js
│   │   └── images.js
│   ├── images/         # Sample/static images
│   └── uploads/        # Directory for user-uploaded files (.gitkeep)
├── routes/             # Route definitions
│   ├── index.js        # Home and dashboard routes
│   ├── deliveries.js   # Delivery-related pages and API
│   ├── discrepancies.js# Discrepancy reporting pages
│   ├── api.js          # RESTful JSON API for deliveries/discrepancies
│   └── users.js        # (Optional) User management
├── views/              # Handlebars templates
│   ├── layout.hbs      # Main layout
│   ├── index.hbs       # Home/dashboard view
│   ├── dashboard.hbs   # Dashboard overview
│   ├── delivery-details.hbs
│   ├── delivery-form.hbs
│   ├── error.hbs
│   └── 404.hbs
├── package.json        # Project metadata and scripts
├── package-lock.json   # Locked dependency versions
└── README.md           # Project documentation
```

## Data Source

* `data/deliveries.js` exports an array of delivery objects mocked with UUIDs (via the `uuid` package).

## Routes

Key HTTP endpoints:

* `GET /` – Home/dashboard overview (HTML)
* `GET /deliveries` – List deliveries (HTML)
* `GET /deliveries/:id` – Delivery details page (HTML)
* `POST /deliveries` – Create a new delivery
* `PUT /deliveries/:id` – Update an existing delivery
* `DELETE /deliveries/:id` – Remove a delivery
* `GET /api/deliveries` – JSON API: list and filter deliveries
* `GET /api/deliveries/:giaNumber` – JSON API: single delivery record
* `GET /api/discrepancies` – JSON API: list discrepancies

*For a complete list, see the files under `routes/`.*

## Views

Handlebars templates are located in the `views/` folder, using `.hbs` extensions. The primary layout is defined in `layout.hbs`.

## Public Assets

Static files are served from `public/`. Key subdirectories:

* `css/` – Stylesheets (e.g., `style.css`)
* `js/` – Client-side scripts (e.g., `main.js`, `images.js`)
* `images/` – Sample images
* `uploads/` – Storage for user-uploaded content (`.gitkeep` ensures the folder is tracked)

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request. Please ensure code is linted and tests (if any) pass before submitting.

## License

This project is licensed under the ISC License.
