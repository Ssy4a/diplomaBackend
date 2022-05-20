const { Schema, model } = require("mongoose")

const Test = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    testItems: [{
        question: { type: String, required: true },
        answers: [{
            answer: { type: String, required: true },
            isRight: { type: Boolean, required: true }
        }]
    }],
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedAt: { type: Date, required: true },
    testResults: [{ type: Schema.Types.ObjectId, ref: "TestResult"}]
})

Test.pre("save", function (next) {
    this.updatedAt = Date.now()
    next()
})

module.exports = model("Test", Test)
