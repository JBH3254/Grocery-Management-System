document.addEventListener('DOMContentLoaded', async () => {
    const ordersList = document.querySelector('#ordersList');
    const logoutButton = document.getElementById('logoutButton');
    const modal = document.getElementById('orderDetailsModal');
    const closeModal = document.getElementById('closeModal');
    const orderDetailsContent = document.getElementById('orderDetailsContent');
    fetchOrders();

    async function fetchOrders() {
        try {
            const response = await fetch('http://localhost:3000/api/grocery/orders');
            const orders = await response.json();

            if (response.ok && Array.isArray(orders)) {
                displayOrders(orders);
            } else {
                ordersList.innerHTML = `<li>שגיאה בטעינת ההזמנות: ${data.message || 'לא ידועה'}</li>`;
            }
        } catch (error) {
            console.error('שגיאה בטעינת ההזמנות:', error);
            ordersList.innerHTML = `<tr><td colspan="4">שגיאה בתקשורת עם השרת.</td></tr>`;
        }
    }
    
    

    function displayOrders(orders) {
        ordersList.innerHTML = '';
        if (orders && orders.length > 0) {
            orders.forEach((order, index) => {
                const listItem = document.createElement('li');
                const viewButton = document.createElement('button');
                viewButton.textContent = 'צפה בהזמנה';
                var HStatus;
                if(order.status === 'pending'){
                    HStatus = 'ממתין לאישור'
                }

                if(order.status === 'processing'){
                    HStatus = 'בתהליך'
                }

                if(order.status === 'completed'){
                    HStatus = 'הושלמה'

                }
                listItem.textContent = `הזמנה: ${index+1},  סטטוס: ${HStatus}`;
                viewButton.addEventListener('click', () => {
                    displayOrderDetails(order, HStatus);
                });
                listItem.appendChild(viewButton);
                ordersList.appendChild(listItem);
            });
        } else {
            ordersList.innerHTML = '<li>אין הזמנות זמינות.</li>';
        }
    }


    function displayOrderDetails(order, HStatus) {
        let orderDetails = `מזהה הזמנה: ${order.orderId}\nשם החברה: ${order.companyName}\nסטטוס: ${HStatus}\nמוצרים:\n`;
        order.products.forEach(product => {
            orderDetails += `מוצר: ${product.productName}, כמות: ${product.quantity}\n`;
        });
        
        orderDetailsContent.textContent = orderDetails;
        modal.style.display = 'block'; 
    }

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('supplierToken');
        localStorage.removeItem('supplierUsername');
        window.location.href = 'supplier_auth.html';
    });
});

