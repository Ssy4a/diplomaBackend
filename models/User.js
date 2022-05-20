const { Schema, model } = require("mongoose")

const User = new Schema({
    username: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    roles: [{ type: String, ref: "Role" }],
    tests: [{ type: Schema.Types.ObjectId, ref: "Test" }],
    activeTests: [{ type: Schema.Types.ObjectId, ref: "Test" }]
})

module.exports = model("User", User)