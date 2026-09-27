import { useState } from "react";
import { CalendarDays, LoaderCircle } from "lucide-react";
import { tripService } from "../../services";
import { getTripDuration } from "../../utils/trip";
import { Alert, Button, FormField, Modal } from "../ui";

function toDateInputValue(date) {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 10);
}

function createDefaultForm() {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 3);

    return {
        name: "",
        description: "",
        start_date: toDateInputValue(startDate),
        end_date: toDateInputValue(endDate)
    };
}

function CreateTripModal({ isOpen, onClose, onCreated }) {
    const [form, setForm] = useState(createDefaultForm);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const duration = getTripDuration(form.start_date, form.end_date);

    function updateField(field, value) {
        setForm((currentForm) => ({ ...currentForm, [field]: value }));
        setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
        setSubmitError("");
    }

    function handleStartDateChange(value) {
        setForm((currentForm) => ({
            ...currentForm,
            start_date: value,
            end_date: currentForm.end_date && currentForm.end_date < value
                ? value
                : currentForm.end_date
        }));
        setErrors((currentErrors) => ({ ...currentErrors, start_date: undefined, end_date: undefined }));
        setSubmitError("");
    }

    function resetForm() {
        setForm(createDefaultForm());
        setErrors({});
        setSubmitError("");
    }

    function handleClose() {
        if (isSubmitting) return;

        resetForm();
        onClose();
    }

    function validate() {
        const nextErrors = {};
        const trimmedName = form.name.trim();

        if (!trimmedName) {
            nextErrors.name = "กรอกชื่อทริป";
        } else if (trimmedName.length > 100) {
            nextErrors.name = "ชื่อทริปต้องไม่เกิน 100 ตัวอักษร";
        }

        if (!form.start_date) {
            nextErrors.start_date = "เลือกวันที่เริ่มต้น";
        }

        if (!form.end_date) {
            nextErrors.end_date = "เลือกวันที่สิ้นสุด";
        } else if (form.start_date && form.end_date < form.start_date) {
            nextErrors.end_date = "วันที่สิ้นสุดต้องไม่น้อยกว่าวันที่เริ่มต้น";
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (isSubmitting || !validate()) return;

        setIsSubmitting(true);
        setSubmitError("");

        try {
            const response = await tripService.create({
                name: form.name.trim(),
                description: form.description.trim() || null,
                start_date: form.start_date,
                end_date: form.end_date
            });

            resetForm();
            onClose();
            onCreated?.(response.data);
        } catch (requestError) {
            setSubmitError(requestError.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="สร้างทริปใหม่"
            description="เริ่มวางแผนการเดินทางครั้งใหม่ แล้วชวนเพื่อนมาร่วมกันได้ทันที"
            size="md"
            footer={
                <>
                    <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>ยกเลิก</Button>
                    <Button type="submit" form="create-trip-form" disabled={isSubmitting}>
                        {isSubmitting ? <><LoaderCircle className="animate-spin" size={18} />กำลังสร้างทริป...</> : "สร้างทริป"}
                    </Button>
                </>
            }
        >
            <form id="create-trip-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
                {submitError && <Alert>{submitError}</Alert>}

                <FormField
                    label="ชื่อทริป"
                    placeholder="เช่น เชียงใหม่ 4 วัน 3 คืน"
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    maxLength={100}
                    error={errors.name}
                    hint="ตั้งชื่อที่จำง่ายสำหรับทริปของคุณ"
                    data-modal-autofocus
                    required
                    disabled={isSubmitting}
                />

                <div>
                    <label htmlFor="create-trip-description" className="text-sm font-semibold text-[#365544]">รายละเอียด (ไม่บังคับ)</label>
                    <textarea
                        id="create-trip-description"
                        value={form.description}
                        onChange={(event) => updateField("description", event.target.value)}
                        rows={3}
                        maxLength={500}
                        placeholder="บอกเพื่อน ๆ ให้รู้ว่าครั้งนี้เราจะไปไหนบ้าง"
                        disabled={isSubmitting}
                        className="mt-2 w-full resize-none rounded-xl border border-[#dce5d7] bg-white px-4 py-3 text-sm text-[#1d3b2e] outline-none transition placeholder:text-[#a1ada3] focus:border-[#83a76c] focus:ring-4 focus:ring-[#e5efdc] disabled:cursor-not-allowed disabled:bg-[#f5f7f2]"
                    />
                    <p className="mt-1.5 text-right text-xs text-[#91a094]">{form.description.length}/500</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                        label="วันที่เริ่มต้น"
                        type="date"
                        value={form.start_date}
                        onChange={(event) => handleStartDateChange(event.target.value)}
                        error={errors.start_date}
                        required
                        disabled={isSubmitting}
                    />
                    <FormField
                        label="วันที่สิ้นสุด"
                        type="date"
                        min={form.start_date || undefined}
                        value={form.end_date}
                        onChange={(event) => updateField("end_date", event.target.value)}
                        error={errors.end_date}
                        required
                        disabled={isSubmitting}
                    />
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-[#f1f7ea] px-4 py-3 text-sm font-medium text-[#577733]">
                    <CalendarDays size={18} />
                    {duration > 0 ? `ใช้เวลาเดินทาง ${duration} วัน` : "เลือกวันที่เพื่อดูจำนวนวันที่เดินทาง"}
                </div>
            </form>
        </Modal>
    );
}

export default CreateTripModal;
