function verifyAdmin() {
    const adminCode = document.getElementById("adminCode").value;
    const correctCode = "1515";

    if (adminCode === correctCode) {
        window.location.href = "grocery_owner.html"; 
    } else {
        document.getElementById("adminMessage").innerText = "קוד שגוי. נסה שוב.";
    }
}

function goToSupplier() {
    window.location.href = "supplier_entry.html"; 
}
