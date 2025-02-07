const jwt = require("jsonwebtoken");

// Middleware para verificar si el usuario está autenticado
const authMiddleware = (req, res, next) => {
    const token = req.header("Auth");

    if(!token) {
        return res.status(401).json({message: "No hay token, autorización denegada"});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({message: "Token Invalido"});
    }
}

module.exports = authMiddleware;