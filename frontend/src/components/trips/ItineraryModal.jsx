import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { itineraryService } from "../../services";
import { Alert, Button, FormField, Modal } from "../ui";

function toDateTimeInputValue(date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function createDefaultForm() {
  const startDate = new Date();
  startDate.setSeconds(0, 0);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  return {
    title: "",
    description: "",
    location: "",
    start_datetime: toDateTimeInputValue(startDate),
    end_datetime: toDateTimeInputValue(endDate),
  };
}

function ItineraryModal({ tripId, isOpen, onClose, onCreated }) {
  const [form, setForm] = useState(createDefaultForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field, value) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
    setSubmitError("");
  }

  function updateDateTimePart(field, part, value) {
    const currentValue = form[field] || "";
    const [currentDate = "", currentTime = ""] = currentValue.split("T");
    const nextDate = part === "date" ? value : currentDate;
    const nextTime = part === "time" ? value : currentTime;

    updateField(
      field,
      nextDate && nextTime ? `${nextDate}T${nextTime}` : "",
    );
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
    const trimmedStartDatetime = form.start_datetime.trim();
    const trimmedEndDatetime = form.end_datetime.trim();

    if (!trimmedTitle) {
      nextErrors.title = "กรอกชื่อกิจกรรม";
    } else if (trimmedTitle.length > 100) {
      nextErrors.title = "ชื่อกิจกรรมต้องไม่เกิน 100 ตัวอักษร";
    }

    if (!trimmedStartDatetime) {
      nextErrors.start_datetime = "เลือกวันที่เริ่มต้น";
    }

    if (trimmedEndDatetime &&
      trimmedStartDatetime &&
      new Date(trimmedEndDatetime) < new Date(trimmedStartDatetime)
    ) {
      nextErrors.end_datetime = "เวลาสิ้นสุดต้องไม่ก่อนเวลาเริ่มต้น";
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
      const response = await itineraryService.create(tripId, {
        title: form.title.trim(),
        description: form.description.trim() || null,
        location: form.location.trim() || null,
        start_datetime: form.start_datetime || null,
        end_datetime: form.end_datetime || null,
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
      title="เพิ่มกิจกรรมในแผนเดินทาง"
      description="เพิ่มรายละเอียดสำคัญของกิจกรรม เพื่อให้ทุกคนในทริปวางแผนได้ตรงกัน"
      size="md"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            ยกเลิก
          </Button>
          <Button
            type="submit"
            form="create-itinerary-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="animate-spin" size={18} />
                กำลังบันทึก...
              </>
            ) : (
                "บันทึกกิจกรรม"
            )}
          </Button>
        </>
      }
    >
      <form
        id="create-itinerary-form"
        onSubmit={handleSubmit}
        className="space-y-5"
        noValidate
      >
        {submitError && <Alert>{submitError}</Alert>}

        <FormField
            label="ชื่อกิจกรรม"
            placeholder="เช่น เช็กอินโรงแรม, ทานอาหารเย็น, เที่ยวชมวัด"
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
          maxLength={100}
          error={errors.title}
          data-modal-autofocus
          required
          disabled={isSubmitting}
        />

        <div>
          <label
            htmlFor="create-itinerary-description"
            className="text-sm font-semibold text-[#365544]"
          >
            รายละเอียด (ไม่บังคับ)
          </label>
          <textarea
            id="create-itinerary-description"
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            rows={2}
            maxLength={500}
            placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับกิจกรรม เช่น เวลาเปิด-ปิด, สิ่งที่ต้องเตรียม, หรือคำแนะนำอื่น ๆ"
            disabled={isSubmitting}
            className="mt-2 w-full resize-none rounded-xl border border-[#dce5d7] bg-white px-4 py-3 text-sm text-[#1d3b2e] outline-none transition placeholder:text-[#a1ada3] focus:border-[#83a76c] focus:ring-4 focus:ring-[#e5efdc] disabled:cursor-not-allowed disabled:bg-[#f5f7f2]"
          />
            <p className="mt-1.5 text-right text-xs text-[#91a094]">
              {form.description.length}/500
            </p>
        </div>

        <FormField
          label="สถานที่ (ไม่บังคับ)"
          placeholder="เช่น สนามบินสุวรรณภูมิ หรือร้านอาหาร"
          value={form.location}
          onChange={(event) => updateField("location", event.target.value)}
          maxLength={100}
          error={errors.location}
          disabled={isSubmitting}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3 rounded-2xl border border-[#e4eade] p-4">
            <p className="text-sm font-bold text-[#365544]">เริ่มต้น</p>
            <FormField
              label="วันที่"
              type="date"
              value={form.start_datetime.slice(0, 10)}
              onChange={(event) =>
                updateDateTimePart("start_datetime", "date", event.target.value)
              }
              error={errors.start_datetime}
              required
              disabled={isSubmitting}
            />
            <FormField
              label="เวลา"
              type="time"
              value={form.start_datetime.slice(11, 16)}
              onChange={(event) =>
                updateDateTimePart("start_datetime", "time", event.target.value)
              }
              error={errors.start_datetime}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-3 rounded-2xl border border-[#e4eade] p-4">
            <p className="text-sm font-bold text-[#365544]">สิ้นสุด (ไม่บังคับ)</p>
            <FormField
              label="วันที่"
              type="date"
              min={form.start_datetime.slice(0, 10) || undefined}
              value={form.end_datetime.slice(0, 10)}
              onChange={(event) =>
                updateDateTimePart("end_datetime", "date", event.target.value)
              }
              error={errors.end_datetime}
              disabled={isSubmitting}
            />
            <FormField
              label="เวลา"
              type="time"
              value={form.end_datetime.slice(11, 16)}
              onChange={(event) =>
                updateDateTimePart("end_datetime", "time", event.target.value)
              }
              error={errors.end_datetime}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default ItineraryModal;
