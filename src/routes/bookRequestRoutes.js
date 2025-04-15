// const express = require("express");
// const router = express.Router();
// const { authenticateUser } = require("../middleware/authMiddleware");
// const { submitBookRequest } = require("../controllers/bookRequestController");

// // 📌 **User submits a book request**
// router.post("/", submitBookRequest);

// module.exports = router;

const express = require("express");
const router = express.Router();

const upload = require("../middleware/ondemandUpload");

const { submitBookRequest } = require("../controllers/bookRequestController");

// User or Guest submits a book request
router.post("/", upload.single("file"), submitBookRequest);

module.exports = router;
