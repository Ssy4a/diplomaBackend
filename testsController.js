const ActiveTest = require("./models/ActiveTest")
const User = require("./models/User")
const Test = require("./models/Test")
const TestResult = require("./models/TestResult")

class testsController {

    async postTest(req, res) {
        try {
            const { name, description, testItems } = await req.body
            const test = await new Test({
                name,
                description,
                testItems: testItems,
                updatedAt: "1",
                creator: req.user.id,
                isActive: false,
                testResults: []
            })
            await test.save()
            const newTestUser = await User.findOne({ _id: req.user.id })
            await newTestUser.updateOne({ $push: { tests: test } })
            res.json(test._id)
        } catch (e) {
            console.log(e)
            res.status(400).json({ message: "Помилка створення тесту. Спробуйте ще раз." })
        }
    }

    async getTest(req, res) {
        try {
            const { id } = req.params
            const selectedTest = await Test.findOne({ _id: id })
            await res.json(selectedTest)
        } catch (e) {
            console.log(e)
            res.status(400).json({ message: "Помилка отримання тесту" })
        }
    }
    async deleteTest(req, res) {
        try {
            const { testId } = req.body
            await Test.deleteOne({ _id: testId })
            const user = await User.findOne({ _id: req.user.id })
            await user.updateOne({ $pull: { tests: testId } })
            await res.json("Тест видалений успішно")
        } catch (e) {
            console.log(e)
            res.status(400).json({ message: "Помилка видалення тесту." })
        }
    }
    async activateTest(req, res) {
        try {
            const { id, ms } = req.body
            const timer = (ms) => {
                return new Promise(resolve => setTimeout(resolve, ms))
            }
            const test = await Test.findOne({ _id: id })
            await Test.updateOne(test, { $set: { isActive: true } })
            const { name, description, testItems, creator } = test
            const activeTest = new ActiveTest({ name, description, testItems, creator, expiresIn: ms, activatedAt: "1", myTestId: id })
            await activeTest.save()
            const user = await User.findOne({ _id: creator })
            await user.updateOne({ $push: { activeTests: activeTest._id } })
            await res.json("Тест активований успішно.")
            await timer(ms)
                .then(() => ActiveTest.deleteOne({ _id: activeTest._id }))
                .then(() => user.updateOne({ $pull: { activeTests: activeTest._id } }))
                .finally(() => Test.updateOne({ _id: id }, { $set: { isActive: false } }))
        } catch (e) {
            console.log(e)
            res.status(400).json({ message: "Помилка активації тесту." })
        }
    }
    async getUserTests(req, res) {
        try {
            const userTestsArr = []
            const { id } = req.params
            const user = await User.findOne({ _id: id })
            const mapper = async (item) => {
                const userTest = await Test.findOne({ _id: item._id })
                userTestsArr.push(userTest)
            }
            for (const item of user.tests) {
                await mapper(item)
            }
            res.json(userTestsArr)
        } catch (e) {
            console.log(e)
            res.status(400).json({ message: "Помилка отримання тестів користувача. Спробуйте пізніше. " })
        }
    }
    async patchTest(req, res) {
        try {
            const { testToEditId, newTest } = await req.body
            const testToEdit = Test.findOne({ _id: testToEditId })
            await Test.updateOne({ _id: testToEditId }, {
                name: newTest.name,
                description: newTest.description,
                testItems: newTest.testItems,
                creator: req.user.id,
                updatedAt: "1",
                isActive: false,
                testResults: testToEdit.testResults
            })
            res.json("Тест успішно редаговано")
        } catch (e) {
            console.log(e)
            res.status(400).json({ message: "Помилка редагування тесту." })
        }
    }
    async getActiveTest(req, res) {
        try {
            const { id } = req.params
            const activeTest = await ActiveTest.findOne({ _id: id })
            if (!activeTest) return res.status(403).json({ message: "Тесту з таким ідентифікатором не знайдено." })
            res.json(activeTest)
        } catch (e) {
            console.log(e)
            res.status(400).json({ message: "Не валідний ідентифікатор. Спробуйте ще раз." })
        }
    }
    async getActiveUserTests(req, res) {
        try {
            const userActiveTestsArr = []
            const mapper = async (item) => {
                const userActiveTest = await ActiveTest.findOne({ _id: item._id })
                userActiveTestsArr.push(userActiveTest)
            }
            const user = await User.findOne({ _id: req.user.id })
            for (const item of user.activeTests) {
                await mapper(item)
            }
            const mapper2 = async (item) => {
                const activatedAtDate = await new Date(item.activatedAt)
                const currentDate = await Date.now()
                const timeLeft = await ((item.expiresIn - (currentDate - activatedAtDate)) / 1000 | 0)
                if (timeLeft < 1) {
                    await ActiveTest.deleteOne({ _id: item._id })
                    const user = await User.findOne({ _id: req.user.id })
                    await user.updateOne({ $pull: { activeTests: item._id } })
                    await Test.updateOne({ _id: item._id }, { $set: { isActive: false } })
                }
            }
            for (const item of userActiveTestsArr) {
                await mapper2(item)
            }
            res.json(userActiveTestsArr)
        } catch (e) {
            console.log(e)
            res.status(400).json({ message: "Помилка пошуку тесту. Спробуйте пізніше. " })
        }
    }
    async deleteActiveTest(req, res) {
        try {
            const { id } = req.params
            await ActiveTest.deleteOne({ _id: id })
            const user = await User.findOne({ _id: req.user.id })
            await user.updateOne({ $pull: { activeTests: id } })
            await Test.updateOne({ _id: id }, { $set: { isActive: false } })
            res.json("Тестування успішно закінчене!")
        } catch (e) {
            console.log(e)
            res.status(400).json({ message: "Помилка завершення тестування. Спробуйте пізніше. " })
        }
    }
    async postTestResult(req, res) {
        try {
            const { answers, activeTestId } = req.body
            const testResultsArr = []
            const testResultsCheckedArr = []
            const answerCorrectnessArr = []
            let i = 0

            const mapper = async (item) => {
                const testItemResults = await item.answers.map((item) => {
                    return item.isRight
                })
                testResultsArr.push(testItemResults)
            }

            const answersComparer = async (item, i) => {
                const testItemResultsChecked = await item.map((item, id) => {
                    if (item === answers[i][id]) return true
                    else return false
                })
                testResultsCheckedArr.push(testItemResultsChecked)
            }

            const getRating = async (item) => {
                await answerCorrectnessArr.push(!item.includes(false))
            }
            const activeTest = await ActiveTest.findOne({ _id: activeTestId })
            if (!activeTest) return res.status(404).json({ message: "Час тестування вийшов" })
            const test = await Test.findOne({ _id: activeTest.myTestId })

            for (const item of test.testItems) {
                await mapper(item)
            }

            for (const item of testResultsArr) {
                await answersComparer(item, i)
                i++
            }

            for await (let item of testResultsCheckedArr) {
                await getRating(item)
            }

            const user = await User.findOne({ _id: req.user.id })
            const testResult = await new TestResult({
                answers: answers,
                user: req.user.id,
                username: user.name,
                test: activeTest.myTestId,
                TestResults: testResultsArr,
                TestResultsChecked: testResultsCheckedArr,
                answerCorrectnessArr: answerCorrectnessArr,
                creator: activeTest.creator,
                passedAt: "1",
            })
            await testResult.save()
            await Test.updateOne({ _id: activeTest.myTestId }, { $push: { testResults: testResult } })
            res.json("Тест пройдено успішно!")
        } catch (e) {
            console.log(e)
            res.status(400).json({ message: "Помилка тестування. Спробуйте пізніше. " })
        }
    }
    async getTestResults(req, res) {
        try {
            const testResults = await TestResult.find({ creator: req.user.id })
            res.json(testResults)
        } catch (e) {
            console.log(e)
            res.status(400).json({ message: "Помилка завершення тестування. Спробуйте пізніше. " })
        }
    }
}

module.exports = new testsController()
