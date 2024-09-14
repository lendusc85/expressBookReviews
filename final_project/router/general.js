const express = require('express');
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
public_users.get('/',function (req, res) {
  //Write your code here
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  let isbn = req.params.isbn;
  const book = books[isbn];
  if(!book){
    return res.status(404).json({message: "Book not found"})
  }
  return res.status(200).json(book);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author;
  const filteredBook = Object.values(books).filter(book => book.author === author);
  if(filteredBook.length > 0){
    return res.status(200).json(filteredBook);
  } else{
    return res.status(404).json({message: "No books found for this author"});
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title;
  const filteredTitleBooks = Object.values(books).filter(book => book.title === title);

  if (filteredTitleBooks.length > 0) {
    return res.status(200).json(filteredTitleBooks)
  } else {
    return res.status(404).json({message: "No books found for this title"});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  let isbn = req.params.isbn;
  const book = books[isbn];
  if (book & book.reviews){
    return res.status(200).json(book.reviews)
  } else {
    return res.status(404).json({message: "No reviews found for this book"});
  }
});

module.exports.general = public_users;
