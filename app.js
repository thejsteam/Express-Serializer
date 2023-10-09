const express = require("express");
const app = express();

// Middleware setup (e.g., bodyParser, CORS, authentication middleware)

// Routes setup
app.use("/auth", require("./routes/auth")); // Mount authentication routes
//app.use("/other", require("./routes/other")); // Mount other routes

// Start the Express app (e.g., listen on a port)
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
