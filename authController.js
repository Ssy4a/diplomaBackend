const User = require("./models/User")
const Role = require("./models/Role")
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require("express-validator")
const { secret } = require("./config");

const generateAccessToken = (id, roles) => {
    const payload = {
        id,
        roles
    }
    return jwt.sign(payload, secret, { expiresIn: "24h" })
}


class authController {
    async registration(req, res) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: "Помилка при реєстрації", errors })
            }
            const { username, password, name } = req.body
            const candidate = await User.findOne({ username })
            if (candidate) {
                return res.status(400).json({ message: "Користувач з таким логіном вже зареєстрований. Оберіть інший логін." })
            }
            const hashPassword = bcrypt.hashSync(password, 7);
            const userRole = await Role.findOne({ value: "USER" })
            const user = new User({ username, name, password: hashPassword, roles: [userRole.value] })
            await user.save()
            return res.json({ message: "Користувач успішно зареєстрований" })
        } catch (e) {
            console.log(e)
            res.status(400).json({ message: "Помилка реєстрації" })
        }
    }
    async login(req, res) {
        try {
            const { username, password } = req.body
            const user = await User.findOne({ username })
            if (!user) {
                return res.status(401).json({ message: `Користувача з логіном ${username} не знайдено.` })
            }
            const validPassword = bcrypt.compareSync(password, user.password)
            if (!validPassword) {
                return res.status(401).json({ message: "Нажаль, ви ввели невірний пароль. Перевірте свій пароль ще раз." })
            }
            const token = generateAccessToken(user._id, user.roles)
            return res.json({ token, userId: user._id })
        } catch (e) {
            res.status(401).json({ message: "Login error" })
        }
    }
    async refresh(req, res) {
        try {
            const token = req.headers.authorization.split(" ")[1]
            if (!token) {
                return res.status(403).json({ message: "Invalid authentification" })
            }
            const decodedData = jwt.verify(token, secret)
            if (!decodedData) {
                return res.status(403).json({ message: "Invalid authentification" })
            }
            else res.json("Authentification is successfull")
        } catch (e) {
            res.status(403).json({ message: "Invalid authentification" })
        }
    }
    async getUserInfo(req, res) {
        try {
            const token = req.headers.authorization.split(" ")[1]
            const decodedData = jwt.verify(token, secret)
            const user = await User.findOne({ _id: decodedData.id })
            if (!decodedData) {
                return res.status(403).json({ message: "Invalid authentification" })
            }
            else res.json(user)
        } catch (e) {
            res.status(401).json({ message: "Користувач не аутентифікований." })
        }
    }
}

module.exports = new authController()