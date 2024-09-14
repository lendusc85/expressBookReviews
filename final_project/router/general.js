const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  let username = req.body.username;
  let password = req.body.password;
  if(!username || !password){
    return res.status(400).json({message : "username and password are required."})
  }

  if(!isValid(username)){
    users.push({username: username, password: password, curDate: new Date()})
    return res.status(201).json({message: "User registered successfully"})
  }else{
    return res.status(404).json({message: "username alread exists"});
  }

});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const response = await new Promise((resolve) => {
      setTimeout(() => resolve({ data: books }), 1000); 
    });
    
    return res.status(200).json(response.data); 
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching books data' });
  }
});



// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const response = await new Promise((resolve) => {
      setTimeout(() => {
        const book = Object.values(books).find(book => book.isbn === isbn);
        resolve({ data: book });
      }, 1000);
    });

    if (!response.data) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching book data' });
  }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;

    const response = await new Promise((resolve) => {
      setTimeout(() => {
        const filteredBooks = Object.values(books).filter(book => book.author === author);
        resolve({ data: filteredBooks });
      }, 1000); 
    });

    if (response.data.length > 0) {
      return res.status(200).json(response.data); 
    } else {
      return res.status(404).json({ message: "No books found for this author" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching books by author' });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;

    const response = await new Promise((resolve) => {
      setTimeout(() => {
        const filteredBooks = Object.values(books).filter(book => book.title === title);
        resolve({ data: filteredBooks });
      }, 1000);
    });

    if (response.data.length > 0) {
      return res.status(200).json(response.data);
    } else {
      return res.status(404).json({ message: "No books found for this title" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching books by title' });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  let isbn = req.params.isbn;
  const book = Object.values(books).find(book => book.isbn === isbn);
  
  if (book && book.reviews) {
    const reviews = Object.keys(book.reviews).length > 0 ? book.reviews : { message: "No reviews available for this book" };
    return res.status(200).json(reviews);
  } else {
    return res.status(404).json({ message: "No reviews found for this book" });
  }
});

module.exports.general = public_users;
