import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { expenseService } from "../../services";
import { Alert, Button, FormField, Modal } from "../ui";

function toDateInputValue(date) {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 10);
}

function createDefaultForm() {
    return {
        title: "",
        amount: "",
        currency: "THB",
        expense_date: toDateInputValue(new Date()),
        description: "",
        expense_time: "",
    };
}

function ExpenseModal({ tripId, isOpen, onClose, onCreated }) {
    const [form, setForm] = useState(createDefaultForm);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    function updateField(field, value) {
        setForm((currentForm) => ({ ...currentForm, [field]: value }));
        setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
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
        const trimmedTitle = form.title.trim();
        const normalizedCurrency = form.currency.trim().toUpperCase();

        if (!trimmedTitle) {
            nextErrors.title = "กรอกรายการค่าใช้จ่าย";
        } else if (trimmedTitle.length > 100) {
            nextErrors.title = "ชื่อรายการค่าใช้จ่ายต้องไม่เกิน 100 ตัวอักษร";
        }

        if (!form.amount || Number(form.amount) <= 0) {
            nextErrors.amount = "กรอกจำนวนเงินที่มากกว่า 0";
        }

        if (!/^[A-Z]{3}$/.test(normalizedCurrency)) {
            nextErrors.currency = "ใช้รหัสสกุลเงิน 3 ตัวอักษร เช่น THB, JPY, USD";
        }

        if (!form.expense_date) {
            nextErrors.expense_date = "เลือกวันที่จ่ายเงิน";
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
            const response = await expenseService.create(tripId, {
                title: form.title.trim(),
                amount: Number(form.amount),
                currency: form.currency.trim().toUpperCase(),
                expense_date: form.expense_date,
                time_expensed: form.expense_time || null,
                description: form.description.trim() || null,
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
            title="เพิ่มค่าใช้จ่ายใหม่"
            description="กรอกค่าใช้จ่ายของทริปเพื่อให้คุณสามารถติดตามและจัดการงบประมาณได้อย่างมีประสิทธิภาพ"
            size="md"
            footer={
                <>
                    <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>ยกเลิก</Button>
                    <Button type="submit" form="create-expense-form" disabled={isSubmitting}>
                        {isSubmitting ? <><LoaderCircle className="animate-spin" size={18} />กำลังบันทึก...</> : "บันทึกค่าใช้จ่าย"}
                    </Button>
                </>
            }
        >
            <form id="create-expense-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
                {submitError && <Alert>{submitError}</Alert>}

                <FormField
                    label="รายการค่าใช้จ่าย"
                    placeholder="เช่น หมูกระทะ, ตั๋วเครื่องบิน, ที่พัก"
                    value={form.title}
                    onChange={(event) => updateField("title", event.target.value)}
                    maxLength={100}
                    error={errors.title}
                    data-modal-autofocus
                    required
                    disabled={isSubmitting}
                />

                <div>
                    <label htmlFor="create-expense-description" className="text-sm font-semibold text-[#365544]">รายละเอียด (ไม่บังคับ)</label>
                    <textarea
                        id="create-expense-description"
                        value={form.description}
                        onChange={(event) => updateField("description", event.target.value)}
                        rows={3}
                        maxLength={500}
                        placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับค่าใช้จ่าย เช่น สถานที่, วันที่, หรือเหตุผลในการใช้จ่าย"
                        disabled={isSubmitting}
                        className="mt-2 w-full resize-none rounded-xl border border-[#dce5d7] bg-white px-4 py-3 text-sm text-[#1d3b2e] outline-none transition placeholder:text-[#a1ada3] focus:border-[#83a76c] focus:ring-4 focus:ring-[#e5efdc] disabled:cursor-not-allowed disabled:bg-[#f5f7f2]"
                    />
                    <p className="mt-1.5 text-right text-xs text-[#91a094]">{form.description.length}/500</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                        label="จำนวนเงิน"
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="0.00"
                        value={form.amount}
                        onChange={(event) => updateField("amount", event.target.value)}
                        error={errors.amount}
                        required
                        disabled={isSubmitting}
                    />
                    <FormField
                        label="สกุลเงิน"
                        maxLength={3}
                        placeholder="THB"
                        value={form.currency}
                        onChange={(event) => updateField("currency", event.target.value.toUpperCase())}
                        error={errors.currency}
                        required
                        disabled={isSubmitting}
                    />
                </div>

                <FormField
                    label="วันที่จ่ายเงิน"
                    type="date"
                    value={form.expense_date}
                    onChange={(event) => updateField("expense_date", event.target.value)}
                    error={errors.expense_date}
                    required
                    disabled={isSubmitting}
                />
                <FormField
                    label="เวลาที่จ่ายเงิน (ไม่บังคับ)"
                    type="time"
                    value={form.expense_time}
                    onChange={(event) => updateField("expense_time", event.target.value)}
                    error={errors.expense_time}
                    disabled={isSubmitting}
                />
            </form>
        </Modal>
    );
}

export default ExpenseModal;
