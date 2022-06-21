const jwt = require("jsonwebtoken")
const { secret } = require("../config")

module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        next()
    }
    try {
        if (!req.headers.authorization) {
            return res.status(400).json({ message: "Користувач не авторизований" })
        }
        const token = req.headers.authorization.split(" ")[1]
        if (!token) {
            console.log("err")
            return res.status(400).json({ message: "Користувач не авторизований" })
        }
        const decodedData = jwt.verify(token, secret)
        req.user = decodedData
        next()
    } catch (e) {
        console.log("err")
        console.log(e)
        return res.status(400).json({ message: "Користувач не авторизований" })
    }
}