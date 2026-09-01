const jwt = require('jsonwebtoken')

const auth = (req, res, next) => {
    try{
        const AuthorizationHeader = req.headers['authorization']

        const token = AuthorizationHeader && AuthorizationHeader.split(' ')[1]

        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.customer = decoded
        next()
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' })
    }
}

module.exports = auth