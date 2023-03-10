import express from "express";
import cors from "cors";
import { db, Post, User } from "./db/db.js";
import bcrypt from "bcrypt";
import sessions from "express-session";
import connectSession from "connect-session-sequelize";

const server = express();
server.use(cors({ credentials: true, origin: ["http://localhost:3000", "https://syracuse-food-pantry-easy-search.org", "https://www.syracuse-food-pantry-easy-search.org"] }));
server.use(express.json());
const sequelizeStore = connectSession(sessions.Store);
server.use(
	sessions({
		secret: "mysecretkey",
		store: new sequelizeStore({ db }),
		cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 },
	})
);

server.get("/", (req, res) => {
	res.send({my_name_is: "Alba"});
});

server.post("/newPost", async (req, res) => {
	if (!req.session.user) {
		res.status(401).send({ error: true, message: "you little hacker" });
	} else {
		await Post.create({ ...req.body, userID: req.session.user.id });
		res.send({ status: "ok" });
	}
});

server.get("/posts", async (req, res) => {
	const posts = await Post.findAll({
		include: [{ model: User, attributes: ["firstName"] }],
	});
	res.send({ posts });
});

server.get("/post/:id", async (req, res) => {
	const post = await Post.findByPk(req.params.id);
	res.send({ post });
});

server.delete("/post/:id", async (req, res) => {
	const post = await Post.findByPk(req.params.id);
	await post.destroy();
	res.send({ deleted: "he's dead, jim 🖖" });
});

server.post("/login", async (req, res) => {
	// A7: Go find the user in the database using the email from the frontend
	const user = await User.findOne(
		{
			where: { email: req.body.email },
		},
		{ raw: true }
	);
	if (!user) {
		// A8 If the user does not existed, tell the frontend there's an error
		res.send({ error: "email not found" });
	} else {
		// A9 If the user does exist, compare the password from the frontend to the hashed password in the database
		const matchingPassword = await bcrypt.compare(
			req.body.password,
			user.password
		);
		if (!matchingPassword) {
			// A10 If the password is not correct, tell the frontend to fluff off
			res.send({ error: "password is incorrect" });
		} else {
			// A11 User auth must be right, store the user info in a session
			req.session.user = user;
			// A12 Tell the front end that the login worked
			res.send({ loggedIn: true });
		}
	}
});

server.get("/logout", (req, res) => {
	req.session.destroy();
	res.send({ loggedIn: false });
});

server.get("/authStatus", async (req, res) => {
	// A16 Console log the info about user based off who is signed in the session
	// A16: Log out the user info from A11
	if (req.session.user) {
		res.send({ loggedIn: true });
	} else {
		res.send({ loggedIn: false });
	}
});



// bind to the correct port that AWS assigns us
let port = 3001; 
if (process.env.PORT) {
	port = process.env.PORT;
}

//#9 run express API server in background to listen for incoming requests
server.listen(port, () => {
	console.log("Server running.");
});


