const db = require("../config/db");

// POST /api/trips/:tripId/expenses
async function createExpense(req, res) {
    const { tripId } = req.params;
    const userId = req.user.id;

    const {
        title,
        amount,
        currency,
        expense_date,
        description
    } = req.body;

    if (!title || !amount || !currency || !expense_date) {
        return res.status(400).json({
            success: false,
            message: "กรุณากรอก title, amount, currency และ expense_date"
        });
    }

    if (Number(amount) <= 0) {
        return res.status(400).json({
            success: false,
            message: "amount ต้องมากกว่า 0"
        });
    }

    const normalizedCurrency =
        String(currency).trim().toUpperCase();

    if (!/^[A-Z]{3}$/.test(normalizedCurrency)) {
        return res.status(400).json({
            success: false,
            message: "currency ต้องเป็นรหัสสกุลเงิน 3 ตัวอักษร เช่น THB, JPY, USD"
        });
    }

    try {
        // ตรวจว่า user เป็นสมาชิก trip หรือไม่
        const [members] = await db.promise().query(
            `
            SELECT id
            FROM trip_members
            WHERE trip_id = ?
              AND user_id = ?
            `,
            [tripId, userId]
        );

        if (members.length === 0) {
            return res.status(403).json({
                success: false,
                message: "คุณไม่ได้เป็นสมาชิกของ Trip นี้"
            });
        }

        // สร้าง expense
        const [result] = await db.promise().query(
            `
            INSERT INTO expenses
            (
                trip_id,
                title,
                amount,
                currency,
                paid_by,
                expense_date,
                description
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                tripId,
                title.trim(),
                amount,
                normalizedCurrency,
                userId,
                expense_date,
                description || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "สร้าง Expense สำเร็จ",
            data: {
                id: result.insertId,
                trip_id: Number(tripId),
                title: title.trim(),
                amount,
                currency: normalizedCurrency,
                paid_by: userId,
                expense_date,
                description: description || null
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการสร้าง Expense"
        });
    }
}


// GET /api/trips/:tripId/expenses
async function getExpenses(req, res) {
    const { tripId } = req.params;
    const userId = req.user.id;

    try {
        // ตรวจ membership
        const [members] = await db.promise().query(
            `
            SELECT id
            FROM trip_members
            WHERE trip_id = ?
              AND user_id = ?
            `,
            [tripId, userId]
        );

        if (members.length === 0) {
            return res.status(403).json({
                success: false,
                message: "คุณไม่ได้เป็นสมาชิกของ Trip นี้"
            });
        }

        const [expenses] = await db.promise().query(
            `
            SELECT
                e.id,
                e.trip_id,
                e.title,
                e.amount,
                e.currency,
                e.paid_by,
                u.name AS paid_by_name,
                u.email AS paid_by_email,
                e.expense_date,
                e.description,
                e.created_at
            FROM expenses e
            JOIN users u
                ON e.paid_by = u.id
            WHERE e.trip_id = ?
            ORDER BY e.expense_date DESC, e.id DESC
            `,
            [tripId]
        );

        res.json({
            success: true,
            data: expenses
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการโหลด Expense"
        });
    }
}


module.exports = {
    createExpense,
    getExpenses
};