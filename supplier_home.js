document.addEventListener('DOMContentLoaded', () => {
    const usernameDisplay = document.getElementById('usernameDisplay');
    const ordersList = document.getElementById('ordersList');
    const logoutButton = document.getElementById('logoutButton');

    function getToken() {
        return localStorage.getItem('supplierToken');
    }

    function getUsername() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('username') || localStorage.getItem('supplierUsername');
    }

    async function fetchOrders() {
        const token = getToken();
    
        if (!token) {
            window.location.href = 'supplier_auth.html';
            return;
        }
    
        try {
            const response = await fetch(`http://localhost:3000/api/suppliers/orders`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // שליחת הטוקן בכותרת Authorization
                },
            });
    
            const data = await response.json();
    
            if (response.ok) {
                displayOrders(data);
            } else {
                ordersList.innerHTML = `<li>שגיאה בטעינת ההזמנות: ${data.message || 'לא ידועה'}</li>`;
            }
        } catch (error) {
            console.error('שגיאה בשליפת ההזמנות:', error);
            ordersList.innerHTML = '<li>אירעה שגיאה בתקשורת עם השרת.</li>';
        }
    }

    function displayOrders(orders) {
        console.log(orders);
        ordersList.innerHTML = '';
        if (orders && orders.length > 0) {
            orders.forEach(order => {
                const listItem = document.createElement('li');
                let orderText = `הזמנה ID: ${order.id}, סטטוס: ${order.status}, מוצרים: `;
    
                if (order.items && order.items.length > 0) {
                    const productList = order.items.map(item => `${item.productId} (${item.quantity})`).join(', ');
                    orderText += productList;
                } else {
                    orderText += 'אין מוצרים בהזמנה זו.';
                }
    
                listItem.textContent = orderText;
                ordersList.appendChild(listItem);
            });
        } else {
            ordersList.innerHTML = '<li>אין הזמנות זמינות.</li>';
        }
    }

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('supplierToken');
        localStorage.removeItem('supplierUsername');
        window.location.href = 'supplier_auth.html';
    });

    const username = getUsername();
    if (username) {
        usernameDisplay.textContent = username;
        fetchOrders();
    } else {
        window.location.href = 'supplier_auth.html';
    }
});