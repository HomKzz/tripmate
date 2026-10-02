import { Receipt } from "lucide-react";
import { formatDate } from "../../utils/trip";
import { Button, Modal, TextField } from "../ui";

function ExpenseDetailsModal({ expense, isOpen, onClose }) {
  if (!expense) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={expense.title || "รายละเอียดค่าใช้จ่าย"}
      description="ข้อมูลรายการค่าใช้จ่ายของทริปนี้"
      size="md"
      footer={
        <Button variant="outline" onClick={onClose}>
          ปิดหน้าต่าง
        </Button>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-3 rounded-2xl bg-[#edf4e8] p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#6b9355] shadow-sm">
            <Receipt size={21} />
          </span>
          <div>
            <p className="text-xs font-semibold text-[#7a8b7e]">จำนวนเงิน</p>
            <p className="mt-1 text-xl font-extrabold text-[#246b4d]">
              {Number(expense.amount || 0).toLocaleString()}{" "}
              {expense.currency || ""}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="วันที่จ่ายเงิน"
            value={formatDate(expense.expense_date)}
          />
          <TextField
            label="เวลาที่จ่ายเงิน"
            value={expense.time_expensed}
            placeholder="ไม่ได้ระบุเวลา"
          />
        </div>
        <TextField label="ผู้จ่าย" value={expense.paid_by_name} />
        <TextField
          label="รายละเอียดเพิ่มเติม"
          value={expense.description}
          placeholder="ไม่มีรายละเอียดเพิ่มเติม"
        />
      </div>
    </Modal>
  );
}

export default ExpenseDetailsModal;
