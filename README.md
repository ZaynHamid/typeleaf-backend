# Typeleaf 

A RESTful API built with **Node.js** and **Express** for a blogging/social platform. Supports user authentication, posts, comments, likes, and saved posts.

---

## Features

- User signup and login with JWT authentication
- Create, read, update, and delete posts
- Nested comment threads
- Like/unlike posts
- Save and unsave posts
- Rate limiting, security headers, and request logging


---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Security:** Helmet, express-rate-limit, CORS
- **Logging:** Custom logger

---

## Getting Started

### Prerequisites

- Node.js v18+
- A running MongoDB instance (or your configured database)

### Installation

```bash
git clone <repo-url>
cd <project-folder>
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
CLIENT_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret
MONGO_URI=your_mongodb_connection_string
```

### Running the Server

```bash
# Development
npm run dev

# Production
npm start
```

The server listens on `0.0.0.0:PORT` (default: `5000`).

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/signup` | No | Register a new user |
| POST | `/login` | No | Login and receive a token |
| GET | `/me` | Yes | Get the current authenticated user |

#### POST `/signup`
```json
{ "username": "john", "email": "john@example.com", "password": "secret" }
```

#### POST `/login`
```json
{ "email": "john@example.com", "password": "secret" }
```

---

### Posts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/create-post` | Yes | Create a new post |
| GET | `/post` | No | Fetch posts (filter by id, author, or title) |
| PUT | `/post` | Yes | Update a post |
| DELETE | `/post/:id` | Yes | Delete a post |

#### POST `/create-post`
```json
{ "title": "My Post", "body": "Post content...", "tags": ["tag1", "tag2"] }
```

#### GET `/post` — Query Parameters
| Param | Type | Description |
|-------|------|-------------|
| `id` | string | Filter by post ID |
| `author` | string | Filter by author ID |
| `title` | string | Search by title (case-insensitive regex) |

#### PUT `/post`
```json
{ "postId": "abc123", "updates": { "title": "New Title", "body": "New body" } }
```

---

### Comments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/comment` | Yes | Add a comment (supports nested replies) |
| GET | `/comment/:id` | No | Get all comments for a post |

#### POST `/comment`
```json
{ "postId": "abc123", "comment": "Great post!", "parentId": "optionalParentId" }
```

---

### Likes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/like` | Yes | Toggle like on a post |
| GET | `/likes/:postId` | No | Get like count for a post |

---

### Saved Posts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/save` | Yes | Save a post |
| GET | `/save` | Yes | Get all saved posts for the current user |
| DELETE | `/unsave/:postId` | Yes | Remove a post from saved |

---

## Authentication

Protected routes require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <your_token>
```

---

## Rate Limiting

Requests are limited to **100 per 15 minutes** per IP.

---

## Error Handling

All errors return a consistent JSON structure:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```
