const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT, 10) || 9002;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
	const server = createServer(async (req, res) => {
		try {
			const parsedUrl = parse(req.url, true);
			await handle(req, res, parsedUrl);
		} catch (err) {
			console.error("Error occurred handling", req.url, err);
			res.statusCode = 500;
			res.end("internal server error");
		}
	});

	// Attach Socket.io
	const io = new Server(server, {
		cors: {
			origin: "*", // allow any origin during development
			methods: ["GET", "POST"],
		},
	});

	io.on("connection", (socket) => {
		console.log("Client connected via Socket.io:", socket.id);

		// Allow users to join a specific room (e.g., their user ID or a city)
		socket.on("join", (room) => {
			socket.join(room);
			console.log(`Socket ${socket.id} joined room: ${room}`);
		});

		socket.on("disconnect", () => {
			console.log("Client disconnected:", socket.id);
		});
	});

	// Make io accessible globally so we can emit events from API routes
	global.io = io;

	server
		.once("error", (err) => {
			console.error(err);
			process.exit(1);
		})
		.listen(port, () => {
			console.log(
				`> Ready on http://${hostname}:${port} with Socket.io enabled`
			);
		});
});
