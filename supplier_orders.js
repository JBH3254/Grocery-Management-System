document.addEventListener('DOMContentLoaded', () => {
    const ordersList = document.getElementById('ordersList');
    const messageDiv = document.getElementById('message');
    const logoutButton = document.getElementById('logoutButton');

    function getToken() {
        return localStorage.getItem('supplierToken');
    }

    async function fetchOrders() {
        const token = getToken();
        if (!token) {
            window.location.href = 'supplier_auth.html'; // אם אין טוקן, חזור למסך ההתחברות
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/suppliers/orders', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token,
                },
            });

            const data = await response.json();

            if (response.ok) {
                displayOrders(data);
            } else {
                messageDiv.textContent = data.message || 'שגיאה בשליפת ההזמנות.';
                messageDiv.className = 'error';
            }
        } catch (error) {
            console.error('שגיאה בשליפת ההזמנות:', error);
            messageDiv.textContent = 'אירעה שגיאה בתקשורת עם השרת בעת שליפת ההזמנות.';
            messageDiv.className = 'error';
        }
    }

    function displayOrders(orders) {
        ordersList.innerHTML = '';
        if (orders && orders.length > 0) {
            orders.forEach(order => {
                const listItem = document.createElement('li');
                const orderDetails = document.createElement('span');
                orderDetails.textContent = `הזמנה ID: ${order.id}, סטטוס: ${order.status}`;
                listItem.appendChild(orderDetails);

                const approveButton = document.createElement('button');
                approveButton.textContent = 'אשר הזמנה';
                approveButton.disabled = order.status !== 'pending';
                approveButton.addEventListener('click', () => approveOrder(order.id));
                listItem.appendChild(approveButton);

                ordersList.appendChild(listItem);
            });
        } else {
            ordersList.textContent = 'אין הזמנות זמינות.';
        }
    }

    async function approveOrder(orderId) {
        const token = getToken();
        if (!token) {
            window.location.href = 'supplier_auth.html';
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/suppliers/orders/${orderId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token,
                },
            });

            const data = await response.json();

            if (response.ok) {
                messageDiv.textContent = data.message || 'ההזמנה אושרה בהצלחה.';
                messageDiv.className = 'success';
                fetchOrders(); // רענון רשימת ההזמנות
            } else {
                messageDiv.textContent = data.message || 'שגיאה באישור ההזמנה.';
                messageDiv.className = 'error';
            }
        } catch (error) {
            console.error('שגיאה באישור ההזמנה:', error);
            messageDiv.textContent = 'אירעה שגיאה בתקשורת עם השרת בעת אישור ההזמנה.';
            messageDiv.className = 'error';
        }
    }

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('supplierToken');
        localStorage.removeItem('supplierUsername');
        window.location.href = 'supplier_auth.html';
    });

    // טעינת ההזמנות בעת טעינת הדף
    fetchOrders();
});