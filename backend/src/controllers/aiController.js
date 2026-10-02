function getTextValue(value, fallback = "ไม่ระบุ", maxLength = 240) {
    if (value === undefined || value === null) return fallback;
    return String(value).trim().slice(0, maxLength) || fallback;
}

function getJsonText(text) {
    const trimmedText = String(text || "").trim();
    const fencedMatch = trimmedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    return fencedMatch ? fencedMatch[1].trim() : trimmedText;
}

function repairCommonJsonErrors(text) {
    return text
        .replace(/("description")\s*,\s*"/g, "$1:\"")
        .replace(/,\s*([}\]])/g, "$1");
}

async function createTripPlan(req, res) {
    const {
        destination,
        startDate,
        endDate,
        travelers,
        budget,
        style,
        interests,
        constraints
    } = req.body || {};

    if (!destination || !startDate || !endDate) {
        return res.status(400).json({
            success: false,
            message: "กรุณาระบุสถานที่ วันเริ่มต้น และวันสิ้นสุด"
        });
    }

    if (new Date(startDate) > new Date(endDate)) {
        return res.status(400).json({
            success: false,
            message: "วันเริ่มต้นต้องไม่มากกว่าวันสิ้นสุด"
        });
    }

    const travelerCount = Number(travelers || 1);
    if (!Number.isInteger(travelerCount) || travelerCount < 1 || travelerCount > 100) {
        return res.status(400).json({
            success: false,
            message: "จำนวนคนต้องอยู่ระหว่าง 1 ถึง 100 คน"
        });
    }

    const apiKeys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2]
        .map((key) => key?.trim())
        .filter(Boolean);

    if (apiKeys.length === 0) {
        return res.status(503).json({
            success: false,
            message: "ยังไม่ได้ตั้งค่า GEMINI_API_KEY บนเซิร์ฟเวอร์"
        });
    }

        const prompt = `วางแผนเที่ยวภาษาไทยแบบกระชับจากข้อมูลนี้:
สถานที่=${getTextValue(destination)}; วันที่=${getTextValue(startDate)} ถึง ${getTextValue(endDate)}; คน=${travelerCount}; งบ=${getTextValue(budget)}; สไตล์=${getTextValue(style)}; สนใจ/ข้อจำกัด=${getTextValue(interests)} ${getTextValue(constraints)}

ตอบ JSON เท่านั้น ห้าม Markdown:
{"summary":"สรุปสั้น","days":[{"date":"YYYY-MM-DD","activities":[{"title":"ชื่อ","description":"สั้นๆ","start_time":"09:00","end_time":"11:00","estimated_cost":0}]}],"estimated_total":0,"notes":["สั้นๆ"]}

ให้ไม่เกิน 3 กิจกรรมต่อวัน, description สั้นไม่เกิน 100 ตัวอักษร, notes ไม่เกิน 2 ข้อ และราคาเป็นค่าประมาณเท่านั้น`;

    try {
        const models = [process.env.GEMINI_MODEL || "gemini-3.8-flash", process.env.GEMINI_MODEL_2 || "gemini-flash-lite-latest"]
            .filter((model, index, list) => list.indexOf(model) === index);
        const maxOutputTokens = Number(process.env.GEMINI_MAX_OUTPUT_TOKENS || 2200);
        const requestBody = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.5,
                maxOutputTokens
            }
        };
        let response;
        let responseData;

        requestLoop:
        for (const model of models) {
            for (const apiKey of apiKeys) {
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

                for (let attempt = 0; attempt < 3; attempt += 1) {
                    response = await fetch(apiUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(requestBody)
                    });
                    responseData = await response.json();

                    if (response.ok) break requestLoop;

                    const canRetry = [429, 503].includes(response.status) && attempt < 2;
                    if (!canRetry) break;

                    await new Promise((resolve) => setTimeout(resolve, 800 * (attempt + 1)));
                }
            }
        }

        if (!response.ok) {
            console.error("Gemini API error:", responseData);
            const isTemporary = [429, 503].includes(response.status);
            return res.status(isTemporary ? 503 : 502).json({
                success: false,
                message: isTemporary
                    ? "ขณะนี้ AI มีผู้ใช้งานจำนวนมาก กรุณาลองใหม่อีกครั้งในอีกสักครู่"
                    : "ไม่สามารถสร้างแผนเที่ยวจาก AI ได้ในขณะนี้"
            });
        }

        const generatedText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
        const finishReason = responseData.candidates?.[0]?.finishReason;
        if (finishReason === "MAX_TOKENS") {
            return res.status(502).json({
                success: false,
                message: "แผนจาก AI ยาวเกินไป กรุณาลองลดจำนวนวันหรือข้อมูลเพิ่มเติมแล้วลองใหม่"
            });
        }

        if (!generatedText) {
            return res.status(502).json({
                success: false,
                message: "AI ไม่ได้ส่งแผนเที่ยวกลับมา"
            });
        }

        let plan;
        try {
            const jsonText = getJsonText(generatedText);
            try {
                plan = JSON.parse(jsonText);
            } catch (parseError) {
                plan = JSON.parse(repairCommonJsonErrors(jsonText));
            }
        } catch (parseError) {
            console.error("Invalid Gemini JSON response:", generatedText);
            return res.status(502).json({
                success: false,
                message: "รูปแบบแผนเที่ยวจาก AI ไม่ถูกต้อง"
            });
        }

        return res.json({
            success: true,
            data: plan
        });
    } catch (error) {
        console.error("Trip planning error:", error);
        return res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการสร้างแผนเที่ยว"
        });
    }
}

module.exports = {
    createTripPlan
};
