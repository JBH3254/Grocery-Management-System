CREATE TABLE suppliers (
    id VARCHAR(255) PRIMARY KEY,
    companyName VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    representativeName VARCHAR(255),
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE goods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplierId VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    minQuantity INT NOT NULL,
    FOREIGN KEY (supplierId) REFERENCES suppliers(id)
);

CREATE TABLE orders (
    id VARCHAR(255) PRIMARY KEY,
    supplierId VARCHAR(255),
    orderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'processing', 'completed') DEFAULT 'pending',
    FOREIGN KEY (supplierId) REFERENCES suppliers(id)
);

CREATE TABLE order_items (
    orderId VARCHAR(255),
    productId VARCHAR(255),
    quantity INT NOT NULL,
    pricePerItem DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (orderId, productId),
    FOREIGN KEY (orderId) REFERENCES orders(id)
);