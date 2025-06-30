document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registrationForm');
    const companyNameInput = document.getElementById('companyName');
    const phoneNumberInput = document.getElementById('phoneNumber');
    const representativeNameInput = document.getElementById('representativeName');
    const productsTextarea = document.getElementById('products');
    const registerButton = document.getElementById('registerButton');
    const messageDiv = document.getElementById('message');

    const loginForm = document.getElementById('loginForm');
    const loginUsernameInput = document.getElementById('loginUsername');
    const loginPasswordInput = document.getElementById('loginPassword');
    const loginButtonElement = document.getElementById('loginButton');
    const loginMessageDiv = document.getElementById('loginMessage');

    const toggleLoginButton = document.getElementById('toggleLogin');
    const toggleRegisterButton = document.getElementById('toggleRegister');

    function saveToken(token) {
        localStorage.setItem('supplierToken', token);
    }

    function saveUsername(username) {
        localStorage.setItem('supplierUsername', username);
    }

    async function registerSupplier() {
        const companyName = companyNameInput.value.trim();
        const phoneNumber = phoneNumberInput.value.trim();
        const representativeName = representativeNameInput.value.trim();
        const productsText = productsTextarea.value.trim();

        const goods = productsText.split('\n').map(line => {
            const [name, price, minQuantity] = line.split(',').map(item => item.trim());
            return { name, price: parseFloat(price), minQuantity: parseInt(minQuantity) };
        }).filter(good => good.name && !isNaN(good.price) && !isNaN(good.minQuantity));

        const username = companyName.toLowerCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 1000);
        const password = Math.random().toString(36).slice(-8);

        if (!companyName || !phoneNumber || !representativeName || goods.length === 0) {
            messageDiv.textContent = 'אנא מלא את כל השדות.';
            messageDiv.className = 'error';
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/suppliers/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companyName, phone: phoneNumber, representativeName, goods, username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(`הרישום הצליח! שם המשתמש שלך הוא: ${username} (סיסמה: ${password} - יש לשמור!.`);
                if (data.token) {
                    saveToken(data.token);
                }
                saveUsername(username);
                window.location.href = `supplier_orders.html?username=${username}`;
            } else {
                messageDiv.textContent = data.message || 'שגיאה ברישום הספק.';
                messageDiv.className = 'error';
            }
        } catch (error) {
            console.error('שגיאה בשליחת בקשת רישום:', error);
            messageDiv.textContent = 'אירעה שגיאה בתקשורת עם השרת.';
            messageDiv.className = 'error';
        }
    }

    async function loginSupplier() {
        const username = loginUsernameInput.value.trim();
        const password = loginPasswordInput.value.trim();

        if (!username || !password) {
            loginMessageDiv.textContent = 'אנא מלא את שם המשתמש והסיסמה.';
            loginMessageDiv.className = 'error';
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/suppliers/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                loginMessageDiv.textContent = data.message || 'התחברת בהצלחה.';
                loginMessageDiv.className = 'success';
                if (data.token) {
                    saveToken(data.token);
                }
                saveUsername(username);
                window.location.href = `supplier_orders.html?username=${username}`;
            } else {
                loginMessageDiv.textContent = data.message || 'שם משתמש או סיסמה לא נכונים.';
                loginMessageDiv.className = 'error';
            }
        } catch (error) {
            console.error('שגיאה בהתחברות:', error);
            loginMessageDiv.textContent = 'אירעה שגיאה בתקשורת עם השרת.';
            loginMessageDiv.className = 'error';
        }
    }

    toggleLoginButton.addEventListener('click', () => {
        registrationForm.style.display = 'none';
        loginForm.style.display = 'block';
        toggleLoginButton.style.display = 'none';
        toggleRegisterButton.style.display = 'block';
        messageDiv.textContent = '';
        loginMessageDiv.textContent = '';
    });

    toggleRegisterButton.addEventListener('click', () => {
        registrationForm.style.display = 'block';
        loginForm.style.display = 'none';
        toggleLoginButton.style.display = 'block';
        toggleRegisterButton.style.display = 'none';
        messageDiv.textContent = '';
        loginMessageDiv.textContent = '';
    });

    registerButton.addEventListener('click', registerSupplier);
    if (loginButtonElement) {
        loginButtonElement.addEventListener('click', loginSupplier);
    }

    registrationForm.style.display = 'none';
    loginForm.style.display = 'block';
    toggleLoginButton.style.display = 'none';
    toggleRegisterButton.style.display = 'block';
});