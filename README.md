
# DecisionTrack — Decision Tracking and Management System

DecisionTrack is a backend REST API for creating, tracking, updating, and managing decisions. It supports decision alternatives, priorities, statuses, search, filtering, pagination, and decision history.

## Features

- Create, view, update, and delete decisions
- Store decision data in MongoDB
- Record decision history for creation and updates
- Maintain alternatives with pros and cons
- Search decisions by title, description, and problem
- Filter decisions by status and priority
- Paginate decision results
- Validate incoming data and return JSON errors

## Technology Stack

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- dotenv
- cors

## Project Structure

```text
decisiontrack/
├── config/
│   └── db.js
├── controllers/
│   └── decisionController.js
├── middleware/
│   └── errorMiddleware.js
├── models/
│   └── Decision.js
├── routes/
│   └── decisionRoutes.js
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js
```

## Requirements

- Node.js and npm
- A MongoDB database, such as MongoDB Atlas
- Postman or another API client for testing

## Installation

Clone or download this project, then open a terminal in the project folder.

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root with your own database connection details:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

Replace the example value with your actual MongoDB connection string. Do not upload `.env` to GitHub.

## Run the Backend

Start the development server:

```bash
npm run dev
```

Start the server normally:

```bash
npm start
```

The default local API address is:

`http://localhost:5000`

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Check server status |
| POST | `/api/decisions` | Create a decision |
| GET | `/api/decisions` | Retrieve decisions |
| GET | `/api/decisions/:id` | Retrieve one decision |
| PUT | `/api/decisions/:id` | Update a decision |
| DELETE | `/api/decisions/:id` | Delete a decision |
| GET | `/api/decisions/:id/history` | Retrieve decision history |

## Search, Filtering, and Pagination

Search decisions:

`GET /api/decisions?search=library`

Filter by status:

`GET /api/decisions?status=pending`

Filter by priority:

`GET /api/decisions?priority=high`

Combine filters:

`GET /api/decisions?status=pending&priority=high`

Paginate results:

`GET /api/decisions?page=1&limit=5`

Search and paginate:

`GET /api/decisions?search=library&page=1&limit=5`

Supported statuses:

- draft
- pending
- approved
- rejected
- in-progress
- completed
- cancelled

Supported priorities:

- low
- medium
- high
- urgent

## Example Request

Create a decision using `POST /api/decisions` with a JSON body:

```json
{
  "title": "College Event Planning",
  "description": "Choose a format for the annual college event.",
  "priority": "high",
  "status": "pending",
  "responsiblePerson": "Project Team"
}
```

A successful request returns HTTP status `201 Created` and the saved decision.

## Error Handling

The API returns JSON error responses for invalid request data, invalid decision IDs, missing records, malformed JSON, and server errors.

Common status codes:

- `200 OK` — request completed successfully
- `201 Created` — decision created
- `400 Bad Request` — invalid input
- `404 Not Found` — record or endpoint not found
- `500 Internal Server Error` — unexpected server error

## Testing

Use Postman to test the API endpoints. Verify CRUD operations, decision history, validation, search, filters, pagination, and error responses.

## Security Notes

- Keep database credentials in `.env`.
- Never commit `.env` or database passwords to GitHub.
- Configure appropriate CORS restrictions before production deployment.
- Use environment variables for production configuration.

## License

Add a license if you choose to distribute this project publicly.
```
