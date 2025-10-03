// sales.js - نظام البيع
let cart = [];

function loadSales() {
    const content = document.getElementById('page-content');
    content.innerHTML = `
        <div class="sales-page">
            <div class="page-header">
                <h1>نظام البيع</h1>
            </div>

            <div class="sales-container">
                <div class="products-section">
                    <h3>المنتجات</h3>
                    <div class="search-group">
                        <input type="text" id="product-search-sales" placeholder="البحث عن منتج...">
                    </div>
                    <div class="products-list" id="products-list">
                        <!-- سيتم ملؤها ديناميكياً -->
                    </div>
                </div>

                <div class="cart-section">
                    <h3>سلة المشتريات</h3>
                    <div class="customer-info">
                        <select id="customer-select">
                            <option value="">عميل نقدي</option>
                        </select>
                        <button class="btn btn-success" onclick="addNewCustomer()">إضافة عميل جديد</button>
                    </div>
                    <div class="cart-items" id="cart-items">
                        <!-- سيتم ملؤها ديناميكياً -->
                    </div>
                    <div class="cart-total">
                        <div class="total-row">
                            <span>المجموع بالدولار:</span>
                            <span id="total-usd">0.00 دولار</span>
                        </div>
                        <div class="total-row total">
                            <span>المجموع بالليرة السورية:</span>
                            <span id="total-syp">0.00 ليرة سورية</span>
                        </div>
                        <div class="total-row required">
                            <span>المبلغ المطلوب (ليرة سورية):</span>
                            <span id="required-amount">0.00 ليرة سورية</span>
                        </div>
                    </div>
                </div>

                <div class="payment-section">
                    <h3>إتمام البيع</h3>
                    <div class="form-group">
                        <label for="payment-method">طريقة الدفع</label>
                        <select id="payment-method">
                            <option value="cash">نقدي</option>
                            <option value="credit">آجل</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="paid-amount">المبلغ المدفوع (ليرة سورية)</label>
                        <input type="number" id="paid-amount" step="0.01" placeholder="أدخل المبلغ بالليرة السورية">
                    </div>
                    <button class="btn btn-success" onclick="completeSale()">إتمام البيع</button>

                    <!-- نافذة عرض الفاتورة -->
                    <div id="invoice-preview-modal" class="modal">
                        <div class="modal-content invoice-modal">
                            <div class="modal-header">
                                <h3>فاتورة البيع</h3>
                                <span class="close" onclick="closeInvoicePreviewModal()">&times;</span>
                            </div>
                            <div id="invoice-preview-content">
                                <!-- سيتم ملؤها ديناميكياً -->
                            </div>
                            <div class="modal-actions">
                                <button class="btn btn-success" onclick="printCurrentInvoice()">طباعة الفاتورة</button>
                                <button class="btn btn-warning" onclick="closeInvoicePreviewModal()">إغلاق</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- نافذة إضافة عميل سريع -->
        <div id="quick-customer-modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>إضافة عميل جديد</h3>
                    <span class="close" onclick="closeQuickCustomerModal()">&times;</span>
                </div>
                <form id="quick-customer-form">
                    <div class="form-group">
                        <label for="customer-name">اسم العميل</label>
                        <input type="text" id="customer-name" required>
                    </div>
                    <div class="form-group">
                        <label for="customer-phone">رقم الهاتف</label>
                        <input type="tel" id="customer-phone">
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-success">إضافة</button>
                        <button type="button" class="btn btn-danger" onclick="closeQuickCustomerModal()">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    loadSalesData();
    setupSalesEventListeners();
}

function loadSalesData() {
    // تحميل المنتجات
    const products = db.getAll('products');
    const productsList = document.getElementById('products-list');
    productsList.innerHTML = products.map(product => {
        const priceInSYP = getPriceInSYP(product.price);
        return `
            <div class="product-item" onclick="addToCart('${product.id}')">
                <h4>${product.name}</h4>
                <p>${formatCurrency(product.price)}</p>
                <p class="price-syp">${formatCurrencySYP(priceInSYP)}</p>
                <small>المتوفر: ${product.quantity}</small>
            </div>
        `;
    }).join('');

    // تحميل العملاء
    const customers = db.getAll('customers');
    const customerSelect = document.getElementById('customer-select');
    customerSelect.innerHTML = '<option value="">عميل نقدي</option>';
    customers.forEach(customer => {
        customerSelect.innerHTML += `<option value="${customer.id}">${customer.name}</option>`;
    });

    updateCartDisplay();
}

function setupSalesEventListeners() {
    document.getElementById('product-search-sales').addEventListener('input', filterProductsSales);
    document.getElementById('quick-customer-form').addEventListener('submit', addQuickCustomer);
}

function filterProductsSales() {
    const searchTerm = document.getElementById('product-search-sales').value.toLowerCase();
    const products = db.getAll('products');
    const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        (product.description && product.description.toLowerCase().includes(searchTerm))
    );

    const productsList = document.getElementById('products-list');
    productsList.innerHTML = filtered.map(product => {
        const priceInSYP = getPriceInSYP(product.price);
        return `
            <div class="product-item" onclick="addToCart('${product.id}')">
                <h4>${product.name}</h4>
                <p>${formatCurrency(product.price)}</p>
                <p class="price-syp">${formatCurrencySYP(priceInSYP)}</p>
                <small>المتوفر: ${product.quantity}</small>
            </div>
        `;
    }).join('');
}

function addToCart(productId) {
    const product = db.getById('products', productId);
    if (!product || product.quantity <= 0) {
        showMessage('المنتج غير متوفر', 'error');
        return;
    }

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        if (existingItem.quantity >= product.quantity) {
            showMessage('الكمية المتوفرة محدودة', 'error');
            return;
        }
        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    updateCartDisplay();
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const totalUsdEl = document.getElementById('total-usd');
    const totalSypEl = document.getElementById('total-syp');

    if (cart.length === 0) {
        cartItems.innerHTML = '<p>السلة فارغة</p>';
        totalUsdEl.textContent = '$0.00';
        totalSypEl.textContent = '0 ليرة سورية';
        const requiredAmountEl = document.getElementById('required-amount');
        if (requiredAmountEl) {
            requiredAmountEl.textContent = '0 ليرة سورية';
        }
        return;
    }

    cartItems.innerHTML = cart.map((item, index) => {
        const itemTotalUSD = item.price * item.quantity;
        const itemTotalSYP = getPriceInSYP(itemTotalUSD);
        return `
            <div class="cart-item">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>${formatCurrency(item.price)} × ${item.quantity} = ${formatCurrency(itemTotalUSD)}</p>
                    <p class="price-syp">${formatCurrencySYP(itemTotalSYP)}</p>
                </div>
                <div class="item-controls">
                    <button onclick="changeQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQuantity(${index}, 1)">+</button>
                    <button onclick="removeFromCart(${index})" class="btn-danger">×</button>
                </div>
            </div>
        `;
    }).join('');

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxRate = getTaxRate();
    const tax = subtotal * taxRate;
    const totalUSD = subtotal + tax;
    const totalSYP = getPriceInSYP(totalUSD);

    totalUsdEl.textContent = formatCurrency(totalUSD);
    totalSypEl.textContent = formatCurrencySYP(totalSYP);

    // عرض المبلغ المطلوب بالليرة السورية
    const requiredAmountEl = document.getElementById('required-amount');
    requiredAmountEl.textContent = formatCurrencySYP(totalSYP);
}

function changeQuantity(index, change) {
    const item = cart[index];
    const product = db.getById('products', item.id);

    item.quantity += change;

    if (item.quantity <= 0) {
        cart.splice(index, 1);
    } else if (item.quantity > product.quantity) {
        item.quantity = product.quantity;
        showMessage('الكمية المتوفرة محدودة', 'warning');
    }

    updateCartDisplay();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
}

function addNewCustomer() {
    document.getElementById('quick-customer-modal').style.display = 'block';
}

function addQuickCustomer(e) {
    e.preventDefault();

    const customerData = {
        name: document.getElementById('customer-name').value,
        phone: document.getElementById('customer-phone').value
    };

    const savedCustomer = db.save('customers', customerData);
    const customerSelect = document.getElementById('customer-select');
    customerSelect.innerHTML += `<option value="${savedCustomer.id}">${savedCustomer.name}</option>`;
    customerSelect.value = savedCustomer.id;

    closeQuickCustomerModal();
    showMessage('تم إضافة العميل بنجاح', 'success');
}

function completeSale() {
    if (cart.length === 0) {
        showMessage('السلة فارغة', 'error');
        return;
    }

    const customerId = document.getElementById('customer-select').value;
    const paymentMethod = document.getElementById('payment-method').value;
    const paidAmountSYP = parseFloat(document.getElementById('paid-amount').value) || 0;
    const paidAmountUSD = convertSYPToUSD(paidAmountSYP); // تحويل من الليرة السورية إلى الدولار

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxRate = getTaxRate();
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    const totalSYP = getPriceInSYP(total);

    // التحقق من صحة الدفع - مقارنة المبلغ المدفوع بالليرة مع المجموع بالليرة
    if (paymentMethod === 'cash' && paidAmountSYP < totalSYP) {
        showMessage('المبلغ المدفوع غير كافي', 'error');
        return;
    }

    // إنشاء فاتورة البيع
    const saleData = {
        customerId: customerId || null,
        customerName: customerId ? db.getById('customers', customerId).name : 'عميل نقدي',
        items: cart,
        subtotal: subtotal,
        tax: tax,
        total: total,
        paymentMethod: paymentMethod,
        paid: paidAmountUSD,
        paidSYP: paidAmountSYP, // حفظ المبلغ المدفوع بالليرة السورية أيضاً
        change: paymentMethod === 'cash' ? paidAmountUSD - total : 0,
        date: new Date().toISOString(),
        exchangeRate: parseFloat(localStorage.getItem('exchangeRate')) || 1, // حفظ سعر الصرف وقت البيع
        totalSYP: totalSYP // حفظ قيمة المجموع بالليرة وقت البيع
    };

    const savedSale = db.save('sales', saleData);

    // تحديث كميات المنتجات
    const lowStockProducts = [];
    cart.forEach(item => {
        const productBefore = db.getById('products', item.id);
        db.updateProductQuantity(item.id, -item.quantity);
        const productAfter = db.getById('products', item.id);
        const threshold = productAfter.lastUpdatedQuantity || productAfter.originalQuantity || productAfter.quantity;
        if (productAfter.quantity <= 0.25 * threshold) {
            lowStockProducts.push(productAfter.name);
        }
    });

    

    // عرض الفاتورة في النافذة المنبثقة
    showInvoicePreview(savedSale);

    // إعادة تعيين السلة
    cart = [];
    updateCartDisplay();
    document.getElementById('paid-amount').value = '';

    // إعادة تحميل بيانات البيع لتحديث الكميات
    loadSalesData();

    showMessage('تم إتمام البيع بنجاح', 'success');
}

// جعل دالة الطباعة متاحة عالمياً
window.printInvoice = function(sale) {
    const invoiceWindow = window.open('', '_blank');
    const settings = JSON.parse(localStorage.getItem('settings')) || {};

    invoiceWindow.document.write(`
        <html dir="rtl">
        <head>
            <title>فاتورة البيع</title>
            <style>
                body { font-family: Arial, sans-serif; direction: rtl; padding: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .invoice-details { margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                .total { font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${settings.companyName || 'شركة سلمان'}</h1>
                <p>فاتورة البيع رقم: ${sale.id}</p>
                <p>التاريخ: ${formatDate(sale.date)}</p>
            </div>

            <div class="invoice-details">
                <p><strong>العميل:</strong> ${sale.customerName}</p>
                <p><strong>طريقة الدفع:</strong> ${sale.paymentMethod === 'cash' ? 'نقدي' : 'آجل'}</p>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>المنتج</th>
                        <th>الكمية</th>
                        <th>السعر</th>
                        <th>المجموع</th>
                    </tr>
                </thead>
                <tbody>
                    ${sale.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>${formatCurrency(item.price)}</td>
                            <td>${formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="totals">
                <p>المجموع الفرعي: ${formatCurrency(sale.subtotal || sale.total)}</p>
                <p>الضريبة: ${formatCurrency(sale.tax || 0)}</p>
                <p class="total">المجموع الكلي: ${formatCurrency(sale.total)}</p>
                ${sale.paymentMethod === 'cash' ? `<p>المدفوع: ${formatCurrency(sale.paid)} (${formatCurrencySYP(sale.paidSYP || 0)})</p><p>الباقي: ${formatCurrency(sale.change || 0)} (${formatCurrencySYP(getPriceInSYP(sale.change || 0))})</p>` : ''}
            </div>
        </body>
        </html>
    `);

    invoiceWindow.document.close();
    invoiceWindow.print();
};

function printInvoice(sale) {
    window.printInvoice(sale);
}

function closeQuickCustomerModal() {
    document.getElementById('quick-customer-modal').style.display = 'none';
    document.getElementById('quick-customer-form').reset();
}

function showInvoicePreview(sale) {
    const content = document.getElementById('invoice-preview-content');
    const settings = JSON.parse(localStorage.getItem('settings')) || {};

    content.innerHTML = `
        <div class="invoice-preview">
            <div class="invoice-header">
                <div class="company-info">
                    <h2>${settings.companyName || 'شركة سلمان'}</h2>
                    <p>نظام إدارة نقاط البيع</p>
                </div>
                <div class="invoice-info">
                    <h3>فاتورة البيع</h3>
                    <p><strong>رقم الفاتورة:</strong> ${sale.id}</p>
                    <p><strong>التاريخ:</strong> ${formatDate(sale.date)}</p>
                    <p><strong>العميل:</strong> ${sale.customerName}</p>
                    <p><strong>طريقة الدفع:</strong> ${sale.paymentMethod === 'cash' ? 'نقدي' : 'آجل'}</p>
                </div>
            </div>

            <div class="invoice-items">
                <table class="table invoice-table">
                    <thead>
                        <tr>
                            <th>المنتج</th>
                            <th>الكمية</th>
                            <th>السعر (دولار)</th>
                            <th>السعر (ليرة)</th>
                            <th>المجموع (دولار)</th>
                            <th>المجموع (ليرة)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(() => {
                            let itemsToShow = sale.items;
                            if (sale.isPayment) {
                                itemsToShow = [{
                                    name: "دفعة على الحساب",
                                    quantity: 1,
                                    price: convertSYPToUSD(sale.paidSYP || 0)
                                }];
                            }
                            return itemsToShow.map(item => {
                                const itemTotalUSD = item.price * item.quantity;
                                const itemTotalSYP = getPriceInSYP(itemTotalUSD);
                                return `
                                    <tr>
                                        <td>${item.name}</td>
                                        <td>${item.quantity}</td>
                                        <td>${formatCurrency(item.price)}</td>
                                        <td>${formatCurrencySYP(getPriceInSYP(item.price))}</td>
                                        <td>${formatCurrency(itemTotalUSD)}</td>
                                        <td>${formatCurrencySYP(itemTotalSYP)}</td>
                                    </tr>
                                `;
                            }).join('');
                        })()}
                    </tbody>
                </table>
            </div>

            <div class="invoice-totals">
                <div class="totals-section">
                    <div class="total-row">
                        <span>المجموع الكلي (دولار):</span>
                        <span>${formatCurrency(sale.total)}</span>
                    </div>
                    <div class="total-row">
                        <span>المجموع الكلي (ليرة سورية):</span>
                        <span>${formatCurrencySYP(getPriceInSYP(sale.total))}</span>
                    </div>
                    <div class="total-row">
                        <span>المدفوع (دولار):</span>
                        <span>${formatCurrency(sale.paid || 0)}</span>
                    </div>
                    <div class="total-row">
                        <span>المدفوع (ليرة سورية):</span>
                        <span>${formatCurrencySYP(sale.paidSYP || 0)}</span>
                    </div>
                    <div class="total-row">
                        <span>الباقي (دولار):</span>
                        <span>${formatCurrency(sale.change || 0)}</span>
                    </div>
                    <div class="total-row">
                        <span>الباقي (ليرة سورية):</span>
                        <span>${formatCurrencySYP(getPriceInSYP(sale.change || 0))}</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('invoice-preview-modal').style.display = 'block';
}

function closeInvoicePreviewModal() {
    document.getElementById('invoice-preview-modal').style.display = 'none';
}

function printCurrentInvoice() {
    const invoiceContent = document.getElementById('invoice-preview-content').innerHTML;
    const printWindow = window.open('', '_blank');

    printWindow.document.write(`
        <html dir="rtl">
        <head>
            <title>فاتورة البيع</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    direction: rtl;
                    padding: 20px;
                    margin: 0;
                }
                .invoice-preview {
                    max-width: 800px;
                    margin: 0 auto;
                }
                .invoice-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #333;
                    padding-bottom: 20px;
                }
                .company-info h2 {
                    margin: 0 0 10px 0;
                    color: #333;
                }
                .invoice-info h3 {
                    margin: 0 0 10px 0;
                    color: #666;
                }
                .invoice-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                .invoice-table th,
                .invoice-table td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: right;
                }
                .invoice-table th {
                    background-color: #f5f5f5;
                    font-weight: bold;
                }
                .totals-section {
                    background: #f9f9f9;
                    padding: 20px;
                    border-radius: 10px;
                    margin-top: 20px;
                }
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    padding: 5px 0;
                }
                .total-row:last-child {
                    border-top: 1px solid #ddd;
                    padding-top: 15px;
                    font-weight: bold;
                    font-size: 1.1em;
                }
                .invoice-preview .totals-section .total-row span:last-child {
                    font-weight: bold;
                }
                .totals {
                    margin-top: 20px;
                }
                .totals p {
                    margin: 5px 0;
                }
                .totals .total {
                    font-weight: bold;
                    font-size: 1.2em;
                    color: #333;
                }
            </style>
        </head>
        <body>
            ${invoiceContent}
        </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.print();
}