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
                const inProcessOrders = orders.filter(order => order.status === 'processing');
                displayOrders(inProcessOrders);
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
                viewButton.addEventListener('click', () => {
                    displayOrderDetails(order);
                });

                listItem.textContent = `הזמנה: ${index+1},  סטטוס: בתהליך`;
                const statusButton = document.createElement('button');
                statusButton.textContent = 'אישור קבלה';
                statusButton.addEventListener('click', () => {
                const changeStatus = approveOrder(order);
                    if(changeStatus){
                        statusButton.style.display = 'none';
                        listItem.textContent = `הזמנה: ${index+1},  סטטוס: הושלמה`;
                        listItem.appendChild(viewButton);
                    }
                });
                listItem.appendChild(statusButton);
                listItem.appendChild(viewButton);
                ordersList.appendChild(listItem);
            });
        } else {
            ordersList.innerHTML = '<li>אין הזמנות זמינות.</li>';
        }
    }


    function displayOrderDetails(order) {
        let orderDetails = `מזהה הזמנה: ${order.orderId}\nשם החברה: ${order.companyName}\nסטטוס: בתהליך\nמוצרים:\n`;
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

    async function approveOrder(order) {
        try {
            const response = await fetch(`http://localhost:3000/api/grocery/orders/${order.orderId}/received`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            const data = await response.json();
    
            if (response.ok) {
                alert(data.message || 'ההזמנה אושרה בהצלחה.');
                return true;
            } else {
                alert(data.message || 'שגיאה באישור ההזמנה.');
                return false;
            }
        } catch (error) {
            console.error('שגיאה בתקשורת עם השרת:', error);
            alert('שגיאה בתקשורת עם השרת.');
        }
    }
    
});

