// Assuming you have imported the Chord class from Chord.js
import Chord from "../Chord.mjs";
//const Chord1 = require('../Chord');

const chordInstance = new Chord("127.0.0.1", 8081, "./files1", "startNode");

// Rest of your code...

// Instantiate the Chord class
// const Chord = require("../Chord");



// const chord = new Chord("127.0.0.1", 8081, "./files1", "startNode");

// Function to fetch and display all blog posts
async function displayBlogPosts() {
    const postList = document.getElementById("post-list");
    postList.innerHTML = ""; // Clear the post list

    try {
        // Make an API request to fetch all blog posts
        const response = await fetch("http://localhost:8081/api/posts");
        const data = await response.json();

        // Loop through the blog posts and create list items
        data.forEach((post) => {
            const listItem = document.createElement("li");
            const link = document.createElement("a");
            link.href = `post.html?id=${post.id}`;
            link.textContent = post.title;
            listItem.appendChild(link);
            postList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error fetching blog posts:", error);
    }
}

// Function to create a new blog post
async function createBlogPost(event) {
    event.preventDefault(); // Prevent form submission

    const form = document.getElementById("new-post-form");
    const titleInput = document.getElementById("title");
    const contentInput = document.getElementById("content");

    const postData = {
        title: titleInput.value,
        content: contentInput.value,
    };

    try {
        // Make an API request to create a new blog post
        const response = await fetch("http://localhost:8081/api/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(postData),
        });

        if (response.ok) {
            // Blog post created successfully
            titleInput.value = "";
            contentInput.value = "";
            displayBlogPosts(); // Refresh the post list
        } else {
            console.error("Error creating blog post:", response.status);
        }
    } catch (error) {
        console.error("Error creating blog post:", error);
    }
}

// Function to display an individual blog post
async function displayIndividualPost() {
    const postId = new URLSearchParams(window.location.search).get("id");
    const postTitle = document.getElementById("post-title");
    const postContent = document.getElementById("post-content");

    try {
        // Make an API request to fetch the individual blog post
        const response = await fetch(`http://localhost:8081/api/posts/${postId}`);
        const data = await response.json();

        postTitle.textContent = data.title;
        postContent.textContent = data.content;
    } catch (error) {
        console.error("Error fetching blog post:", error);
    }
}

// Event listeners
document.addEventListener("DOMContentLoaded", displayBlogPosts);
document.getElementById("new-post-form").addEventListener("submit", createBlogPost);
document.addEventListener("DOMContentLoaded", displayIndividualPost);

