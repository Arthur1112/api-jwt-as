import functions from "firebase-functions";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import mySecretKey from "./secret.js";

const users = [
  // fake database
  { id: 1, email: "arthur@bocacode.com", password: "abc123" },
  { id: 2, email: "damian@bocacode.com", password: "def456" },
  { id: 3, email: "vitoria@bocacode.com", password: "ghi789" },
];

const app = express();
app.use(cors());
app.use(express.json());

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  //check to see if that email and password exist in our DB
  // if they do , create and send back token
  // if they dont , send back an error message
  let user = users.find(
    (user) => user.email === email && user.password === password
  );
  if (!user) {
    res.status(401).send("Invalid email or password");
    return;
  }
  user.password = undefined; // remove password from the user object
  // now we want to sign / create a token...
  const token = jwt.sign(user, mySecretKey, { expiresIn: "1h" }); //expires is optional
  res.send(token); // {id: 1, email: "arthur@bocacode.com"}
});
app.get("/public", (req, res) => {
  res.send("Welcome!"); // anyone can see this
});
app.get("/private", (req, res) => {
  // lets require a valid token to see this
  const token = req.headers.authorization || "";
  if (!token) {
    res.status(401).send("You must be logged in to see this");
    return;
  }
  jwt.verify(token, mySecretKey, (err, decoded) => {
    if (err) {
      res.status(401).send("You must use a valid token to see this");
      return;
    }
    // here we know that the token is valid....
    // we can check and see if decoded.id for example is the user that can update this record in the database
    res.send(`Welcome ${decoded.email}!`);
  });
});

export const api = functions.https.onRequest(app);
