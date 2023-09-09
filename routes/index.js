const { Router } = require("express");
const router = Router();

router.get("/", (req, res) => {
  return res.json({
    message: "Server is perfectly working..",
    success: true,
  });
});

router.use("/user", require("./User"));
router.use("/auth", require("./Auth"));
module.exports = router;
