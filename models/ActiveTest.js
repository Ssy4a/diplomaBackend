const { Schema, model } = require("mongoose")

const ActiveTest = new Schema({
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
    activatedAt: { type: Date, required: true },
    expiresIn: { type: Number, required: true },
    myTestId: { type: Schema.Types.ObjectId, ref: "Test", required: true }
})

ActiveTest.pre("save", function (next) {
    this.activatedAt = Date.now()
    next()
})

module.exports = model("ActiveTest", ActiveTest)