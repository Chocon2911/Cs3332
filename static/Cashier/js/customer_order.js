////////////////////////////////////////////Confirm Order////////////////////////////////////////////////
class OrderUpdateStatus_Request1
{
    constructor(orderId, newStatus)
    {
        this.orderId = orderId;
        this.newStatus = newStatus;
    }

    toJson()
    {
        return {
            orderID: this.orderId,
            newStatus: this.newStatus
        }
    }
}
async function takeOrder(id) {
    const token = getCookie("token");
    const req = new OrderUpdateStatus_Request1(id, "PENDING_PAYMENT");
    const res = await fetch("/cashier/update_order_status", {
        method: "POST",
        headers: {
            "Authorization": token,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(req.toJson())
    });

    if (res.status == 200)
    {
        alert("Order Confirmed!!!");
        window.location.reload();
    }
    else if (res.status >= 400 && res.status <= 600) {
        if (res.status === 401) {
            window.location.href = '/manager/login';
            throw new Error('Unauthorized');
        }
        const err = await res.json();
        console.error("Server error: " + err['error']);
    }
    else 
    {
        const data = await res.json();
        console.error("Unexpected error: " + data['error']);
    }
}
