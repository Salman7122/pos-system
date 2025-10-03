// customers.js - إدارة العملاء
function loadCustomers() {
    const content = document.getElementById('page-content');
    content.innerHTML = `
        <div class="customers-page">
            <div class="page-header">
                <h1>إدارة العملاء</h1>
                <button class="btn btn-success" onclick="showAddCustomerModal()">إضافة عميل جديد</button>
            </div>

            <div class="filters-section">
                <div class="search-group">
                    <input type="text" id="customer-search" placeholder="البحث عن عميل...">
                </div>
            </div>

            <div class="customers-table-container">
                <table class="table" id="customers-table">
                    <thead>
                        <tr>
                            <th>الاسم</th>
                            <th>رقم الهاتف</th>
                            <th>البريد الإلكتروني</th>
                            <th>العنوان</th>
                            <th>الرصيد</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-tbody">
                        <!-- سيتم ملؤها ديناميكياً -->
                    </tbody>
                </table>
            </div>
        </div>

        <!-- نافذة إضافة/تعديل العميل -->
        <div id="customer-modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="customer-modal-title">إضافة عميل جديد</h3>
                    <span class="close" onclick="closeCustomerModal()">&times;</span>
                </div>
                <form id="customer-form">
                    <div class="form-group">
                        <label for="customer-name">اسم العميل</label>
                        <input type="text" id="customer-name" required>
                    </div>
                    <div class="form-group">
                        <label for="customer-phone">رقم الهاتف</label>
                        <input type="tel" id="customer-phone">
                    </div>
                    <div class="form-group">
                        <label for="customer-email">البريد الإلكتروني</label>
                        <input type="email" id="customer-email">
                    </div>
                    <div class="form-group">
                        <label for="customer-address">العنوان</label>
                        <textarea id="customer-address" rows="3"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-success">حفظ</button>
                        <button type="button" class="btn btn-danger" onclick="closeCustomerModal()">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- نافذة تفاصيل العميل -->
        <div id="customer-details-modal" class="modal">
            <div class="modal-content large">
                <div class="modal-header">
                    <h3>تفاصيل العميل</h3>
                    <span class="close" onclick="closeCustomerDetailsModal()">&times;</span>
                </div>
                <div id="customer-details-content">
                    <!-- سيتم ملؤها ديناميكياً -->
                </div>
            </div>
        </div>
    `;

    loadCustomersData();
    setupCustomerEventListeners();
}

function loadCustomersData() {
    const customers = db.getAll('customers');
    const tbody = document.getElementById('customers-tbody');

    tbody.innerHTML = customers.map(customer => {
        const balanceSYP = (db.getCustomerBalanceSYP ? db.getCustomerBalanceSYP(customer.id) : 0);
        const ex = parseFloat(localStorage.getItem('exchangeRate')) || 1;
        const balanceUSD = convertSYPToUSD ? convertSYPToUSD(balanceSYP) : (balanceSYP / ex);
        return `
            <tr>
                <td>${customer.name}</td>
                <td>${customer.phone || ''}</td>
                <td>${customer.email || ''}</td>
                <td>${customer.address || ''}</td>
                <td class="${balanceSYP > 0 ? 'debt' : balanceSYP < 0 ? 'credit' : ''}">
                    ${formatCurrencySYP(Math.abs(balanceSYP))}
                    <br><small class="price-syp">${formatCurrency(Math.abs(balanceUSD))}</small>
                </td>
                <td>
                    <button class="btn btn-warning" onclick="editCustomer('${customer.id}')">تعديل</button>
                    <button class="btn btn-danger" onclick="deleteCustomer('${customer.id}')">حذف</button>
                    <button class="btn btn-success" onclick="viewCustomerDetails('${customer.id}')">التفاصيل</button>
                </td>
            </tr>
        `;
    }).join('');
}

function setupCustomerEventListeners() {
    document.getElementById('customer-search').addEventListener('input', filterCustomers);
    document.getElementById('customer-form').addEventListener('submit', saveCustomer);
}

function filterCustomers() {
    const searchTerm = document.getElementById('customer-search').value.toLowerCase();
    const customers = db.getAll('customers');

    const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm) ||
        (customer.phone && customer.phone.includes(searchTerm)) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm))
    );

    const tbody = document.getElementById('customers-tbody');
    tbody.innerHTML = filtered.map(customer => {
        const balanceSYP = (db.getCustomerBalanceSYP ? db.getCustomerBalanceSYP(customer.id) : 0);
        const ex = parseFloat(localStorage.getItem('exchangeRate')) || 1;
        const balanceUSD = convertSYPToUSD ? convertSYPToUSD(balanceSYP) : (balanceSYP / ex);
        return `
            <tr>
                <td>${customer.name}</td>
                <td>${customer.phone || ''}</td>
                <td>${customer.email || ''}</td>
                <td>${customer.address || ''}</td>
                <td class="${balanceSYP > 0 ? 'debt' : balanceSYP < 0 ? 'credit' : ''}">
                    ${formatCurrencySYP(Math.abs(balanceSYP))}
                    <br><small class="price-syp">${formatCurrency(Math.abs(balanceUSD))}</small>
                </td>
                <td>
                    <button class="btn btn-warning" onclick="editCustomer('${customer.id}')">تعديل</button>
                    <button class="btn btn-danger" onclick="deleteCustomer('${customer.id}')">حذف</button>
                    <button class="btn btn-success" onclick="viewCustomerDetails('${customer.id}')">التفاصيل</button>
                </td>
            </tr>
        `;
    }).join('');
}

function showAddCustomerModal() {
    document.getElementById('customer-modal-title').textContent = 'إضافة عميل جديد';
    document.getElementById('customer-form').reset();
    document.getElementById('customer-modal').style.display = 'block';
}

function editCustomer(id) {
    const customer = db.getById('customers', id);
    if (customer) {
        document.getElementById('customer-modal-title').textContent = 'تعديل العميل';
        document.getElementById('customer-name').value = customer.name;
        document.getElementById('customer-phone').value = customer.phone || '';
        document.getElementById('customer-email').value = customer.email || '';
        document.getElementById('customer-address').value = customer.address || '';
        document.getElementById('customer-form').dataset.customerId = id;
        document.getElementById('customer-modal').style.display = 'block';
    }
}

function saveCustomer(e) {
    e.preventDefault();

    const customerData = {
        name: document.getElementById('customer-name').value,
        phone: document.getElementById('customer-phone').value,
        email: document.getElementById('customer-email').value,
        address: document.getElementById('customer-address').value
    };

    const customerId = e.target.dataset.customerId;
    if (customerId) {
        customerData.id = customerId;
    }

    db.save('customers', customerData);
    closeCustomerModal();
    loadCustomersData();
    showMessage('تم حفظ العميل بنجاح', 'success');
}

function deleteCustomer(id) {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟ سيتم حذف جميع المعاملات المتعلقة به.')) {
        db.delete('customers', id);
        loadCustomersData();
        showMessage('تم حذف العميل بنجاح', 'success');
    }
}

function viewCustomerDetails(id) {
    const customer = db.getById('customers', id);
    if (!customer) return;

    const sales = db.getAll('sales').filter(sale => sale.customerId === id);
    const balanceSYP = (db.getCustomerBalanceSYP ? db.getCustomerBalanceSYP(id) : 0);
    const ex = parseFloat(localStorage.getItem('exchangeRate')) || 1;
    const balanceUSD = convertSYPToUSD ? convertSYPToUSD(balanceSYP) : (balanceSYP / ex);

    const content = document.getElementById('customer-details-content');
    content.innerHTML = `
        <div class="customer-info-section">
            <h4>معلومات العميل</h4>
            <p><strong>الاسم:</strong> ${customer.name}</p>
            <p><strong>الهاتف:</strong> ${customer.phone || 'غير محدد'}</p>
            <p><strong>البريد:</strong> ${customer.email || 'غير محدد'}</p>
            <p><strong>العنوان:</strong> ${customer.address || 'غير محدد'}</p>
            <p><strong>الرصيد الحالي:</strong> <span class="${balanceSYP > 0 ? 'debt' : balanceSYP < 0 ? 'credit' : ''}">${formatCurrencySYP(Math.abs(balanceSYP))}</span> <small>(${formatCurrency(Math.abs(balanceUSD))})</small></p>
        </div>

        <div class="customer-transactions">
            <h4>سجل المعاملات</h4>
            <table class="table">
                <thead>
                    <tr>
                        <th>التاريخ</th>
                        <th>النوع</th>
                        <th>المبلغ</th>
                        <th>المدفوع</th>
                        <th>الباقي</th>
                    </tr>
                </thead>
                <tbody>
                    ${(() => {
                        const ex = parseFloat(localStorage.getItem('exchangeRate')) || 1;
                        const sorted = [...sales].sort((a, b) => new Date(a.date) - new Date(b.date));
                        let runningSYP = 0;
                        return sorted.map(sale => {
                            const isPayment = !!sale.isPayment || ((sale.total === 0 || sale.total == null) && (sale.paidSYP || sale.totalSYP));
                            const totalUSD = sale.total || 0;
                            const paidUSD = sale.paid || 0;
                            const totalSYP = (sale.totalSYP !== undefined && sale.totalSYP !== null)
                                ? sale.totalSYP
                                : (typeof getPriceInSYP === 'function' ? getPriceInSYP(totalUSD) : 0);
                            const paidSYP = sale.paidSYP || (typeof getPriceInSYP === 'function' ? getPriceInSYP(paidUSD) : 0);
        
                            if (isPayment) {
                                const paymentSYP = Math.abs(paidSYP || totalSYP);
                                const paymentUSD = (typeof convertSYPToUSD === 'function') ? convertSYPToUSD(paymentSYP) : (paymentSYP / ex);
                                runningSYP -= paymentSYP;
                                const runningUSD = (typeof convertSYPToUSD === 'function') ? convertSYPToUSD(runningSYP) : (runningSYP / ex);
                                return `
                                    <tr>
                                        <td>${formatDate(sale.date)}</td>
                                        <td>دفعة</td>
                                        <td>—</td>
                                        <td>${formatCurrencySYP(paymentSYP)}<br><small>(${formatCurrency(paymentUSD)})</small></td>
                                        <td>${formatCurrencySYP(runningSYP)}<br><small>(${formatCurrency(runningUSD)})</small></td>
                                    </tr>
                                `;
                            } else {
                                const deltaSYP = totalSYP - (paidSYP || 0);
                                runningSYP += deltaSYP;
                                const runningUSD = (typeof convertSYPToUSD === 'function') ? convertSYPToUSD(runningSYP) : (runningSYP / ex);
                                return `
                                    <tr>
                                        <td>${formatDate(sale.date)}</td>
                                        <td>بيع</td>
                                        <td>${formatCurrencySYP(totalSYP)}<br><small>(${formatCurrency(totalUSD)})</small></td>
                                        <td>${formatCurrencySYP(paidSYP)}<br><small>(${formatCurrency(paidUSD)})</small></td>
                                        <td>${formatCurrencySYP(runningSYP)}<br><small>(${formatCurrency(runningUSD)})</small></td>
                                    </tr>
                                `;
                            }
                        }).join('');
                    })()}
                </tbody>
            </table>
        </div>

        <div class="customer-actions">
            <div class="form-row">
                <div class="form-group">
                    <label for="customer-payment-amount">الدفعة الجزئية (ليرة سورية)</label>
                    <input type="number" id="customer-payment-amount" step="0.01" min="0" placeholder="أدخل الدفعة الجزئية بالليرة السورية">
                </div>
                <div class="form-group">
                    <button class="btn btn-warning" onclick="recordPayment('${id}')">تسجيل دفعة</button>
                    <button class="btn btn-success" onclick="printCustomerStatement('${id}')">طباعة كشف الحساب</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('customer-details-modal').style.display = 'block';
}

function printCustomerStatement(customerId) {
    const customer = db.getById('customers', customerId);
    const sales = db.getAll('sales').filter(sale => sale.customerId === customerId);
    const ex = parseFloat(localStorage.getItem('exchangeRate')) || 1;
    const balanceSYP = (db.getCustomerBalanceSYP ? db.getCustomerBalanceSYP(customerId) : getPriceInSYP(db.getCustomerBalance(customerId)));
    const balanceUSD = convertSYPToUSD ? convertSYPToUSD(balanceSYP) : (balanceSYP / ex);

    const statementWindow = window.open('', '_blank');
    const settings = JSON.parse(localStorage.getItem('settings')) || {};

    statementWindow.document.write(`
        <html dir="rtl">
        <head>
            <title>كشف حساب العميل</title>
            <style>
                body { font-family: Arial, sans-serif; direction: rtl; padding: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .customer-info { margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                .balance { font-weight: bold; font-size: 1.2em; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${settings.companyName || 'شركة سلمان'}</h1>
                <h2>كشف حساب العميل</h2>
            </div>

            <div class="customer-info">
                <p><strong>اسم العميل:</strong> ${customer.name}</p>
                <p><strong>رقم الهاتف:</strong> ${customer.phone || 'غير محدد'}</p>
                <p><strong>تاريخ الكشف:</strong> ${formatDate(new Date())}</p>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>التاريخ</th>
                        <th>الوصف</th>
                        <th>مدين</th>
                        <th>دائن</th>
                        <th>الرصيد</th>
                    </tr>
                </thead>
                <tbody>
                    ${
                        (() => {
                            const ex = parseFloat(localStorage.getItem('exchangeRate')) || 1;
                            const sorted = [...sales].sort((a, b) => new Date(a.date) - new Date(b.date));
                            let runningSYP = 0;
                            return sorted.map(sale => {
                                const isPayment = !!sale.isPayment || ((sale.total === 0 || sale.total == null) && (sale.paidSYP || sale.totalSYP));
                                const totalUSD = sale.total || 0;
                                const paidUSD = sale.paid || 0;
                                const totalSYP = (sale.totalSYP !== undefined && sale.totalSYP !== null)
                                    ? sale.totalSYP
                                    : (typeof getPriceInSYP === 'function' ? getPriceInSYP(totalUSD) : 0);
                                const paidSYP = sale.paidSYP || (typeof getPriceInSYP === 'function' ? getPriceInSYP(paidUSD) : 0);
    
                                if (isPayment) {
                                    const paymentSYP = Math.abs(paidSYP || totalSYP);
                                    const paymentUSD = (typeof convertSYPToUSD === 'function') ? convertSYPToUSD(paymentSYP) : (paymentSYP / ex);
                                    runningSYP -= paymentSYP;
                                    const runningUSD = (typeof convertSYPToUSD === 'function') ? convertSYPToUSD(runningSYP) : (runningSYP / ex);
                                    return `
                                        <tr>
                                            <td>${formatDate(sale.date)}</td>
                                            <td>دفعة على الحساب</td>
                                            <td>—</td>
                                            <td>${formatCurrencySYP(paymentSYP)}<br><small>(${formatCurrency(paymentUSD)})</small></td>
                                            <td>${formatCurrencySYP(runningSYP)}<br><small>(${formatCurrency(runningUSD)})</small></td>
                                        </tr>
                                    `;
                                } else {
                                    const deltaSYP = totalSYP - (paidSYP || 0);
                                    runningSYP += deltaSYP;
                                    const runningUSD = (typeof convertSYPToUSD === 'function') ? convertSYPToUSD(runningSYP) : (runningSYP / ex);
                                    return `
                                        <tr>
                                            <td>${formatDate(sale.date)}</td>
                                            <td>فاتورة بيع رقم ${sale.id}</td>
                                            <td>${formatCurrencySYP(totalSYP)}<br><small>(${formatCurrency(totalUSD)})</small></td>
                                            <td>${formatCurrencySYP(paidSYP)}<br><small>(${formatCurrency(paidUSD)})</small></td>
                                            <td>${formatCurrencySYP(runningSYP)}<br><small>(${formatCurrency(runningUSD)})</small></td>
                                        </tr>
                                    `;
                                }
                            }).join('');
                        })()
                    }
                </tbody>
            </table>

            <div class="balance">
                <p><strong>الرصيد الحالي: ${formatCurrencySYP(Math.abs(balanceSYP))} <small>(${formatCurrency(Math.abs(balanceUSD))})</small></strong></p>
            </div>
        </body>
        </html>
    `);

    statementWindow.document.close();
    statementWindow.print();
}

function recordPayment(customerId) {
    const input = document.getElementById('customer-payment-amount');
    const valueSYP = input ? parseFloat(input.value) : NaN;

    if (isNaN(valueSYP) || valueSYP <= 0) {
        showMessage('يرجى إدخال الدفعة الجزئية بالليرة السورية بشكل صحيح', 'error');
        return;
    }

    const paymentData = {
        customerId: customerId,
        customerName: db.getById('customers', customerId).name,
        items: [{ name: 'دفعة على الحساب', price: 0, quantity: 1 }],
        subtotal: 0,
        tax: 0,
        total: 0,               // لا نستخدم الدولار في الحسابات
        totalSYP: -valueSYP,    // سالب لأن هذه دفعة تُنقص الدين
        paymentMethod: 'cash',
        paidSYP: valueSYP,      // المبلغ المدفوع بالليرة
        change: 0,
        date: new Date().toISOString(),
        isPayment: true
    };

    db.save('sales', paymentData);

    // تفريغ الحقل وتحديث الواجهات مع إبقاء نافذة التفاصيل مفتوحة
    if (input) input.value = '';
    loadCustomersData();
    viewCustomerDetails(customerId);
    showMessage('تم تسجيل الدفعة بنجاح', 'success');
}

function closeCustomerModal() {
    document.getElementById('customer-modal').style.display = 'none';
    document.getElementById('customer-form').reset();
    delete document.getElementById('customer-form').dataset.customerId;
}

function closeCustomerDetailsModal() {
    document.getElementById('customer-details-modal').style.display = 'none';
}