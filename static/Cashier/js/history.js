////////////////////////////////////////////Lấy thông tin các bill////////////////////////////////////////////////
let lastBillData = "";

function getTableNameByIdNew(tableId) {
  if (!tableId) {
    console.warn("Vui lòng truyền vào tableID");
    return null;
  }

  const areasStr = localStorage.getItem("areas");

  if (!areasStr) {
    console.warn("Không tìm thấy dữ liệu 'areas' trong localStorage");
    return null;
  }

  try {
    const areas = JSON.parse(areasStr);

    if (typeof areas !== "object" || areas === null) {
      console.warn("'areas' không phải là một object hợp lệ");
      return null;
    }

    // Duyệt qua từng khu vực (Inside, Outside, v.v.)
    for (const areaName in areas) {
      const tables = areas[areaName];

      if (!Array.isArray(tables)) continue;

      const foundTable = tables.find(table => table.tableID === tableId);

      if (foundTable) {
        return foundTable.name || null;
      }
    }

    console.warn(`Không tìm thấy tableID: ${tableId} trong bất kỳ khu vực nào`);
    return null;

  } catch (error) {
    console.error("Lỗi khi parse JSON từ 'areas':", error);
    return null;
  }
}
