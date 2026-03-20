require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 3000;

// Initialize Database Connection before starting the server process
connectDB().then(() => {
    // Start Event Listener
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});