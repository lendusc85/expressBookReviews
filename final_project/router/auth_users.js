const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  // Check if the user exists and if the password matches
  let user = users.find(user => user.username === username && user.password === password);
  return user !== undefined;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username or password is required" });
  }

  // Check if the user is authenticated
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      { username: username },
      'access',
      { expiresIn: 60 * 60 } // 1 hour expiry
    );

    // Store accessToken in session
    if (!req.session) {
      return res.status(500).json({ message: "Session not initialized" });
    }
    req.session.authentication = {
      accessToken: accessToken
    };

    return res.status(200).json({ message: "User logged in successfully!", accessToken });
  }

  // Return 401 Unauthorized for invalid credentials
  return res.status(401).json({ message: "Invalid username or password" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  let token = req.session?.authentication?.accessToken;

  if (!token) {
    return res.status(404).json({ message: "User not authenticated" });
  }

  try {
    let decoded = jwt.verify(token, 'access');
    const username = decoded.username;

    // Find the book by its ISBN
    const book = Object.values(books).find(book => book.isbn === isbn);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Add or update the user's review for the given book
    book.reviews[username] = review;

    return res.status(200).json({ message: "Review added successfully", review });
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  let token = req.session?.authentication?.accessToken;

  // Check if user is authenticated
  if (!token) {
    return res.status(403).json({ message: "User not authenticated" });
  }

  try {
    // Verify the token and retrieve the username
    let decoded = jwt.verify(token, 'access');
    const username = decoded.username;

    // Find the book by its ISBN
    const book = Object.values(books).find(book => book.isbn === isbn);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if the review exists for this user
    if (!book.reviews[username]) {
      return res.status(404).json({ message: "Review not found for this user" });
    }

    // Delete the user's review
    delete book.reviews[username];

    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

regd_users.post("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({ message: "Failed to log out" });
    }
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: "Successfully logged out" });
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
