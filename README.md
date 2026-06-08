# Social Feed App — Backend API Reference

## Auth Module

### 1. Register a New User
* **URL**: `/auth/register`
* **Method**: `POST`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "Password123!"
}
```
* **Response (Success - `201 Created`)**:
```json
{
  "success": true,
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "createdAt": "2026-06-08T16:50:11.000Z",
    "updatedAt": "2026-06-08T16:50:11.000Z",
    "_id": "647f525f381f8f3c7b6ad5e1"
  }
}
```

---

### 2. Login User
* **URL**: `/auth/login`
* **Method**: `POST`
* **Headers**: `Content-Type: application/json`
* **Cookies Set**: `access_token` (HTTP-Only, SameSite=Strict, Expires in 1 Day)
* **Request Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "Password123!"
}
```
* **Response (Success - `201 Created`)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "647f525f381f8f3c7b6ad5e1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "createdAt": "2026-06-08T16:50:11.000Z",
      "updatedAt": "2026-06-08T16:50:11.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Logout User
* **URL**: `/auth/logout`
* **Method**: `POST`
* **Cookies Cleared**: `access_token`
* **Response (Success - `201 Created`)**:
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

##  Users Module

### 1. Get Logged-In User Profile
* **URL**: `/users/me`
* **Method**: `GET`
* **Headers**: `Cookie: access_token=...` or `Authorization: Bearer ...`
* **Response (Success - `200 OK`)**:
```json
{
  "success": true,
  "data": {
    "_id": "647f525f381f8f3c7b6ad5e1",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "createdAt": "2026-06-08T16:50:11.000Z",
    "updatedAt": "2026-06-08T16:50:11.000Z"
  }
}
```

---

## Comments Module

### 1. Create a Comment or Reply
* **URL**: `/posts/:postId/comments`
* **Method**: `POST`
* **Headers**: `Cookie: access_token=...` or `Authorization: Bearer ...`
* **Request Body**:
```json
{
  "content": "This is an amazing reply!",
  "parentComment": "647f525f381f8f3c7b6ad5e2" // Optional (for nested replies)
}
```
* **Response (Success - `201 Created`)**:
```json
{
  "success": true,
  "data": {
    "content": "This is an amazing reply!",
    "author": {
      "_id": "647f525f381f8f3c7b6ad5e1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    },
    "post": "647f525f381f8f3c7b6ad5ea",
    "parentComment": "647f525f381f8f3c7b6ad5e2",
    "likedBy": [],
    "_id": "647f525f381f8f3c7b6ad5eb",
    "createdAt": "2026-06-08T16:55:00.000Z",
    "updatedAt": "2026-06-08T16:55:00.000Z"
  }
}
```

---

### 2. Get Comments for a Post (Paginated)
* **URL**: `/posts/:postId/comments`
* **Method**: `GET`
* **Query Parameters**:
  - `limit`: Number of top-level comments to return (default: `10`)
  - `cursor`: Last top-level comment ID for pagination (default: none)
* **Response (Success - `200 OK`)**:
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "_id": "647f525f381f8f3c7b6ad5e2",
        "content": "Awesome! Glad to join.",
        "author": {
          "_id": "647f525f381f8f3c7b6ad5e3",
          "firstName": "Jane",
          "lastName": "Smith",
          "email": "jane.smith@example.com"
        },
        "post": "647f525f381f8f3c7b6ad5ea",
        "parentComment": null,
        "likedBy": [],
        "replies": [
          {
            "_id": "647f525f381f8f3c7b6ad5eb",
            "content": "Thanks Jane! Great to have you.",
            "author": {
              "_id": "647f525f381f8f3c7b6ad5e1",
              "firstName": "John",
              "lastName": "Doe"
            },
            "post": "647f525f381f8f3c7b6ad5ea",
            "parentComment": "647f525f381f8f3c7b6ad5e2"
          }
        ]
      }
    ],
    "nextCursor": "647f525f381f8f3c7b6ad5e2"
  }
}
```

---

### 3. Delete a Comment
* **URL**: `/comments/:id`
* **Method**: `DELETE`
* **Headers**: `Cookie: access_token=...` or `Authorization: Bearer ...`
* **Response (Success - `200 OK`)**:
```json
{
  "success": true,
  "data": {
    "success": true
  }
}
```

---

### 4. Toggle Like on a Comment
* **URL**: `/comments/:id/like`
* **Method**: `POST`
* **Headers**: `Cookie: access_token=...` or `Authorization: Bearer ...`
* **Response (Success - `201 Created`)**:
```json
{
  "success": true,
  "data": {
    "success": true,
    "liked": true,
    "likesCount": 1
  }
}
```

---

### 5. Get List of Users Who Liked a Comment
* **URL**: `/comments/:id/likes`
* **Method**: `GET`
* **Response (Success - `200 OK`)**:
```json
{
  "success": true,
  "data": {
    "likes": [
      {
        "_id": "647f525f381f8f3c7b6ad5e1",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com"
      }
    ]
  }
}
```

---

## Uploads Module

### 1. Upload an Image
* **URL**: `/uploads/image`
* **Method**: `POST`
* **Headers**: `Content-Type: multipart/form-data`
* **Enforcements**: Maximum 5MB, strict MIME-type buffer verification (accepts only jpeg, png, gif, webp)
* **Request Body (form-data)**:
  - `file`: `[Binary Image Data]`
* **Response (Success - `201 Created`)**:
```json
{
  "success": true,
  "data": {
    "url": "http://localhost:3000/uploads/1715206254881-837482937.png"
  }
}
```

---

## Standard Error Response Format
All errors (validation, authentication, conflicts, rate-limiting, etc.) are standardized by the exception filters:

* **Example Error (Incorrect Password - `401 Unauthorized`)**:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid email or password"
  }
}
```

* **Example Error (Validation Error - `400 Bad Request`)**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "email must be an email"
  }
}
```
