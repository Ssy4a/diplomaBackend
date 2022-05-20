const { Schema, model } = require("mongoose")

const TestResult = new Schema({
    creator: { type: Schema.Types.ObjectId, ref: "User" },
    answers: [[{ type: Boolean, required: true }]],
    user: { type: Schema.Types.ObjectId, ref: "User" },
    username: { type: String, required: true },
    test: { type: Schema.Types.ObjectId, ref: "Test" },
    TestResults: [[{ type: Boolean, required: true }]],
    TestResultsChecked: [[{ type: Boolean, required: true }]],
    answerCorrectnessArr: [{ type: Boolean, required: true }],
    passedAt: { type: Date, required: true }
})

TestResult.pre("save", function (next) {
    this.passedAt = Date.now()
    next()
})

module.exports = model("TestResult", TestResult)