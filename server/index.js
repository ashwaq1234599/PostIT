import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import UserModel from "./Models/UserModel.js";
import bcryt from "bcrypt";

import PostModel from "./Models/Posts.js";
import multer from "multer";
import fs from "fs";
import path from "path";


const app = express();
app.use(express.json());
app.use(cors());

const connectString = `mongodb+srv://${ENV.DB_USER}:${ENV.DB_PASSWORD}@${ENV.DB_CLUSTER}/${ENV.DB_NAME}?retryWrites=true&w=majority&appName=POSTITCLUSTER`;
mongoose.connect(connectString);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/"); // Specify the directory to save uploaded files
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname); // Unique filename
    },
  });
  // Create multer instance
  const upload = multer({ storage: storage });
  

app.post("/registerUser", async (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const hashedpassword = await bcryt.hash(password, 10);

        const user = new UserModel({
            name: name,
            email: email,
            password: hashedpassword
        });
        await user.save();
        res.send({ user: user, msg: "Added." });
        //will come in respones in userSlice 

    } catch (error) {
        res.status(500).json({ error: error });

    }
})

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email: email });
        if (!user) {
            return res.status(500).json({ error: "user not found" });
        }
        console.log(user);

        const passwordMatch = await bcryt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Authentication failed' });

        }
        res.status(200).json({ user, message: "Success." });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
})
app.post('logout', async (req, res) => {
    res.status(200).json({ message: "Logged out successfully" })
});

app.post("/savePost", async (req, res) => {
    try {
        const postMsg = req.body.postMsg;
        const email = req.body.email;

        const post = new PostModel({
            postMsg: postMsg,
            email: email,
        });

        await post.save();
        res.send({ post: post, msg: "Added." });
    } catch (error) {
        res.status(500).json({ error: "An error occurred" });
    }
});

//GET API - getPost
app.get("/getPosts", async (req, res) => {
    try {
        // Fetch all posts from the "PostModel" collection, sorted by createdAt in descending order
        const posts = await PostModel.find({}).sort({ createdAt: -1 });// sort based on time 

        const countPost = await PostModel.countDocuments({});

        res.send({ posts: posts, count: countPost });// will send the respones to the client
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred" });
    }
});

app.put("/updateUserProfile/:email/", async (req, res) => {
    //Retrieve the value from the route
    // params write because the email as a paremter in the path 
    const email = req.params.email;
    const name = req.body.name;
    const password = req.body.password;

    try {
        // Search for the user that will be updated using the findOne method
        const userToUpdate = await UserModel.findOne({ email: email });

        // Check if the user was found
        if (!userToUpdate) {
            return res.status(404).json({ error: "User not found" });
        }
        // Update the user's name
        userToUpdate.name = name;

        //if the user changed the password, change the password in the Db to the new hashed password
        if (password !== userToUpdate.password) {
            const hashedpassword = await bcryt.hash(password, 10);
            userToUpdate.password = hashedpassword;
        } else {
            //if the user did not change the password
            userToUpdate.password = password;
        }

        // Save the updated user
        await userToUpdate.save(); // Make sure to save the changes

        // Return the updated user as a response
        res.send({ user: userToUpdate, msg: "Updated." });

    } catch (err) {
        res.status(500).json({ error: err });
        return;
    }
});


app.listen(3001, () => { console.log("You are connected") })
