document.addEventListener('DOMContentLoaded', () => {
    const showSupplierListButton = document.getElementById('showSupplierList');
    const supplierSelectionDiv = document.getElementById('supplierSelection');
    const supplierDropdown = document.getElementById('supplierDropdown');
    const showProductListButton = document.getElementById('showProductList');
    const productListDiv = document.getElementById('productList');
    const selectedSupplierNameSpan = document.getElementById('selectedSupplierName');
    const orderForm = document.getElementById('orderForm');
    const productsToOrderDiv = document.getElementById('productsToOrder');
    const submitOrderButton = document.getElementById('submitOrder');
    const messageDiv = document.getElementById('message');

    let selectedSupplierId = null;
    let supplierNameMap = {}; 

    async function fetchSuppliers() {
        try {
            const response = await fetch('http://localhost:3000/api/grocery/suppliers');
            const data = await response.json();

            if (response.ok) {
                supplierDropdown.innerHTML = '<option value="">בחר ספק</option>';
                data.forEach(supplier => {
                    const option = document.createElement('option');
                    option.value = supplier.id;
                    option.textContent = supplier.companyName;
                    supplierNameMap[supplier.id] = supplier.companyName;
                    supplierDropdown.appendChild(option);
                });
            } else {
                messageDiv.textContent = data.message || 'שגיאה בטעינת הספקים.';
                messageDiv.className = 'error';
            }
        } catch (error) {
            console.error('שגיאה בטעינת הספקים:', error);
            messageDiv.textContent = 'אירעה שגיאה בתקשורת עם השרת.';
            messageDiv.className = 'error';
        }
    }

    async function fetchSupplierProducts(supplierId) {
        try {
            const response = await fetch(`http://localhost:3000/api/grocery/suppliers/${supplierId}/goods`);
            const data = await response.json();

            if (response.ok) {
                productsToOrderDiv.innerHTML = '';
                data.forEach(product => {
                    const productDiv = document.createElement('div');
                    productDiv.className = 'product-item';
                    const label = document.createElement('label');
                    label.textContent = `${product.name} (מחיר: ${product.price}) כמות מינימלית להזמנה: ${product.minQuantity} `;
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.name = product.name;
                    input.min = parseInt(product.minQuantity);
                    input.value = 0;
                    input.addEventListener('input', () => {
                        if (input.value === '') {
                            input.value = 0;
                        }
                    });
                    productDiv.appendChild(label);
                    productDiv.appendChild(input);
                    productsToOrderDiv.appendChild(productDiv);
                });
                productListDiv.style.display = 'block';
            } else {
                messageDiv.textContent = data.message || 'שגיאה בטעינת המוצרים.';
                messageDiv.className = 'error';
                productListDiv.style.display = 'none';
            }
        } catch (error) {
            console.error('שגיאה בטעינת המוצרים:', error);
            messageDiv.textContent = 'אירעה שגיאה בתקשורת עם השרת בעת טעינת המוצרים.';
            messageDiv.className = 'error';
            productListDiv.style.display = 'none';
        }
    }

    showSupplierListButton.addEventListener('click', () => {
        supplierSelectionDiv.style.display = 'block';
        showSupplierListButton.style.display = 'none';
        fetchSuppliers();
    });

    showProductListButton.addEventListener('click', () => {
        selectedSupplierId = supplierDropdown.value;
        if (selectedSupplierId) {
            selectedSupplierNameSpan.textContent = supplierNameMap[selectedSupplierId];
            fetchSupplierProducts(selectedSupplierId);
        } else {
            messageDiv.textContent = 'אנא בחר ספק קודם.';
            messageDiv.className = 'error';
        }
    });

    submitOrderButton.addEventListener('click', async () => {
        if (!selectedSupplierId) {
            messageDiv.textContent = 'אנא בחר ספק לפני ביצוע הזמנה.';
            messageDiv.className = 'error';
            return;
        }

        const itemsToOrder = [];
        const productInputs = orderForm.querySelectorAll('input[type="number"]');
        let validOrder = true;
        messageDiv.textContent = '';
        productInputs.forEach(input => {
            const quantity = parseInt(input.value);
            if (quantity >= parseInt(input.min)) {
                itemsToOrder.push({ productId: input.name, quantity });
            }
            else if(quantity !== 0){
                messageDiv.textContent = `אין אפשרות להזמין פחות מהכמות המינימלית`;
                messageDiv.className = 'error';
                validOrder = false;
            }
        });
        if(!validOrder){
            return;
        }

        if (itemsToOrder.length === 0) {
            messageDiv.textContent = 'אנא בחר כמות לפחות למוצר אחד.';
            messageDiv.className = 'error';
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/grocery/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ supplierId: selectedSupplierId, items: itemsToOrder }),
            });

            const data = await response.json();

            if (response.ok) {
                messageDiv.textContent = data.message || 'ההזמנה בוצעה בהצלחה.';
                messageDiv.className = 'success';
                orderForm.reset();
                productListDiv.style.display = 'none';
                supplierSelectionDiv.style.display = 'none';
                showSupplierListButton.style.display = 'block';
            } else {
                messageDiv.textContent = data.message || 'שגיאה בביצוע ההזמנה.';
                messageDiv.className = 'error';
            }
        } catch (error) {
            console.error('שגיאה בביצוע ההזמנה:', error);
            messageDiv.textContent = 'אירעה שגיאה בתקשורת עם השרת בעת ביצוע ההזמנה.';
            messageDiv.className = 'error';
        }
    });
});