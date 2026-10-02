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
        description,
        time_expensed
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
                description,
                time_expensed
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                tripId,
                title.trim(),
                amount,
                normalizedCurrency,
                userId,
                expense_date,
                time_expensed || null,
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
                time_expensed: time_expensed || null,
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
                e.created_at,
                e.time_expensed
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

// GET /api/trips/:tripId/expense-splits
async function getExpenseSplits(req, res) {
    const { tripId } = req.params;
    const userId = req.user.id;

    try {
        const [members] = await db.promise().query(
            `SELECT id FROM trip_members WHERE trip_id = ? AND user_id = ?`,
            [tripId, userId]
        );

        if (members.length === 0) {
            return res.status(403).json({
                success: false,
                message: "คุณไม่ได้เป็นสมาชิกของ Trip นี้"
            });
        }

        const [splits] = await db.promise().query(
            `SELECT
                es.expense_id,
                es.user_id,
                es.share_amount,
                u.name,
                u.email
             FROM expense_splits es
             INNER JOIN expenses e ON e.id = es.expense_id
             INNER JOIN users u ON u.id = es.user_id
             WHERE e.trip_id = ?
             ORDER BY es.expense_id, u.name`,
            [tripId]
        );

        res.json({ success: true, data: splits });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการโหลดการแบ่งค่าใช้จ่าย"
        });
    }
}

// PUT /api/expenses/:expenseId/splits
async function saveExpenseSplits(req, res) {
    const { expenseId } = req.params;
    const userId = req.user.id;
    const { splits } = req.body;

    if (!Array.isArray(splits) || splits.length === 0) {
        return res.status(400).json({
            success: false,
            message: "กรุณาระบุสมาชิกและจำนวนเงินที่ต้องการแบ่ง"
        });
    }

    const connection = await db.promise().getConnection();

    try {
        const [expenses] = await connection.query(
            `SELECT e.id, e.amount, e.trip_id
             FROM expenses e
             INNER JOIN trip_members tm ON tm.trip_id = e.trip_id
             WHERE e.id = ? AND tm.user_id = ?`,
            [expenseId, userId]
        );

        if (expenses.length === 0) {
            return res.status(403).json({
                success: false,
                message: "คุณไม่มีสิทธิ์จัดการค่าใช้จ่ายนี้"
            });
        }

        const expense = expenses[0];
        const normalizedSplits = splits.map((split) => ({
            userId: Number(split.user_id),
            amount: Number(split.share_amount)
        }));

        if (normalizedSplits.some((split) => !Number.isInteger(split.userId) || split.amount <= 0)) {
            return res.status(400).json({
                success: false,
                message: "จำนวนเงินของสมาชิกต้องมากกว่า 0"
            });
        }

        const userIds = normalizedSplits.map((split) => split.userId);
        if (new Set(userIds).size !== userIds.length) {
            return res.status(400).json({
                success: false,
                message: "ไม่สามารถเลือกสมาชิกซ้ำได้"
            });
        }

        const [tripMembers] = await connection.query(
            `SELECT user_id FROM trip_members WHERE trip_id = ? AND user_id IN (?)`,
            [expense.trip_id, userIds]
        );

        if (tripMembers.length !== userIds.length) {
            return res.status(400).json({
                success: false,
                message: "มีสมาชิกบางคนไม่อยู่ในทริปนี้"
            });
        }

        const total = normalizedSplits.reduce((sum, split) => sum + split.amount, 0);
        if (Math.abs(total - Number(expense.amount)) > 0.005) {
            return res.status(400).json({
                success: false,
                message: "ยอดแบ่งของทุกคนต้องเท่ากับยอดค่าใช้จ่าย"
            });
        }

        await connection.beginTransaction();
        await connection.query(`DELETE FROM expense_splits WHERE expense_id = ?`, [expenseId]);
        await connection.query(
            `INSERT INTO expense_splits (expense_id, user_id, share_amount) VALUES ?`,
            [normalizedSplits.map((split) => [expenseId, split.userId, split.amount.toFixed(2)])]
        );
        await connection.commit();

        res.json({
            success: true,
            message: "บันทึกการแบ่งค่าใช้จ่ายสำเร็จ"
        });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการบันทึกการแบ่งค่าใช้จ่าย"
        });
    } finally {
        connection.release();
    }
}


module.exports = {
    createExpense,
    getExpenses,
    getExpenseSplits,
    saveExpenseSplits
};