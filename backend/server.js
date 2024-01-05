import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import fs from "fs";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import crudRouter from "./routes/crudRoute.js";
import loginRoutes from "./routes/loginRoutes.js";

dotenv.config();
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Connected to Db success"))
  .catch((error) => console.log(error.message));
const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());
app.use("/login", loginRoutes);
app.use("/api/crud", crudRouter);

// Problem 1: Asynchronous Operations
app.get("/asyncdata", async (req, res) => {
  async function downloadContents(urls) {
    try {
      const downloadPromises = urls.map(async (url) => {
        const response = await axios.get(url);
        return response.data;
      });
      const downloadedContents = await Promise.all(downloadPromises);
      return downloadedContents;
    } catch (error) {
      console.error("Error downloading contents:", error.message);
      throw error;
    }
  }
  // Example usage:
  const urls = [
    "https://jsonplaceholder.typicode.com/posts/1",
    "https://jsonplaceholder.typicode.com/posts/2",
    "https://jsonplaceholder.typicode.com/posts/3",
  ];

  try {
    const result = await downloadContents(urls);
    res.send(result);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(400).send({ message: res.message });
  }
});

// Problem 2: Error Handling
app.get("/error", async (req, res) => {
  try {
    const response = await axios.get(
      "https://jsonplaceholder.typicode.com/posts/1"
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Problem 3: File System Operations
app.get("/filesystem", (req, res) => {
  const directoryPath = "./files";
  const fileExtension = ".txt";
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
    const filteredFiles = files.filter((file) => file.endsWith(fileExtension));
    res.json(filteredFiles);
  });
});

// Example protected endpoint
app.get("/protected", (req, res) => {
  // Verify the token before granting access
  const token = req.headers.authorization;
  try {
    const decoded = jwt.verify(token, secretKey);
    res.json({
      message: "Access granted to protected resource",
      user: decoded.username,
    });
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
