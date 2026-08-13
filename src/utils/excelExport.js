import * as XLSX from "xlsx";

// Builds and triggers:
// Order_Panipat_[Current_Date].xlsx

export function exportOrdersToExcel(
  orders,
  dateLabel
) {
  const rows = orders.map(
    (order) => ({
      "Employee Name":
        order.employeeName,

      "Veg Bowl 1 (Qty)":
        `${order.bowl1.name} (${order.bowl1.qty})`,

      "Veg Bowl 2 (Qty)":
        `${order.bowl2.name} (${order.bowl2.qty})`,

      "Breads (Qty)":
        `${order.bread.name} (${order.bread.qty})`,

      "Rice (Qty)":
        `${order.rice.name} (${order.rice.qty})`,

      "Sweet/Raita (Qty)":
        `${order.extra.name} (${order.extra.qty})`,

      "Salad (Qty)":
        `${order.salad.name} (${order.salad.qty})`,

      "Submitted At":
        order.submittedAt,
    })
  );

  const worksheet =
    XLSX.utils.json_to_sheet(
      rows
    );

  worksheet["!cols"] = [
    { wch: 22 },
    { wch: 24 },
    { wch: 24 },
    { wch: 22 },
    { wch: 18 },
    { wch: 24 },
    { wch: 18 },
    { wch: 20 },
  ];

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Orders"
  );

  const fileName =
    `Order_Panipat_${dateLabel}.xlsx`;

  XLSX.writeFile(
    workbook,
    fileName
  );
}