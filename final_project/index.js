const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {
    // Check if session exists
    if (req.session.authentication) {
      let accessToken = req.session.authentication['accessToken'];
      
      // Verify JWT access token
      jwt.verify(accessToken, "access", (err, user) => {
        if (!err) {
          req.user = user; // Attach user info to the request object
          next(); // Proceed to the next middleware or route handler
        } else {
          return res.status(403).json({ message: "User not authenticated" });
        }
      });
    } else {
      return res.status(403).json({ message: "No session found" });
    }
  });
 
const PORT =3000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);
// app.use("/async", genl_AsyncRoutes);

app.listen(PORT,()=>console.log("Server is running"));
