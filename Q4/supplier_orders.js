document.addEventListener('DOMContentLoaded', () => {
    const usernameDisplay = document.getElementById('usernameDisplay');
    const ordersList = document.getElementById('ordersList');
    const logoutButton = document.getElementById('logoutButton');
    const modal = document.getElementById('orderDetailsModal');
    const closeModal = document.getElementById('closeModal');
    const orderDetailsContent = document.getElementById('orderDetailsContent');

    function getToken() {
        return localStorage.getItem('supplierToken');
    }

    function getUsername() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('username') || localStorage.getItem('supplierUsername');
    }

    const token = getToken();
    
    if (!token) {
        window.location.href = 'supplier_entry.html';
        return;
    }

    async function fetchOrders() {
        try {
            const response = await fetch(`http://localhost:3000/api/suppliers/orders`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
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
        ordersList.innerHTML = '';
        if (orders && orders.length > 0) {
            orders.forEach((order, index) => {
                const listItem = document.createElement('li');
                const viewButton = document.createElement('button');
                viewButton.textContent = 'צפה בהזמנה';
                viewButton.addEventListener('click', () => {
                    displayOrderDetails(order);
                });

                if(order.status === 'pending'){
                    listItem.textContent = `הזמנה: ${index+1},  סטטוס: ממתין לאישור`;
                    const statusButton = document.createElement('button');
                    statusButton.textContent = 'אישור הזמנה';
    
                    statusButton.addEventListener('click', () => {
                        const changeStatus = approveOrder(order);
                        if(changeStatus){
                            statusButton.style.display = 'none';
                            listItem.textContent = `הזמנה: ${index+1},  סטטוס: בתהליך`;
                            listItem.appendChild(viewButton);
                        }
                    });
                    listItem.appendChild(statusButton);
                }

                if(order.status === 'processing'){
                    listItem.textContent = `הזמנה: ${index+1},  סטטוס: בתהליך`;
                }

                if(order.status === 'completed'){
                    listItem.textContent = `הזמנה: ${index+1},  סטטוס: הושלמה`;
                }
                listItem.appendChild(viewButton);
                ordersList.appendChild(listItem);
            });
        } else {
            ordersList.innerHTML = '<li>אין הזמנות זמינות.</li>';
        }
    }


    function displayOrderDetails(order) {
        let orderDetails = `מזהה הזמנה: ${order.orderId}\nסטטוס: ממתין לאישור\nמוצרים:\n`;
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
        window.location.href = 'supplier_entry.html';
    });

    async function approveOrder(order) {
        try {
            const response = await fetch(`http://localhost:3000/api/suppliers/orders/${order.orderId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
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
    

    const username = getUsername();
    if (username) {
        usernameDisplay.textContent = username;
        fetchOrders();
    } else {
        window.location.href = 'supplier_entry.html';
    }
});
