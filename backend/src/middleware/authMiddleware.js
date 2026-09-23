const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        // ต้องมี Authorization header
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "กรุณาเข้าสู่ระบบ"
            });
        }

        // รูปแบบต้องเป็น:
        // Bearer TOKEN
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "ไม่พบ Token"
            });
        }

        // ตรวจสอบ JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // เก็บข้อมูล user ไว้ใน request
        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Token ไม่ถูกต้องหรือหมดอายุ"
        });
    }
}

module.exports = authenticateToken;