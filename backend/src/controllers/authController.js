const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

async function register(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "กรุณากรอก name, email และ password"
            });
        }

        const [existingUsers] = await db
            .promise()
            .query(
                "SELECT id FROM users WHERE email = ?",
                [email]
            );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: "อีเมลนี้ถูกใช้งานแล้ว"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db
            .promise()
            .query(
                `INSERT INTO users (name, email, password)
                 VALUES (?, ?, ?)`,
                [name, email, hashedPassword]
            );

        res.status(201).json({
            success: true,
            message: "สมัครสมาชิกสำเร็จ",
            data: {
                id: result.insertId,
                name,
                email
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดที่ Server"
        });
    }
}


async function login(req, res) {
    try {
        const { email, password } = req.body;

        // 1. ตรวจข้อมูล
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "กรุณากรอก email และ password"
            });
        }

        // 2. ค้นหา user
        const [users] = await db
            .promise()
            .query(
                "SELECT * FROM users WHERE email = ?",
                [email]
            );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Email หรือ Password ไม่ถูกต้อง"
            });
        }

        const user = users[0];

        // 3. ตรวจ password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Email หรือ Password ไม่ถูกต้อง"
            });
        }

        // 4. สร้าง JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        // 5. ส่งข้อมูลกลับ
        res.json({
            success: true,
            message: "เข้าสู่ระบบสำเร็จ",
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดที่ Server"
        });
    }
}

async function getProfile(req, res) {
    try {
        const [users] = await db.promise().query(
            "SELECT id, name, email FROM users WHERE id = ?",
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบข้อมูลผู้ใช้"
            });
        }

        res.json({
            success: true,
            data: users[0]
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้"
        });
    }
}


module.exports = {
    register,
    login,
    getProfile
};