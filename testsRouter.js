const Router = require("express")
const router = new Router()
const controller = require('./testsController')

router.post('/test', controller.postTest)
router.patch('/test', controller.patchTest)
router.delete("/test", controller.deleteTest)
router.get('/test/:id', controller.getTest)
router.post("/activateTest", controller.activateTest)
router.get("/userTests/:id", controller.getUserTests)
router.get("/activeTest/:id", controller.getActiveTest)
router.get("/activeTests", controller.getActiveUserTests)
router.get("/activeTests", controller.getActiveUserTests)
router.delete("/activeTest/:id", controller.deleteActiveTest)
router.post("/testResult", controller.postTestResult)
router.get("/testResults", controller.getTestResults)

module.exports = router