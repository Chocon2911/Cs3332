// ============================= Cookie ====================================
function getCookie(name) {
    const cookieArr = document.cookie.split(";");
    for (let i = 0; i < cookieArr.length; i++) {
      const cookiePair = cookieArr[i].split("=");
      if (name === cookiePair[0].trim()) {
        return cookiePair[1];
      }
    }
    return null;
}

/*
function getCookie(name) {
    const cookieArr = document.cookie.split(";");
    for (let pair of cookieArr) {
        const [key, val] = pair.split("=").map(s => s.trim());
        if (key === name) return val;
    }
    return null;
}
*/

function valid() {
    const token = getCookie("token");
    const role  = getCookie("role");
  
    if (token !== "1234" || role !== "storageManager") {
      window.location.href = "/storage_manager/error"; 
      return false;
    }
    return true;
}

// convert Unix timestamp to human-readable date
function unix2date(ts) {
  // ts is in seconds; Date expects milliseconds
  const d = new Date(Number(ts));
  return d.toLocaleDateString(); // comment: converts to DD/MM/YYYY or local format
}

function date2unix(dateStr) {
  const [day, month, year] = dateStr.split('/');
  const date = new Date(`${year}-${month}-${day}`);
  return date.getTime(); // Trả về timestamp dạng milliseconds
}