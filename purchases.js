// purchases.js - نظام المشتريات
function loadPurchases() {
    const content = document.getElementById('page-content');
    content.innerHTML = `
        <div class="purchases-page">
            <div class="page-header">
                <h1>نظام المشتريات</h1>
                <button class="btn btn-success" onclick="showAddPurchaseModal()">إضافة فاتورة شراء</button>
            </div>

            <div class="filters-section">
                <div class="search-group">
                    <input type="text" id="purchase-search" placeholder="البحث في المشتريات...">
                    <select id="supplier-filter">
                        <option value="">جميع الموردين</option>
                    </select>
                </div>
            </div>

            <div class="purchases-table-container">
                <table class="table" id="purchases-table">
                    <thead>
                        <tr>
                            <th>رقم الفاتورة</th>
                            <th>المورد</th>
                            <th>التاريخ</th>
                            <th>المبلغ الكلي</th>
                            <th>المدفوع</th>
                            <th>الباقي</th>
                            <th>الحالة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="purchases-tbody">
                        <!-- سيتم ملؤها ديناميكياً -->
                    </tbody>
                </table>
            </div>
        </div>

        <!-- نافذة إضافة فاتورة شراء -->
        <div id="purchase-modal" class="modal">
            <div class="modal-content large">
                <div class="modal-header">
                    <h3>إضافة فاتورة شراء</h3>
                    <span class="close" onclick="closePurchaseModal()">&times;</span>
                </div>
                <form id="purchase-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="purchase-supplier">المورد</label>
                            <select id="purchase-supplier" required>
                                <option value="">اختر المورد</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="purchase-date">التاريخ</label>
                            <input type="date" id="purchase-date" required>
                        </div>
                    </div>

                    <div class="purchase-items-section">
                        <h4>المنتجات</h4>
                        <div class="purchase-items" id="purchase-items">
                            <!-- سيتم إضافة المنتجات هنا -->
                        </div>
                        <button type="button" class="btn btn-success" onclick="addPurchaseItem()">إضافة منتج</button>
                    </div>

                    <div class="purchase-totals">
                        <div class="total-row total">
                            <span>المجموع الكلي:</span>
                            <span id="purchase-total">0.00 ريال</span>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="purchase-payment-method">طريقة الدفع</label>
                            <select id="purchase-payment-method">
                                <option value="cash">نقدي</option>
                                <option value="credit">آجل</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="purchase-paid">المبلغ المدفوع</label>
                            <input type="number" id="purchase-paid" step="0.01">
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn btn-success">حفظ الفاتورة</button>
                        <button type="button" class="btn btn-danger" onclick="closePurchaseModal()">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    loadPurchasesData();
    setupPurchaseEventListeners();
}

function loadPurchasesData() {
    const purchases = db.getAll('purchases');
    const suppliers = db.getAll('suppliers');
    const tbody = document.getElementById('purchases-tbody');
    const supplierFilter = document.getElementById('supplier-filter');

    // تحديث قائمة الموردين
    supplierFilter.innerHTML = '<option value="">جميع الموردين</option>';
    suppliers.forEach(supplier => {
        supplierFilter.innerHTML += `<option value="${supplier.id}">${supplier.name}</option>`;
    });

    tbody.innerHTML = purchases.map(purchase => {
        const supplier = suppliers.find(s => s.id === purchase.supplierId);
        const remaining = purchase.total - (purchase.paid || 0);
        return `
            <tr>
                <td>${purchase.id}</td>
                <td>${supplier ? supplier.name : 'غير محدد'}</td>
                <td>${formatDate(purchase.date)}</td>
                <td>${formatCurrency(purchase.total)}</td>
                <td>${formatCurrency(purchase.paid || 0)}</td>
                <td class="${remaining > 0 ? 'debt' : ''}">${formatCurrency(remaining)}</td>
                <td>${remaining <= 0 ? 'مدفوعة' : 'غير مدفوعة'}</td>
                <td>
                    <button class="btn btn-success" onclick="viewPurchaseDetails('${purchase.id}')">التفاصيل</button>
                    <button class="btn btn-warning" onclick="printPurchaseInvoice('${purchase.id}')">طباعة</button>
                    ${remaining > 0 ? `<button class="btn btn-danger" onclick="recordSupplierPayment('${purchase.id}')">دفع</button>` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

function setupPurchaseEventListeners() {
    document.getElementById('purchase-search').addEventListener('input', filterPurchases);
    document.getElementById('supplier-filter').addEventListener('change', filterPurchases);
    document.getElementById('purchase-form').addEventListener('submit', function(e) {
        e.preventDefault();

        const supplierId = document.getElementById('purchase-supplier').value;
        const date = document.getElementById('purchase-date').value;
        const paymentMethod = document.getElementById('purchase-payment-method').value;
        const paid = parseFloat(document.getElementById('purchase-paid').value) || 0;

        const items = [];
        document.querySelectorAll('.purchase-item').forEach(item => {
            const name = item.querySelector('.purchase-item-name').value;
            const quantity = parseFloat(item.querySelector('.purchase-item-quantity').value);
            const price = parseFloat(item.querySelector('.purchase-item-price').value);

            if (name && quantity && price) {
                items.push({ name, quantity, price, total: quantity * price });
            }
        });

        const total = items.reduce((sum, item) => sum + item.total, 0);

        const purchaseData = {
            supplierId,
            date,
            items,
            total,
            paymentMethod,
            paid
        };

        const savedPurchase = db.save('purchases', purchaseData);

        // تحديث كميات المنتجات إذا كانت موجودة
        items.forEach(item => {
            const existingProduct = db.getAll('products').find(p => p.name === item.name);
            if (existingProduct) {
                db.updateProductQuantity(existingProduct.id, item.quantity);
            } else {
                // إضافة منتج جديد
                const newProduct = {
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    category: 'مشتريات',
                    originalQuantity: item.quantity
                };
                db.save('products', newProduct);
            }
        });

        closePurchaseModal();
        loadPurchasesData();
        showMessage('تم حفظ فاتورة الشراء بنجاح', 'success');
    });
}

function filterPurchases() {
    const searchTerm = document.getElementById('purchase-search').value.toLowerCase();
    const supplierFilter = document.getElementById('supplier-filter').value;
    const purchases = db.getAll('purchases');
    const suppliers = db.getAll('suppliers');

    const filtered = purchases.filter(purchase => {
        const supplier = suppliers.find(s => s.id === purchase.supplierId);
        const matchesSearch = purchase.id.toLowerCase().includes(searchTerm) ||
                            (supplier && supplier.name.toLowerCase().includes(searchTerm));
        const matchesSupplier = !supplierFilter || purchase.supplierId === supplierFilter;
        return matchesSearch && matchesSupplier;
    });

    const tbody = document.getElementById('purchases-tbody');
    tbody.innerHTML = filtered.map(purchase => {
        const supplier = suppliers.find(s => s.id === purchase.supplierId);
        const remaining = purchase.total - (purchase.paid || 0);
        return `
            <tr>
                <td>${purchase.id}</td>
                <td>${supplier ? supplier.name : 'غير محدد'}</td>
                <td>${formatDate(purchase.date)}</td>
                <td>${formatCurrency(purchase.total)}</td>
                <td>${formatCurrency(purchase.paid || 0)}</td>
                <td class="${remaining > 0 ? 'debt' : ''}">${formatCurrency(remaining)}</td>
                <td>${remaining <= 0 ? 'مدفوعة' : 'غير مدفوعة'}</td>
                <td>
                    <button class="btn btn-success" onclick="viewPurchaseDetails('${purchase.id}')">التفاصيل</button>
                    <button class="btn btn-warning" onclick="printPurchaseInvoice('${purchase.id}')">طباعة</button>
                    ${remaining > 0 ? `<button class="btn btn-danger" onclick="recordSupplierPayment('${purchase.id}')">دفع</button>` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

function showAddPurchaseModal() {
    document.getElementById('purchase-form').reset();
    document.getElementById('purchase-date').value = new Date().toISOString().split('T')[0];

    // تحميل الموردين
    const supplierSelect = document.getElementById('purchase-supplier');
    supplierSelect.innerHTML = '<option value="">اختر المورد</option>';
    const suppliers = db.getAll('suppliers');
    suppliers.forEach(supplier => {
        supplierSelect.innerHTML += `<option value="${supplier.id}">${supplier.name}</option>`;
    });

    // إضافة منتج أول
    document.getElementById('purchase-items').innerHTML = '';
    addPurchaseItem();

    updatePurchaseTotals();
    document.getElementById('purchase-modal').style.display = 'block';
}

function addPurchaseItem() {
    const itemsContainer = document.getElementById('purchase-items');
    const itemIndex = itemsContainer.children.length;

    const itemHtml = `
        <div class="purchase-item" data-index="${itemIndex}">
            <div class="form-row">
                <div class="form-group">
                    <label>المنتج</label>
                    <input type="text" class="purchase-item-name" placeholder="اسم المنتج" required>
                </div>
                <div class="form-group">
                    <label>الكمية</label>
                    <input type="number" class="purchase-item-quantity" min="1" value="1" required onchange="updatePurchaseTotals()">
                </div>
                <div class="form-group">
                    <label>السعر</label>
                    <input type="number" class="purchase-item-price" step="0.01" required onchange="updatePurchaseTotals()">
                </div>
                <button type="button" class="btn btn-danger" onclick="removePurchaseItem(this)">×</button>
            </div>
        </div>
    `;

    itemsContainer.insertAdjacentHTML('beforeend', itemHtml);
}

function removePurchaseItem(button) {
    button.closest('.purchase-item').remove();
    updatePurchaseTotals();
}

function updatePurchaseTotals() {
    const items = document.querySelectorAll('.purchase-item');
    let total = 0;

    items.forEach(item => {
        const quantity = parseFloat(item.querySelector('.purchase-item-quantity').value) || 0;
        const price = parseFloat(item.querySelector('.purchase-item-price').value) || 0;
        total += quantity * price;
    });

    document.getElementById('purchase-total').textContent = formatCurrency(total);
}



function viewPurchaseDetails(purchaseId) {
    const purchase = db.getById('purchases', purchaseId);
    const supplier = db.getById('suppliers', purchase.supplierId);

    const content = document.getElementById('page-content');
    content.innerHTML = `
        <div class="purchase-details">
            <div class="page-header">
                <h1>تفاصيل فاتورة الشراء ${purchaseId}</h1>
                <button class="btn btn-warning" onclick="loadPurchases()">العودة</button>
            </div>

            <div class="purchase-info">
                <div class="info-section">
                    <h3>معلومات الفاتورة</h3>
                    <p><strong>المورد:</strong> ${supplier ? supplier.name : 'غير محدد'}</p>
                    <p><strong>التاريخ:</strong> ${formatDate(purchase.date)}</p>
                    <p><strong>طريقة الدفع:</strong> ${purchase.paymentMethod === 'cash' ? 'نقدي' : 'آجل'}</p>
                </div>

                <div class="items-section">
                    <h3>المنتجات</h3>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>المنتج</th>
                                <th>الكمية</th>
                                <th>السعر</th>
                                <th>المجموع</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${purchase.items.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.quantity}</td>
                                    <td>${formatCurrency(item.price)}</td>
                                    <td>${formatCurrency(item.total)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="totals-section">
                    <div class="total-row total">
                        <span>المجموع الكلي:</span>
                        <span>${formatCurrency(purchase.total)}</span>
                    </div>
                    <div class="total-row">
                        <span>المدفوع:</span>
                        <span>${formatCurrency(purchase.paid || 0)}</span>
                    </div>
                    <div class="total-row">
                        <span>الباقي:</span>
                        <span>${formatCurrency(purchase.total - (purchase.paid || 0))}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function printPurchaseInvoice(purchaseId) {
    const purchase = db.getById('purchases', purchaseId);
    const supplier = db.getById('suppliers', purchase.supplierId);
    const settings = JSON.parse(localStorage.getItem('settings')) || {};

    const invoiceWindow = window.open('', '_blank');
    invoiceWindow.document.write(`
        <html dir="rtl">
        <head>
            <title>فاتورة شراء</title>
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
                <p>فاتورة شراء رقم: ${purchase.id}</p>
                <p>التاريخ: ${formatDate(purchase.date)}</p>
            </div>

            <div class="invoice-details">
                <p><strong>المورد:</strong> ${supplier ? supplier.name : 'غير محدد'}</p>
                <p><strong>طريقة الدفع:</strong> ${purchase.paymentMethod === 'cash' ? 'نقدي' : 'آجل'}</p>
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
                    ${purchase.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>${formatCurrency(item.price)}</td>
                            <td>${formatCurrency(item.total)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="totals">
                <p class="total">المجموع الكلي: ${formatCurrency(purchase.total)}</p>
                <p>المدفوع: ${formatCurrency(purchase.paid || 0)}</p>
                <p>الباقي: ${formatCurrency(purchase.total - (purchase.paid || 0))}</p>
            </div>
        </body>
        </html>
    `);

    invoiceWindow.document.close();
    invoiceWindow.print();
}

function recordSupplierPayment(purchaseId) {
    const amount = prompt('أدخل مبلغ الدفعة:');
    if (amount && !isNaN(amount)) {
        const purchase = db.getById('purchases', purchaseId);
        purchase.paid = (purchase.paid || 0) + parseFloat(amount);
        db.save('purchases', purchase);
        loadPurchasesData();
        showMessage('تم تسجيل الدفعة بنجاح', 'success');
    }
}

function closePurchaseModal() {
    document.getElementById('purchase-modal').style.display = 'none';
    document.getElementById('purchase-form').reset();
}