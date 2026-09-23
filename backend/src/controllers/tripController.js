const db = require("../config/db");

async function createTrip(req, res) {
    const connection = await db.promise().getConnection();

    try {
        const {
            name,
            description,
            start_date,
            end_date
        } = req.body;

        // ตรวจข้อมูล
        if (!name || !start_date || !end_date) {
            connection.release();

            return res.status(400).json({
                success: false,
                message: "กรุณากรอก name, start_date และ end_date"
            });
        }

        // ตรวจวันที่
        if (new Date(start_date) > new Date(end_date)) {
            connection.release();

            return res.status(400).json({
                success: false,
                message: "start_date ต้องไม่มากกว่า end_date"
            });
        }

        // User ที่ Login อยู่
        const userId = req.user.id;

        // เริ่ม Transaction
        await connection.beginTransaction();

        // 1. สร้าง Trip
        const [tripResult] = await connection.query(
            `INSERT INTO trips
            (name, description, start_date, end_date, created_by)
            VALUES (?, ?, ?, ?, ?)`,
            [
                name,
                description || null,
                start_date,
                end_date,
                userId
            ]
        );

        const tripId = tripResult.insertId;

        // 2. เพิ่มคนสร้างเป็น Owner
        await connection.query(
            `INSERT INTO trip_members
            (trip_id, user_id, role)
            VALUES (?, ?, 'owner')`,
            [tripId, userId]
        );

        // ยืนยัน Transaction
        await connection.commit();

        connection.release();

        res.status(201).json({
            success: true,
            message: "สร้าง Trip สำเร็จ",
            data: {
                id: tripId,
                name,
                description: description || null,
                start_date,
                end_date,
                created_by: userId,
                role: "owner"
            }
        });

    } catch (error) {
        await connection.rollback();
        connection.release();

        console.error(error);

        res.status(500).json({
            success: false,
            message: "ไม่สามารถสร้าง Trip ได้"
        });
    }
}

async function getTrips(req, res) {
    try {
        const userId = req.user.id;

        const [trips] = await db.promise().query(
            `SELECT t.id, t.name, t.description, t.start_date, t.end_date, tm.role
            FROM trips t
            JOIN trip_members tm ON t.id = tm.trip_id
            WHERE tm.user_id = ?`,
            [userId]
        );

        res.json({
            success: true,
            data: trips
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "ไม่สามารถดึงข้อมูล Trips ได้"
        });
    }
}

async function getTripById(req, res) {
    try {
        const userId = req.user.id;
        const tripId = req.params.id;

        // ตรวจว่า User เป็นสมาชิกของ Trip นี้หรือไม่
        const [membership] = await db.promise().query(
            `SELECT role
             FROM trip_members
             WHERE trip_id = ? AND user_id = ?`,
            [tripId, userId]
        );

        if (membership.length === 0) {
            return res.status(403).json({
                success: false,
                message: "คุณไม่มีสิทธิ์เข้าถึง Trip นี้"
            });
        }

        // ดึงข้อมูล Trip
        const [trips] = await db.promise().query(
            `SELECT
                id,
                name,
                description,
                start_date,
                end_date,
                created_by,
                created_at
             FROM trips
             WHERE id = ?`,
            [tripId]
        );

        if (trips.length === 0) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบ Trip นี้"
            });
        }

        // ดึงสมาชิก
        const [members] = await db.promise().query(
            `SELECT
                u.id,
                u.name,
                u.email,
                tm.role,
                tm.joined_at
             FROM trip_members tm
             INNER JOIN users u
                ON tm.user_id = u.id
             WHERE tm.trip_id = ?
             ORDER BY tm.role = 'owner' DESC, u.name ASC`,
            [tripId]
        );

        res.json({
            success: true,
            data: {
                trip: trips[0],
                members
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "ไม่สามารถดึงข้อมูล Trip ได้"
        });
    }
}

async function updateTrip(req, res) {
    try {
        const userId = req.user.id;
        const tripId = req.params.id;

        const {
            name,
            description,
            start_date,
            end_date
        } = req.body;

        // ตรวจว่า User เป็น Owner หรือไม่
        const [members] = await db.promise().query(
            `SELECT role
             FROM trip_members
             WHERE trip_id = ? AND user_id = ?`,
            [tripId, userId]
        );

        if (members.length === 0) {
            return res.status(403).json({
                success: false,
                message: "คุณไม่มีสิทธิ์เข้าถึง Trip นี้"
            });
        }

        if (members[0].role !== "owner") {
            return res.status(403).json({
                success: false,
                message: "เฉพาะ Owner เท่านั้นที่แก้ไข Trip ได้"
            });
        }

        // ตรวจว่ามี Trip หรือไม่
        const [trips] = await db.promise().query(
            "SELECT id FROM trips WHERE id = ?",
            [tripId]
        );

        if (trips.length === 0) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบ Trip นี้"
            });
        }

        // ตรวจข้อมูล
        if (!name || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: "กรุณากรอก name, start_date และ end_date"
            });
        }

        if (new Date(start_date) > new Date(end_date)) {
            return res.status(400).json({
                success: false,
                message: "start_date ต้องไม่มากกว่า end_date"
            });
        }

        // Update
        await db.promise().query(
            `UPDATE trips
             SET name = ?,
                 description = ?,
                 start_date = ?,
                 end_date = ?
             WHERE id = ?`,
            [
                name,
                description || null,
                start_date,
                end_date,
                tripId
            ]
        );

        res.json({
            success: true,
            message: "แก้ไข Trip สำเร็จ"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "ไม่สามารถแก้ไข Trip ได้"
        });
    }
}

async function deleteTrip(req, res) {
    try {
        const userId = req.user.id;
        const tripId = req.params.id;

        // ตรวจว่า User เป็น Owner หรือไม่
        const [members] = await db.promise().query(
            `SELECT role
             FROM trip_members
             WHERE trip_id = ? AND user_id = ?`,
            [tripId, userId]
        );

        if (members.length === 0) {
            return res.status(403).json({
                success: false,
                message: "คุณไม่มีสิทธิ์เข้าถึง Trip นี้"
            });
        }

        if (members[0].role !== "owner") {
            return res.status(403).json({
                success: false,
                message: "เฉพาะ Owner เท่านั้นที่ลบ Trip ได้"
            });
        }

        // ลบ Trip
        const [result] = await db.promise().query(
            "DELETE FROM trips WHERE id = ?",
            [tripId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบ Trip นี้"
            });
        }

        res.json({
            success: true,
            message: "ลบ Trip สำเร็จ"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "ไม่สามารถลบ Trip ได้"
        });
    }
}

async function getTripMembers(req, res) {
    try {
        const userId = req.user.id;
        const tripId = req.params.tripId;

        // ตรวจว่า User เป็นสมาชิกของ Trip หรือไม่
        const [membership] = await db.promise().query(
            `SELECT role
             FROM trip_members
             WHERE trip_id = ? AND user_id = ?`,
            [tripId, userId]
        );

        if (membership.length === 0) {
            return res.status(403).json({
                success: false,
                message: "คุณไม่มีสิทธิ์เข้าถึง Trip นี้"
            });
        }

        // ดึงสมาชิกทั้งหมด
        const [members] = await db.promise().query(
            `SELECT
                u.id,
                u.name,
                u.email,
                tm.role,
                tm.joined_at
             FROM trip_members tm
             INNER JOIN users u
                ON tm.user_id = u.id
             WHERE tm.trip_id = ?
             ORDER BY tm.role = 'owner' DESC, u.name ASC`,
            [tripId]
        );

        res.json({
            success: true,
            data: members
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "ไม่สามารถดึงสมาชิกได้"
        });
    }
}


async function addTripMember(req, res) {
    try {
        const ownerId = req.user.id;
        const tripId = req.params.tripId;

        const {
            email
        } = req.body;

        // ต้องส่ง email มา
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "กรุณาระบุ email"
            });
        }

        // ตรวจว่าเป็น Owner
        const [owner] = await db.promise().query(
            `SELECT role
             FROM trip_members
             WHERE trip_id = ? AND user_id = ?`,
            [tripId, ownerId]
        );

        if (owner.length === 0) {
            return res.status(403).json({
                success: false,
                message: "คุณไม่ได้เป็นสมาชิกของ Trip นี้"
            });
        }

        if (owner[0].role !== "owner") {
            return res.status(403).json({
                success: false,
                message: "เฉพาะ Owner เท่านั้นที่เพิ่มสมาชิกได้"
            });
        }

        // ค้นหา User จาก email
        const [users] = await db.promise().query(
            `SELECT id, name, email
             FROM users
             WHERE email = ?`,
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบ User ที่ใช้อีเมลนี้"
            });
        }

        const user = users[0];

        // ตรวจว่าอยู่ใน Trip แล้วหรือยัง
        const [existingMember] = await db.promise().query(
            `SELECT id
             FROM trip_members
             WHERE trip_id = ? AND user_id = ?`,
            [tripId, user.id]
        );

        if (existingMember.length > 0) {
            return res.status(409).json({
                success: false,
                message: "User นี้เป็นสมาชิกของ Trip อยู่แล้ว"
            });
        }

        // เพิ่มสมาชิก
        await db.promise().query(
            `INSERT INTO trip_members
             (trip_id, user_id, role)
             VALUES (?, ?, 'member')`,
            [tripId, user.id]
        );

        res.status(201).json({
            success: true,
            message: "เพิ่มสมาชิกสำเร็จ",
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: "member"
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "ไม่สามารถเพิ่มสมาชิกได้"
        });
    }
}

async function removeTripMember(req, res) {
    try {
        const ownerId = req.user.id;
        const tripId = req.params.tripId;
        const userId = req.params.userId;

        // ตรวจว่า requester เป็นสมาชิกและเป็น Owner
        const [owner] = await db.promise().query(
            `SELECT role
             FROM trip_members
             WHERE trip_id = ? AND user_id = ?`,
            [tripId, ownerId]
        );

        if (owner.length === 0) {
            return res.status(403).json({
                success: false,
                message: "คุณไม่ได้เป็นสมาชิกของ Trip นี้"
            });
        }

        if (owner[0].role !== "owner") {
            return res.status(403).json({
                success: false,
                message: "เฉพาะ Owner เท่านั้นที่ลบสมาชิกได้"
            });
        }

        // หา Member ที่ต้องการลบ
        const [member] = await db.promise().query(
            `SELECT role
             FROM trip_members
             WHERE trip_id = ? AND user_id = ?`,
            [tripId, userId]
        );

        if (member.length === 0) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบสมาชิกใน Trip นี้"
            });
        }

        // ห้ามลบ Owner
        if (member[0].role === "owner") {
            return res.status(400).json({
                success: false,
                message: "ไม่สามารถลบ Owner ออกจาก Trip ได้"
            });
        }

        // ลบ Member
        await db.promise().query(
            `DELETE FROM trip_members
             WHERE trip_id = ? AND user_id = ?`,
            [tripId, userId]
        );

        res.json({
            success: true,
            message: "ลบสมาชิกสำเร็จ"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "ไม่สามารถลบสมาชิกได้"
        });
    }
}


async function leaveTrip(req, res) {
    try {
        const userId = req.user.id;
        const tripId = req.params.tripId;

        // ตรวจ membership
        const [member] = await db.promise().query(
            `SELECT role
             FROM trip_members
             WHERE trip_id = ? AND user_id = ?`,
            [tripId, userId]
        );

        if (member.length === 0) {
            return res.status(404).json({
                success: false,
                message: "คุณไม่ได้เป็นสมาชิกของ Trip นี้"
            });
        }

        // Owner ออกไม่ได้
        if (member[0].role === "owner") {
            return res.status(400).json({
                success: false,
                message: "Owner ไม่สามารถออกจาก Trip ได้"
            });
        }

        // ลบตัวเองออก
        await db.promise().query(
            `DELETE FROM trip_members
             WHERE trip_id = ? AND user_id = ?`,
            [tripId, userId]
        );

        res.json({
            success: true,
            message: "ออกจาก Trip สำเร็จ"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "ไม่สามารถออกจาก Trip ได้"
        });
    }
}

module.exports = {
    createTrip,
    getTrips,
    getTripById,
    updateTrip,
    deleteTrip,
    getTripMembers,
    addTripMember,
    removeTripMember,
    leaveTrip
};