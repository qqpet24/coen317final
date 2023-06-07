import Chord from "./Chord.js";
import express from "express";
// const express = require("express");
// const cors = require("cors"); // Import the cors package

import cors from "cors";
const app = express();
app.use(cors()); // Use the cors middleware

// Rest of your server-side code

// const server = app.listen(8081, () => {
//
// });


(async () => {
    const chord = new Chord("127.0.0.1", 8081, "./files1", "startNode");
    // Use the chord instance here
    // await chord.addNodeClient("127.0.0.1:8082");
    // await chord.addNodeClient("127.0.0.1:8083");
    // await chord.addNodeClient("127.0.0.1:8084");
    console.log("Server is running on port 8081");
    // Wait for a few seconds to allow the nodes to stabilize
    await chord.sleep(5000);

    // Display the finger table
    chord.showData();

    // Fetch and display all blog posts
    await chord.getAllPosts();

    // Create a new blog post
    // await chord.createPost({
    //     title: "New Blog Post",
    //     content: "This is the content of the new blog post.",
    // });

    // Display an individual blog post
    // await chord.displayIndividualPost();
})();
