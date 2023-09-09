const dotenv = require("dotenv");
dotenv.config();
const { connectDB } = require("./config/dbConnection");
const app = require("./App/app");
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
