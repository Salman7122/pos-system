// reports.js - التقارير والإحصائيات
function loadReports() {
    const content = document.getElementById('page-content');
    content.innerHTML = `
        <div class="reports-page">
            <div class="page-header">
                <h1>التقارير والإحصائيات</h1>
            </div>

            <div class="reports-container">
                <div class="reports-section">
                    <h2>تقارير المبيعات والفواتير</h2>
                    <hr class="section-divider">
                    <div class="reports-grid">
                        <div class="report-card">
                            <h3>تقرير المبيعات</h3>
                            <div class="report-filters">
                                <select id="sales-period">
                                    <option value="day">يومي</option>
                                    <option value="month">شهري</option>
                                    <option value="year">سنوي</option>
                                </select>
                                <button class="btn btn-success" onclick="generateSalesReport()">إنشاء التقرير</button>
                            </div>
                            <div id="sales-report-content" class="report-content">
                                <!-- سيتم ملؤها ديناميكياً -->
                            </div>
                        </div>

                        <div class="report-card">
                            <h3>تقرير الفواتير</h3>
                            <div class="report-filters">
                                <select id="invoices-period">
                                    <option value="all">جميع الفواتير</option>
                                    <option value="day">اليوم</option>
                                    <option value="month">الشهر الحالي</option>
                                    <option value="year">السنة الحالية</option>
                                </select>
                                <button class="btn btn-success" onclick="generateInvoicesReport()">إنشاء التقرير</button>
                            </div>
                            <div id="invoices-report-content" class="report-content">
                                <!-- سيتم ملؤها ديناميكياً -->
                            </div>
                        </div>
                    </div>
                </div>

                <div class="reports-section">
                    <h2>تقارير المخزون والعملاء</h2>
                    <hr class="section-divider">
                    <div class="reports-grid">
                        <div class="report-card">
                            <h3>تقرير المخزون</h3>
                            <button class="btn btn-success" onclick="generateInventoryReport()">إنشاء التقرير</button>
                            <div id="inventory-report-content" class="report-content">
                                <!-- سيتم ملؤها ديناميكياً -->
                            </div>
                        </div>

                        <div class="report-card">
                            <h3>تقرير العملاء</h3>
                            <button class="btn btn-success" onclick="generateCustomersReport()">إنشاء التقرير</button>
                            <div id="customers-report-content" class="report-content">
                                <!-- سيتم ملؤها ديناميكياً -->
                            </div>
                        </div>
                    </div>
                </div>

                <div class="reports-section">
                    <h2>تقارير الموردين والمالية</h2>
                    <hr class="section-divider">
                    <div class="reports-grid">
                        <div class="report-card">
                            <h3>تقرير الموردين</h3>
                            <button class="btn btn-success" onclick="generateSuppliersReport()">إنشاء التقرير</button>
                            <div id="suppliers-report-content" class="report-content">
                                <!-- سيتم ملؤها ديناميكياً -->
                            </div>
                        </div>

                        <div class="report-card">
                            <h3>تقرير الأرباح والخسائر</h3>
                            <div class="report-filters">
                                <select id="pnl-period">
                                    <option value="month">شهري</option>
                                    <option value="year">سنوي</option>
                                </select>
                                <button class="btn btn-success" onclick="generatePnLReport()">إنشاء التقرير</button>
                            </div>
                            <div id="pnl-report-content" class="report-content">
                                <!-- سيتم ملؤها ديناميكياً -->
                            </div>
                        </div>
                    </div>
                </div>

                <div class="reports-section">
                    <h2>تقارير المشتريات</h2>
                    <hr class="section-divider">
                    <div class="reports-grid">
                        <div class="report-card">
                            <h3>تقرير المشتريات</h3>
                            <div class="report-filters">
                                <select id="purchases-period">
                                    <option value="day">يومي</option>
                                    <option value="month">شهري</option>
                                    <option value="year">سنوي</option>
                                </select>
                                <button class="btn btn-success" onclick="generatePurchasesReport()">إنشاء التقرير</button>
                            </div>
                            <div id="purchases-report-content" class="report-content">
                                <!-- سيتم ملؤها ديناميكياً -->
                            </div>
                        </div>
                    </div>
                </div>

                <div class="reports-section">
                    <h2>تقارير الفواتير المعدلة</h2>
                    <hr class="section-divider">
                    <div class="reports-grid">
                        <div class="report-card">
                            <h3>تقرير الفواتير المعدلة</h3>
                            <button class="btn btn-success" onclick="generateModifiedInvoicesReport()">إنشاء التقرير</button>
                            <div id="modified-invoices-report-content" class="report-content">
                                <!-- سيتم ملؤها ديناميكياً -->
                            </div>
                        </div>
                    </div>
                </div>

                <div class="reports-section">
                    <h2>إحصائيات سريعة</h2>
                    <hr class="section-divider">
                    <div class="report-card full-width">
                        <div id="quick-stats" class="quick-stats">
                            <!-- سيتم ملؤها ديناميكياً -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- نافذة تفاصيل الفاتورة -->
            <div id="invoice-details-modal" class="modal">
                <div class="modal-content large">
                    <div class="modal-header">
                        <h3>تفاصيل الفاتورة</h3>
                        <span class="close" onclick="closeInvoiceDetailsModal()">&times;</span>
                    </div>
                    <div id="invoice-details-content">
                        <!-- سيتم ملؤها ديناميكياً -->
                    </div>
                </div>
            </div>

            <!-- نافذة تعديل الفاتورة -->
            <div id="edit-invoice-modal" class="modal">
                <div class="modal-content large">
                    <div class="modal-header">
                        <h3>تعديل الفاتورة</h3>
                        <span class="close" onclick="closeEditInvoiceModal()">&times;</span>
                    </div>
                    <div id="edit-invoice-content">
                        <!-- سيتم ملؤها ديناميكياً -->
                    </div>
                </div>
            </div>
        </div>
    `;

    loadQuickStats();
}

function loadQuickStats() {
    const sales = db.getAll('sales');
    const purchases = db.getAll('purchases');
    const products = db.getAll('products');
    const customers = db.getAll('customers');

    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.total, 0);
    const profit = totalSales - totalPurchases;
    const lowStockProducts = products.filter(p => p.quantity <= 5).length;
    const debtorCustomers = customers.filter(c => db.getCustomerBalance(c.id) > 0).length;

    const statsHtml = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">إجمالي المبيعات</div>
                <div class="stat-value">${formatCurrency(totalSales)}</div>
                <div class="stat-value-syp">${formatCurrencySYP(sales.reduce((sum, sale) => sum + (sale.totalSYP || (sale.total * (sale.exchangeRate || 1))), 0))}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">إجمالي المشتريات</div>
                <div class="stat-value">${formatCurrency(totalPurchases)}</div>
                <div class="stat-value-syp">${formatCurrencySYP(purchases.reduce((sum, purchase) => sum + (purchase.totalSYP || (purchase.total * (purchase.exchangeRate || 1))), 0))}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">صافي الربح</div>
                <div class="stat-value ${profit >= 0 ? 'profit' : 'loss'}">${formatCurrency(profit)}</div>
                <div class="stat-value-syp ${profit >= 0 ? 'profit' : 'loss'}">${formatCurrencySYP((sales.reduce((sum, sale) => sum + (sale.totalSYP || (sale.total * (sale.exchangeRate || 1))), 0)) - (purchases.reduce((sum, purchase) => sum + (purchase.totalSYP || (purchase.total * (purchase.exchangeRate || 1))), 0)))}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">منتجات منخفضة المخزون</div>
                <div class="stat-value">${lowStockProducts}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">عملاء مدينون</div>
                <div class="stat-value">${debtorCustomers}</div>
            </div>
        </div>
    `;

    document.getElementById('quick-stats').innerHTML = statsHtml;
}

function generateSalesReport() {
    const period = document.getElementById('sales-period').value;
    const report = db.getSalesReport(period);

    const content = document.getElementById('sales-report-content');
    content.innerHTML = `
        <div class="report-header">
            <h4>تقرير المبيعات ${period === 'day' ? 'اليومي' : period === 'month' ? 'الشهري' : 'السنوي'}</h4>
            <button class="btn btn-warning" onclick="printReport('sales-report-content')">طباعة</button>
        </div>
        <div class="report-summary">
            <p><strong>عدد المبيعات:</strong> ${report.count}</p>
            <p><strong>إجمالي المبيعات:</strong> ${formatCurrency(report.total)} (${formatCurrencySYP(report.sales.reduce((sum, sale) => sum + (sale.totalSYP || (sale.total * (sale.exchangeRate || 1))), 0))})</p>
        </div>
        <table class="table">
            <thead>
                <tr>
                    <th>رقم الفاتورة</th>
                    <th>العميل</th>
                    <th>التاريخ</th>
                    <th>المبلغ (دولار)</th>
                    <th>المبلغ (ليرة)</th>
                    <th>طريقة الدفع</th>
                </tr>
            </thead>
            <tbody>
                ${report.sales.map(sale => {
                    const isPayment = sale.isPayment || (sale.total === 0 && ((sale.paid || 0) > 0 || (sale.paidSYP || 0) > 0));
                    let amountUSD, amountSYP, method;
                    if (isPayment) {
                        amountSYP = sale.paidSYP || sale.paid || 0;
                        amountUSD = amountSYP / (sale.exchangeRate || getPriceInSYP(1));
                        method = 'دفعة على الحساب';
                    } else {
                        amountUSD = sale.total;
                        amountSYP = sale.totalSYP || (sale.total * (sale.exchangeRate || 1));
                        method = sale.paymentMethod === 'cash' ? 'نقدي' : 'آجل';
                    }
                    return `
                        <tr>
                            <td>${sale.id}</td>
                            <td>${sale.customerName}</td>
                            <td>${formatDate(sale.date)}</td>
                            <td>${formatCurrency(amountUSD)}</td>
                            <td>${formatCurrencySYP(amountSYP)}</td>
                            <td>${method}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function generateInvoicesReport() {
    const period = document.getElementById('invoices-period').value;
    let sales = db.getAll('sales');

    // فلترة حسب الفترة
    if (period !== 'all') {
        const now = new Date();
        let startDate;

        switch(period) {
            case 'day':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
        }

        sales = sales.filter(sale => new Date(sale.date) >= startDate);
    }

    const content = document.getElementById('invoices-report-content');
    content.innerHTML = `
        <div class="report-header">
            <h4>تقرير الفواتير ${period === 'all' ? 'جميع الفواتير' : period === 'day' ? 'اليوم' : period === 'month' ? 'الشهر الحالي' : 'السنة الحالية'}</h4>
            <button class="btn btn-warning" onclick="printReport('invoices-report-content')">طباعة</button>
        </div>
        <div class="report-summary">
            <p><strong>عدد الفواتير:</strong> ${sales.length}</p>
            <p><strong>إجمالي المبيعات:</strong> ${formatCurrency(sales.reduce((sum, sale) => sum + sale.total, 0))} (${formatCurrencySYP(sales.reduce((sum, sale) => sum + (sale.totalSYP || (sale.total * (sale.exchangeRate || 1))), 0))})</p>
        </div>
        <table class="table">
            <thead>
                <tr>
                    <th>رقم الفاتورة</th>
                    <th>العميل</th>
                    <th>التاريخ</th>
                    <th>المبلغ (دولار)</th>
                    <th>المبلغ (ليرة)</th>
                    <th>طريقة الدفع</th>
                    <th>الحالة</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody>
                ${sales.map(sale => {
                    const isPayment = sale.isPayment || (sale.total === 0 && ((sale.paid || 0) > 0 || (sale.paidSYP || 0) > 0));
                    let amountUSD, amountSYP;
                    if (isPayment) {
                        amountSYP = sale.paidSYP || sale.paid || 0;
                        amountUSD = amountSYP / (sale.exchangeRate || getPriceInSYP(1));
                    } else {
                        amountUSD = sale.total;
                        amountSYP = sale.totalSYP || (sale.total * (sale.exchangeRate || 1));
                    }
                    const status = isPayment ? 'دفعة على الحساب' : (sale.paymentMethod === 'cash' ? 'مدفوعة' : ((sale.paid || 0) >= sale.total ? 'مدفوعة' : 'غير مدفوعة'));
                    return `
                        <tr>
                            <td>${sale.id}</td>
                            <td>${sale.customerName}</td>
                            <td>${formatDate(sale.date)}</td>
                            <td>${formatCurrency(amountUSD)}</td>
                            <td>${formatCurrencySYP(amountSYP)}</td>
                            <td>${sale.paymentMethod === 'cash' ? 'نقدي' : 'آجل'}</td>
                            <td>${status}</td>
                            <td>
                                <button class="btn btn-info" onclick="viewInvoiceDetails('${sale.id}')">تفاصيل</button>
                                <button class="btn btn-warning" onclick="openEditInvoiceModal('${sale.id}')">تعديل</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function generateInventoryReport() {
    const report = db.getInventoryReport();

    const content = document.getElementById('inventory-report-content');
    content.innerHTML = `
        <div class="report-header">
            <h4>تقرير المخزون</h4>
            <button class="btn btn-warning" onclick="printReport('inventory-report-content')">طباعة</button>
        </div>
        <div class="report-summary">
            <p><strong>إجمالي قيمة المخزون:</strong> ${formatCurrency(report.totalValue)} (${formatCurrencySYP(getPriceInSYP(report.totalValue))})</p>
            <p><strong>منتجات منخفضة المخزون:</strong> ${report.lowStock}</p>
            <p><strong>منتجات نفدت:</strong> ${report.outOfStock}</p>
        </div>
        <table class="table">
            <thead>
                <tr>
                    <th>اسم المنتج</th>
                    <th>الفئة</th>
                    <th>السعر (دولار)</th>
                    <th>السعر (ليرة)</th>
                    <th>الكمية</th>
                    <th>إجمالي القيمة (دولار)</th>
                    <th>إجمالي القيمة (ليرة)</th>
                    <th>الحالة</th>
                </tr>
            </thead>
            <tbody>
                ${report.products.map(product => `
                    <tr>
                        <td>${product.name}</td>
                        <td>${product.category || ''}</td>
                        <td>${formatCurrency(product.price)}</td>
                        <td>${formatCurrencySYP(getPriceInSYP(product.price))}</td>
                        <td>${product.quantity}</td>
                        <td>${formatCurrency(product.price * product.quantity)}</td>
                        <td>${formatCurrencySYP(getPriceInSYP(product.price * product.quantity))}</td>
                        <td class="${product.quantity === 0 ? 'danger' : product.quantity <= 0.25 * (product.originalQuantity || product.quantity) ? 'danger' : ''}">
                            ${product.quantity === 0 ? 'نفد' : product.quantity <= 0.25 * (product.originalQuantity || product.quantity) ? 'منخفض' : 'متوفر'}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function generateCustomersReport() {
    const customers = db.getAll('customers');
    const customerData = customers.map(customer => ({
        ...customer,
        balance: db.getCustomerBalance(customer.id),
        totalSales: db.getAll('sales').filter(s => s.customerId === customer.id).reduce((sum, s) => sum + s.total, 0)
    })).filter(c => c.balance !== 0);

    const content = document.getElementById('customers-report-content');
    content.innerHTML = `
        <div class="report-header">
            <h4>تقرير العملاء</h4>
            <button class="btn btn-warning" onclick="printReport('customers-report-content')">طباعة</button>
        </div>
        <div class="report-summary">
            <p><strong>عدد العملاء:</strong> ${customerData.length}</p>
            <p><strong>عملاء مدينون:</strong> ${customerData.filter(c => c.balance > 0).length}</p>
            <p><strong>إجمالي المدفوعات المستحقة:</strong> ${formatCurrency(customerData.reduce((sum, c) => sum + Math.max(0, c.balance), 0))} (${formatCurrencySYP(customerData.reduce((sum, c) => sum + Math.max(0, c.balanceSYP || getPriceInSYP(c.balance)), 0))})</p>
        </div>
        <table class="table">
            <thead>
                <tr>
                    <th>اسم العميل</th>
                    <th>الهاتف</th>
                    <th>إجمالي المبيعات (دولار)</th>
                    <th>إجمالي المبيعات (ليرة)</th>
                    <th>الرصيد الحالي (دولار)</th>
                    <th>الرصيد الحالي (ليرة)</th>
                    <th>الحالة</th>
                </tr>
            </thead>
            <tbody>
                ${customerData.map(customer => `
                    <tr>
                        <td>${customer.name}</td>
                        <td>${customer.phone || ''}</td>
                        <td>${formatCurrency(customer.totalSales)}</td>
                        <td>${formatCurrencySYP(customer.totalSalesSYP || getPriceInSYP(customer.totalSales))}</td>
                        <td class="${customer.balance > 0 ? 'debt' : customer.balance < 0 ? 'credit' : ''}">${formatCurrency(customer.balance)}</td>
                        <td class="${customer.balance > 0 ? 'debt' : customer.balance < 0 ? 'credit' : ''}">${formatCurrencySYP(customer.balanceSYP || getPriceInSYP(customer.balance))}</td>
                        <td>${customer.balance > 0 ? 'مدين' : customer.balance < 0 ? 'دائن' : 'متوازن'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function generateSuppliersReport() {
    const suppliers = db.getAll('suppliers');
    const supplierData = suppliers.map(supplier => ({
        ...supplier,
        balance: calculateSupplierBalance(supplier.id),
        totalPurchases: db.getAll('purchases').filter(p => p.supplierId === supplier.id).reduce((sum, p) => sum + p.total, 0)
    }));

    const content = document.getElementById('suppliers-report-content');
    content.innerHTML = `
        <div class="report-header">
            <h4>تقرير الموردين</h4>
            <button class="btn btn-warning" onclick="printReport('suppliers-report-content')">طباعة</button>
        </div>
        <div class="report-summary">
            <p><strong>عدد الموردين:</strong> ${suppliers.length}</p>
            <p><strong>موردون مدينون:</strong> ${supplierData.filter(s => s.balance > 0).length}</p>
            <p><strong>إجمالي المدفوعات المستحقة:</strong> ${formatCurrency(supplierData.reduce((sum, s) => sum + Math.max(0, s.balance), 0))} (${formatCurrencySYP(getPriceInSYP(supplierData.reduce((sum, s) => sum + Math.max(0, s.balance), 0)))})</p>
        </div>
        <table class="table">
            <thead>
                <tr>
                    <th>اسم المورد</th>
                    <th>الهاتف</th>
                    <th>إجمالي المشتريات (دولار)</th>
                    <th>إجمالي المشتريات (ليرة)</th>
                    <th>الرصيد الحالي (دولار)</th>
                    <th>الرصيد الحالي (ليرة)</th>
                    <th>الحالة</th>
                </tr>
            </thead>
            <tbody>
                ${supplierData.map(supplier => `
                    <tr>
                        <td>${supplier.name}</td>
                        <td>${supplier.phone || ''}</td>
                        <td>${formatCurrency(supplier.totalPurchases)}</td>
                        <td>${formatCurrencySYP(getPriceInSYP(supplier.totalPurchases))}</td>
                        <td class="${supplier.balance > 0 ? 'debt' : supplier.balance < 0 ? 'credit' : ''}">${formatCurrency(supplier.balance)}</td>
                        <td class="${supplier.balance > 0 ? 'debt' : supplier.balance < 0 ? 'credit' : ''}">${formatCurrencySYP(getPriceInSYP(supplier.balance))}</td>
                        <td>${supplier.balance > 0 ? 'مدين' : supplier.balance < 0 ? 'دائن' : 'متوازن'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function generatePnLReport() {
    const period = document.getElementById('pnl-period').value;
    const now = new Date();
    let startDate;

    if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
        startDate = new Date(now.getFullYear(), 0, 1);
    }

    const sales = db.getSalesByDateRange(startDate, now);
    const purchases = db.getPurchasesByDateRange(startDate, now);

    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.total, 0);
    const profit = totalSales - totalPurchases;

    const content = document.getElementById('pnl-report-content');
    content.innerHTML = `
        <div class="report-header">
            <h4>تقرير الأرباح والخسائر ${period === 'month' ? 'الشهري' : 'السنوي'}</h4>
            <button class="btn btn-warning" onclick="printReport('pnl-report-content')">طباعة</button>
        </div>
        <div class="report-summary">
            <div class="pnl-summary">
                <div class="pnl-item">
                    <span class="pnl-label">إجمالي الإيرادات (المبيعات):</span>
                    <span class="pnl-value revenue">${formatCurrency(totalSales)}</span>
                    <span class="pnl-value-syp">${formatCurrencySYP(sales.reduce((sum, sale) => sum + (sale.totalSYP || (sale.total * (sale.exchangeRate || 1))), 0))}</span>
                </div>
                <div class="pnl-item">
                    <span class="pnl-label">إجمالي المصروفات (المشتريات):</span>
                    <span class="pnl-value expense">${formatCurrency(totalPurchases)}</span>
                    <span class="pnl-value-syp">${formatCurrencySYP(purchases.reduce((sum, purchase) => sum + (purchase.totalSYP || (purchase.total * (purchase.exchangeRate || 1))), 0))}</span>
                </div>
                <div class="pnl-item total">
                    <span class="pnl-label">صافي الربح/الخسارة:</span>
                    <span class="pnl-value ${profit >= 0 ? 'profit' : 'loss'}">${formatCurrency(profit)}</span>
                    <span class="pnl-value-syp ${profit >= 0 ? 'profit' : 'loss'}">${formatCurrencySYP((sales.reduce((sum, sale) => sum + (sale.totalSYP || (sale.total * (sale.exchangeRate || 1))), 0)) - (purchases.reduce((sum, purchase) => sum + (purchase.totalSYP || (purchase.total * (purchase.exchangeRate || 1))), 0)))}</span>
                </div>
            </div>
        </div>
        <div class="pnl-details">
            <div class="pnl-section">
                <h5>تفاصيل المبيعات</h5>
                <p>عدد الفواتير: ${sales.length}</p>
                <p>متوسط المبيعات: ${sales.length > 0 ? formatCurrency(totalSales / sales.length) : '0.00 ريال'}</p>
            </div>
            <div class="pnl-section">
                <h5>تفاصيل المشتريات</h5>
                <p>عدد الفواتير: ${purchases.length}</p>
                <p>متوسط المشتريات: ${purchases.length > 0 ? formatCurrency(totalPurchases / purchases.length) : '0.00 ريال'}</p>
            </div>
        </div>
    `;
}

function generatePurchasesReport() {
    const period = document.getElementById('purchases-period').value;
    const report = db.getPurchasesReport(period);

    const content = document.getElementById('purchases-report-content');
    content.innerHTML = `
        <div class="report-header">
            <h4>تقرير المشتريات ${period === 'day' ? 'اليومي' : period === 'month' ? 'الشهري' : 'السنوي'}</h4>
            <button class="btn btn-warning" onclick="printReport('purchases-report-content')">طباعة</button>
        </div>
        <div class="report-summary">
            <p><strong>عدد المشتريات:</strong> ${report.count}</p>
            <p><strong>إجمالي المشتريات:</strong> ${formatCurrency(report.total)} (${formatCurrencySYP(getPriceInSYP(report.total))})</p>
        </div>
        <table class="table">
            <thead>
                <tr>
                    <th>رقم الفاتورة</th>
                    <th>المورد</th>
                    <th>التاريخ</th>
                    <th>المبلغ (دولار)</th>
                    <th>المبلغ (ليرة)</th>
                    <th>المدفوع</th>
                    <th>الباقي</th>
                </tr>
            </thead>
            <tbody>
                ${report.purchases.map(purchase => `
                    <tr>
                        <td>${purchase.id}</td>
                        <td>${purchase.supplierName || 'غير محدد'}</td>
                        <td>${formatDate(purchase.date)}</td>
                        <td>${formatCurrency(purchase.total)}</td>
                        <td>${formatCurrencySYP(getPriceInSYP(purchase.total))}</td>
                        <td>${formatCurrency(purchase.paid || 0)}</td>
                        <td>${formatCurrency(purchase.total - (purchase.paid || 0))}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function printReport(reportId) {
    const reportContent = document.getElementById(reportId).innerHTML;
    const printWindow = window.open('', '_blank');
    const settings = JSON.parse(localStorage.getItem('settings')) || {};

    printWindow.document.write(`
        <html dir="rtl">
        <head>
            <title>تقرير</title>
            <style>
                body { font-family: Arial, sans-serif; direction: rtl; padding: 20px; }
                .report-header { text-align: center; margin-bottom: 20px; }
                .report-summary { margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
                th, td { border: 1px solid #ddd; padding: 6px; text-align: right; }
                .pnl-summary { margin: 20px 0; }
                .pnl-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                .pnl-item.total { border-top: 2px solid #333; font-weight: bold; }
                .revenue { color: green; }
                .expense { color: red; }
                .profit { color: green; }
                .loss { color: red; }
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem; }
                .stat-card { background: #f9f9f9; padding: 1rem; border-radius: 10px; text-align: center; border: 1px solid #e0e0e0; }
                .stat-card .stat-label { font-size: 0.9rem; color: #666; margin-bottom: 0.5rem; font-weight: 600; }
                .stat-card .stat-value { font-size: 1.2rem; font-weight: bold; color: #1976d2; margin-bottom: 0.25rem; }
                .stat-card .stat-value-syp { font-size: 0.8rem; color: #10b981; font-weight: 600; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${settings.companyName || 'شركة سلمان'}</h1>
                <p>نظام إدارة نقاط البيع</p>
                <p>تاريخ التقرير: ${formatDate(new Date())}</p>
            </div>
            ${reportContent}
        </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.print();
}

function viewInvoiceDetails(invoiceId) {
    const invoice = db.getById('sales', invoiceId);
    if (!invoice) return;

    const customer = invoice.customerId ? db.getById('customers', invoice.customerId) : null;

    const content = document.getElementById('invoice-details-content');
    content.innerHTML = `
        <div class="invoice-details-section">
            <div class="invoice-header">
                <h4>فاتورة رقم: ${invoice.id}</h4>
                <p><strong>التاريخ:</strong> ${formatDate(invoice.date)}</p>
                <p><strong>العميل:</strong> ${invoice.customerName}</p>
                <p><strong>طريقة الدفع:</strong> ${invoice.paymentMethod === 'cash' ? 'نقدي' : 'آجل'}</p>
            </div>

            <div class="invoice-items">
                <h5>تفاصيل المنتجات</h5>
                <table class="table">
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
                            let itemsToShow = invoice.items;
                            if (invoice.isPayment) {
                                itemsToShow = [{
                                    name: "دفعة على الحساب",
                                    quantity: 1,
                                    price: convertSYPToUSD(invoice.paidSYP || 0)
                                }];
                            }
                            return itemsToShow.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.quantity}</td>
                                    <td>${formatCurrency(item.price)}</td>
                                    <td>${formatCurrencySYP(getPriceInSYP(item.price))}</td>
                                    <td>${formatCurrency(item.price * item.quantity)}</td>
                                    <td>${formatCurrencySYP(getPriceInSYP(item.price * item.quantity))}</td>
                                </tr>
                            `).join('');
                        })()}
                    </tbody>
                </table>
            </div>

            <div class="invoice-totals">
                <div class="total-row">
                    <span>المجموع الكلي (دولار):</span>
                    <span>${formatCurrency(invoice.total)}</span>
                </div>
                <div class="total-row">
                    <span>المجموع الكلي (ليرة):</span>
                    <span>${formatCurrencySYP(getPriceInSYP(invoice.total))}</span>
                </div>
                <div class="total-row">
                    <span>المدفوع (دولار):</span>
                    <span>${formatCurrency(invoice.paid || 0)}</span>
                </div>
                <div class="total-row">
                    <span>المدفوع (ليرة):</span>
                    <span>${formatCurrencySYP(getPriceInSYP(invoice.paid || 0))}</span>
                </div>
                <div class="total-row">
                    <span>الباقي (دولار):</span>
                    <span>${formatCurrency(invoice.total - (invoice.paid || 0))}</span>
                </div>
                <div class="total-row">
                    <span>الباقي (ليرة):</span>
                    <span>${formatCurrencySYP(getPriceInSYP(invoice.total - (invoice.paid || 0)))}</span>
                </div>
            </div>

            <div class="invoice-actions">
                <button class="btn btn-warning" onclick="printInvoice('${invoice.id}')">طباعة الفاتورة</button>
                <button class="btn btn-success" onclick="closeInvoiceDetailsModal()">إغلاق</button>
            </div>
        </div>
    `;

    document.getElementById('invoice-details-modal').style.display = 'block';
}

function closeInvoiceDetailsModal() {
    document.getElementById('invoice-details-modal').style.display = 'none';
}

function printInvoice(invoiceId) {
    const invoice = db.getById('sales', invoiceId);
    if (invoice) {
        // استدعاء دالة الطباعة من sales.js
        if (typeof window.printInvoice === 'function') {
            window.printInvoice(invoice);
        }
    }
}

// دالة مساعدة لحساب رصيد المورد
function calculateSupplierBalance(supplierId) {
    const purchases = db.getAll('purchases').filter(purchase => purchase.supplierId === supplierId);
    const totalPurchases = purchases.reduce((total, purchase) => total + purchase.total, 0);
    const totalPaid = purchases.reduce((total, purchase) => total + (purchase.paid || 0), 0);
    return totalPurchases - totalPaid;
}

// دوال تعديل الفاتورة
function openEditInvoiceModal(invoiceId) {
    const invoice = db.getById('sales', invoiceId);
    if (!invoice) return;

    const customers = db.getAll('customers');
    const products = db.getAll('products');

    const content = document.getElementById('edit-invoice-content');
    content.innerHTML = `
        <form id="edit-invoice-form">
            <div class="form-section">
                <h4>معلومات الفاتورة</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-invoice-date">التاريخ:</label>
                        <input type="date" id="edit-invoice-date" value="${invoice.date.split('T')[0]}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-invoice-customer">العميل:</label>
                        <select id="edit-invoice-customer" required>
                            <option value="">اختر العميل</option>
                            ${customers.map(customer => `<option value="${customer.id}" ${invoice.customerId === customer.id ? 'selected' : ''}>${customer.name}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-invoice-payment-method">طريقة الدفع:</label>
                        <select id="edit-invoice-payment-method" required>
                            <option value="cash" ${invoice.paymentMethod === 'cash' ? 'selected' : ''}>نقدي</option>
                            <option value="credit" ${invoice.paymentMethod === 'credit' ? 'selected' : ''}>آجل</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit-invoice-paid">المدفوع (دولار):</label>
                        <input type="number" id="edit-invoice-paid" step="0.01" value="${invoice.paid || 0}" min="0">
                    </div>
                </div>
            </div>

            <div class="form-section">
                <h4>المنتجات</h4>
                <div id="edit-invoice-items">
                    ${invoice.items.map((item, index) => `
                        <div class="item-row" data-index="${index}">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>المنتج:</label>
                                    <select class="edit-item-product" required>
                                        <option value="">اختر المنتج</option>
                                        ${products.map(product => `<option value="${product.id}" ${product.name === item.name ? 'selected' : ''}>${product.name}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>الكمية:</label>
                                    <input type="number" class="edit-item-quantity" step="0.01" value="${item.quantity}" min="0.01" required>
                                </div>
                                <div class="form-group">
                                    <label>السعر (دولار):</label>
                                    <input type="number" class="edit-item-price" step="0.01" value="${item.price}" min="0" required>
                                </div>
                                <button type="button" class="btn btn-danger" onclick="removeEditItem(this)">حذف</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button type="button" class="btn btn-success" onclick="addEditItem()">إضافة منتج</button>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-primary">حفظ التعديلات</button>
                <button type="button" class="btn btn-secondary" onclick="closeEditInvoiceModal()">إلغاء</button>
            </div>
        </form>
    `;

    // إضافة event listener للنموذج
    document.getElementById('edit-invoice-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveEditedInvoice(invoiceId);
    });

    document.getElementById('edit-invoice-modal').style.display = 'block';
}

function closeEditInvoiceModal() {
    document.getElementById('edit-invoice-modal').style.display = 'none';
}

function addEditItem() {
    const products = db.getAll('products');
    const itemsContainer = document.getElementById('edit-invoice-items');
    const index = itemsContainer.children.length;

    const itemHtml = `
        <div class="item-row" data-index="${index}">
            <div class="form-row">
                <div class="form-group">
                    <label>المنتج:</label>
                    <select class="edit-item-product" required>
                        <option value="">اختر المنتج</option>
                        ${products.map(product => `<option value="${product.id}">${product.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>الكمية:</label>
                    <input type="number" class="edit-item-quantity" step="0.01" min="0.01" required>
                </div>
                <div class="form-group">
                    <label>السعر (دولار):</label>
                    <input type="number" class="edit-item-price" step="0.01" min="0" required>
                </div>
                <button type="button" class="btn btn-danger" onclick="removeEditItem(this)">حذف</button>
            </div>
        </div>
    `;

    itemsContainer.insertAdjacentHTML('beforeend', itemHtml);
}

function removeEditItem(button) {
    button.closest('.item-row').remove();
}

function saveEditedInvoice(invoiceId) {
    const invoice = db.getById('sales', invoiceId);
    if (!invoice) return;

    // جمع البيانات من النموذج
    const date = document.getElementById('edit-invoice-date').value;
    const customerId = document.getElementById('edit-invoice-customer').value;
    const paymentMethod = document.getElementById('edit-invoice-payment-method').value;
    const paid = parseFloat(document.getElementById('edit-invoice-paid').value) || 0;

    // جمع المنتجات
    const itemRows = document.querySelectorAll('#edit-invoice-items .item-row');
    const items = [];
    let total = 0;

    for (let row of itemRows) {
        const productSelect = row.querySelector('.edit-item-product');
        const quantityInput = row.querySelector('.edit-item-quantity');
        const priceInput = row.querySelector('.edit-item-price');

        const productId = productSelect.value;
        const quantity = parseFloat(quantityInput.value);
        const price = parseFloat(priceInput.value);

        if (!productId || !quantity || price < 0) {
            showMessage('يرجى ملء جميع حقول المنتج بشكل صحيح', 'error');
            return;
        }

        const product = db.getById('products', productId);
        items.push({
            name: product.name,
            quantity: quantity,
            price: price
        });

        total += quantity * price;
    }

    if (items.length === 0) {
        showMessage('يجب إضافة منتج واحد على الأقل', 'error');
        return;
    }

    // حفظ النسخة الأصلية في الفواتير المعدلة قبل التعديل
    const originalModifiedSale = {
        originalSaleId: invoice.id,
        originalSale: { ...invoice },
        modifiedAt: new Date().toISOString(),
        reason: 'تعديل الفاتورة'
    };
    db.saveModifiedSale(originalModifiedSale);

    // تحديث الفاتورة
    const updatedInvoice = {
        ...invoice,
        date: date,
        customerId: customerId,
        customerName: customerId ? db.getById('customers', customerId).name : '',
        paymentMethod: paymentMethod,
        paid: paid,
        total: total,
        items: items,
        modifiedAt: new Date().toISOString(),
        modified: true
    };

    // حفظ في قاعدة البيانات
    db.save('sales', updatedInvoice);

    // إغلاق النافذة وإعادة تحميل التقرير
    closeEditInvoiceModal();
    generateInvoicesReport();

    showMessage('تم تعديل الفاتورة بنجاح', 'success');
}

function generateModifiedInvoicesReport() {
    const modifiedSales = db.getAllModifiedSales();

    const content = document.getElementById('modified-invoices-report-content');
    content.innerHTML = `
        <div class="report-header">
            <h4>تقرير الفواتير المعدلة</h4>
            <button class="btn btn-warning" onclick="printReport('modified-invoices-report-content')">طباعة</button>
        </div>
        <div class="report-summary">
            <p><strong>عدد الفواتير المعدلة:</strong> ${modifiedSales.length}</p>
        </div>
        <table class="table">
            <thead>
                <tr>
                    <th>رقم الفاتورة الأصلية</th>
                    <th>العميل</th>
                    <th>تاريخ التعديل</th>
                    <th>المبلغ الأصلي (دولار)</th>
                    <th>المبلغ الجديد (دولار)</th>
                    <th>الفرق (دولار)</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody>
                ${modifiedSales.map(modifiedSale => {
                    const originalSale = modifiedSale.originalSale;
                    const currentSale = db.getById('sales', modifiedSale.originalSaleId);
                    const difference = currentSale ? currentSale.total - originalSale.total : 0;

                    return `
                        <tr>
                            <td>${modifiedSale.originalSaleId}</td>
                            <td>${originalSale.customerName}</td>
                            <td>${formatDate(modifiedSale.modifiedAt)}</td>
                            <td>${formatCurrency(originalSale.total)}</td>
                            <td>${currentSale ? formatCurrency(currentSale.total) : 'غير متوفر'}</td>
                            <td class="${difference >= 0 ? 'profit' : 'loss'}">${formatCurrency(difference)}</td>
                            <td>
                                <button class="btn btn-info" onclick="viewModifiedInvoiceDetails('${modifiedSale.id}')">تفاصيل</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function viewModifiedInvoiceDetails(modifiedSaleId) {
    const modifiedSale = db.getAllModifiedSales().find(ms => ms.id === modifiedSaleId);
    if (!modifiedSale) return;

    const originalSale = modifiedSale.originalSale;
    const currentSale = db.getById('sales', modifiedSale.originalSaleId);

    const content = document.getElementById('invoice-details-content');
    content.innerHTML = `
        <div class="invoice-details-section">
            <div class="invoice-header">
                <h4>مقارنة الفاتورة المعدلة - رقم: ${modifiedSale.originalSaleId}</h4>
                <p><strong>تاريخ التعديل:</strong> ${formatDate(modifiedSale.modifiedAt)}</p>
                <p><strong>سبب التعديل:</strong> ${modifiedSale.reason}</p>
            </div>

            <div class="comparison-section">
                <div class="comparison-column">
                    <h5>الفاتورة الأصلية</h5>
                    <div class="invoice-info">
                        <p><strong>التاريخ:</strong> ${formatDate(originalSale.date)}</p>
                        <p><strong>العميل:</strong> ${originalSale.customerName}</p>
                        <p><strong>طريقة الدفع:</strong> ${originalSale.paymentMethod === 'cash' ? 'نقدي' : 'آجل'}</p>
                        <p><strong>المجموع الكلي:</strong> ${formatCurrency(originalSale.total)}</p>
                        <p><strong>المدفوع:</strong> ${formatCurrency(originalSale.paid || 0)}</p>
                    </div>

                    <h6>المنتجات الأصلية</h6>
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
                            ${originalSale.items.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.quantity}</td>
                                    <td>${formatCurrency(item.price)}</td>
                                    <td>${formatCurrency(item.price * item.quantity)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="comparison-column">
                    <h5>الفاتورة الحالية</h5>
                    ${currentSale ? `
                        <div class="invoice-info">
                            <p><strong>التاريخ:</strong> ${formatDate(currentSale.date)}</p>
                            <p><strong>العميل:</strong> ${currentSale.customerName}</p>
                            <p><strong>طريقة الدفع:</strong> ${currentSale.paymentMethod === 'cash' ? 'نقدي' : 'آجل'}</p>
                            <p><strong>المجموع الكلي:</strong> ${formatCurrency(currentSale.total)}</p>
                            <p><strong>المدفوع:</strong> ${formatCurrency(currentSale.paid || 0)}</p>
                        </div>

                        <h6>المنتجات الحالية</h6>
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
                                ${currentSale.items.map(item => `
                                    <tr>
                                        <td>${item.name}</td>
                                        <td>${item.quantity}</td>
                                        <td>${formatCurrency(item.price)}</td>
                                        <td>${formatCurrency(item.price * item.quantity)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<p>الفاتورة الحالية غير متوفرة</p>'}
                </div>
            </div>

            <div class="invoice-actions">
                <button class="btn btn-success" onclick="closeInvoiceDetailsModal()">إغلاق</button>
            </div>
        </div>
    `;

    document.getElementById('invoice-details-modal').style.display = 'block';
}
