const Router = require("express")
const router = new Router()
const controller = require('./testsController')
const authMiddleware = require("./middleware/authMiddleware")

router.post('/test', authMiddleware, controller.postTest)
router.patch('/test', authMiddleware, controller.patchTest)
router.delete("/test", authMiddleware, controller.deleteTest)
router.get('/test/:id', authMiddleware, controller.getTest)
router.post("/activateTest", authMiddleware, controller.activateTest)
router.get("/userTests/:id", authMiddleware, controller.getUserTests)
router.get("/activeTest/:id", authMiddleware, controller.getActiveTest)
router.get("/activeTests", authMiddleware, controller.getActiveUserTests)
router.get("/activeTests", authMiddleware, controller.getActiveUserTests)
router.delete("/activeTest/:id", authMiddleware, controller.deleteActiveTest)
router.post("/testResult", authMiddleware, controller.postTestResult)
router.get("/testResults", authMiddleware, controller.getTestResults)

module.exports = router