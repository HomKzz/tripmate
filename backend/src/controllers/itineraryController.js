const db = require("../config/db");

// POST /api/trips/:tripId/itineraries
async function createItinerary(req, res) {
    try {
        const { tripId } = req.params;
        const {
            title,
            description,
            location,
            start_datetime,
            end_datetime
        } = req.body;

        const userId = req.user.id;

        // ตรวจสอบข้อมูลที่จำเป็น
        if (!title || !start_datetime) {
            return res.status(400).json({
                success: false,
                message: "กรุณากรอก title และ start_datetime"
            });
        }

        // ตรวจสอบว่า user เป็นสมาชิกของ trip หรือไม่
        const [members] = await db
            .promise()
            .query(
                `SELECT id
                 FROM trip_members
                 WHERE trip_id = ? AND user_id = ?`,
                [tripId, userId]
            );

        if (members.length === 0) {
            return res.status(403).json({
                success: false,
                message: "คุณไม่ได้เป็นสมาชิกของ Trip นี้"
            });
        }

        // ตรวจสอบเวลา
        if (
            end_datetime &&
            new Date(end_datetime) < new Date(start_datetime)
        ) {
            return res.status(400).json({
                success: false,
                message: "end_datetime ต้องไม่ก่อน start_datetime"
            });
        }

        // เพิ่ม itinerary
        const [result] = await db
            .promise()
            .query(
                `INSERT INTO itineraries
                (
                    trip_id,
                    title,
                    description,
                    location,
                    start_datetime,
                    end_datetime,
                    created_by
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    tripId,
                    title,
                    description || null,
                    location || null,
                    start_datetime,
                    end_datetime || null,
                    userId
                ]
            );

        res.status(201).json({
            success: true,
            message: "สร้าง Itinerary สำเร็จ",
            data: {
                id: result.insertId,
                trip_id: Number(tripId),
                title,
                description: description || null,
                location: location || null,
                start_datetime,
                end_datetime: end_datetime || null,
                created_by: userId
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


// GET /api/trips/:tripId/itineraries
async function getItineraries(req, res) {
    try {
        const { tripId } = req.params;
        const userId = req.user.id;

        // ตรวจสอบว่า user เป็นสมาชิกของ trip หรือไม่
        const [members] = await db
            .promise()
            .query(
                `SELECT id
                 FROM trip_members
                 WHERE trip_id = ? AND user_id = ?`,
                [tripId, userId]
            );

        if (members.length === 0) {
            return res.status(403).json({
                success: false,
                message: "คุณไม่ได้เป็นสมาชิกของ Trip นี้"
            });
        }

        // ดึง itinerary
        const [itineraries] = await db
            .promise()
            .query(
                `SELECT
                    i.id,
                    i.trip_id,
                    i.title,
                    i.description,
                    i.location,
                    i.start_datetime,
                    i.end_datetime,
                    i.created_by,
                    u.name AS created_by_name,
                    i.created_at
                 FROM itineraries i
                 JOIN users u
                    ON i.created_by = u.id
                 WHERE i.trip_id = ?
                 ORDER BY i.start_datetime ASC`,
                [tripId]
            );

        res.json({
            success: true,
            data: itineraries
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดที่ Server"
        });
    }
}


// PUT /api/itineraries/:id
async function updateItinerary(req, res) {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            location,
            start_datetime,
            end_datetime
        } = req.body;

        const userId = req.user.id;

        if (!title || !start_datetime) {
            return res.status(400).json({
                success: false,
                message: "กรุณากรอก title และ start_datetime"
            });
        }

        // ตรวจสอบว่า itinerary มีอยู่หรือไม่
        const [itineraries] = await db
            .promise()
            .query(
                `SELECT *
                 FROM itineraries
                 WHERE id = ?`,
                [id]
            );

        if (itineraries.length === 0) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบ Itinerary"
            });
        }

        const itinerary = itineraries[0];

        // ตรวจสอบว่า user เป็นสมาชิกของ Trip
        const [members] = await db
            .promise()
            .query(
                `SELECT id
                 FROM trip_members
                 WHERE trip_id = ? AND user_id = ?`,
                [itinerary.trip_id, userId]
            );

        if (members.length === 0) {
            return res.status(403).json({
                success: false,
                message: "คุณไม่ได้เป็นสมาชิกของ Trip นี้"
            });
        }

        if (
            end_datetime &&
            new Date(end_datetime) < new Date(start_datetime)
        ) {
            return res.status(400).json({
                success: false,
                message: "end_datetime ต้องไม่ก่อน start_datetime"
            });
        }

        await db
            .promise()
            .query(
                `UPDATE itineraries
                 SET
                    title = ?,
                    description = ?,
                    location = ?,
                    start_datetime = ?,
                    end_datetime = ?
                 WHERE id = ?`,
                [
                    title,
                    description || null,
                    location || null,
                    start_datetime,
                    end_datetime || null,
                    id
                ]
            );

        res.json({
            success: true,
            message: "แก้ไข Itinerary สำเร็จ"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดที่ Server"
        });
    }
}


// DELETE /api/itineraries/:id
async function deleteItinerary(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // ตรวจสอบ itinerary
        const [itineraries] = await db
            .promise()
            .query(
                `SELECT *
                 FROM itineraries
                 WHERE id = ?`,
                [id]
            );

        if (itineraries.length === 0) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบ Itinerary"
            });
        }

        const itinerary = itineraries[0];

        // ตรวจสอบว่า user เป็นสมาชิก Trip
        const [members] = await db
            .promise()
            .query(
                `SELECT id
                 FROM trip_members
                 WHERE trip_id = ? AND user_id = ?`,
                [itinerary.trip_id, userId]
            );

        if (members.length === 0) {
            return res.status(403).json({
                success: false,
                message: "คุณไม่ได้เป็นสมาชิกของ Trip นี้"
            });
        }

        await db
            .promise()
            .query(
                `DELETE FROM itineraries
                 WHERE id = ?`,
                [id]
            );

        res.json({
            success: true,
            message: "ลบ Itinerary สำเร็จ"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดที่ Server"
        });
    }
}


module.exports = {
    createItinerary,
    getItineraries,
    updateItinerary,
    deleteItinerary
};