import ExcelJS from 'exceljs';
import { Role } from "./actions";

export const downloadRolesExcel = async (roles: Role[]) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Roles");
    worksheet.columns = [
        { header: "Row Number", key: "rowNumber", width: 12 },
        { header: "Role Name", key: "roleName", width: 15 },
        { header: "Description", key: "description", width: 20 }
    ];
    roles.forEach((role, index) => {
        worksheet.addRow({
            rowNumber: index + 1,
            roleName: role.id,
            description: role.description || ""
        });
    });
    const maxRoleNameLen = roles.length ? Math.max(...roles.map(r => (r.id || "").length)) : 0;
    const roleNameCol = worksheet.getColumn("roleName");
    roleNameCol.width = Math.max(roleNameCol.width ?? 20, maxRoleNameLen + 8, 28);
    worksheet.getRow(1).font = { bold: true };
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Roles.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
};
