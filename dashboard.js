// dashboard.js - لوحة التحكم

// دوال مساعدة
// دالة تنسيق الدولار
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}
function getPriceInSYP(usdPrice) {
    const exchangeRate = parseFloat(localStorage.getItem('exchangeRate')) || 1;
    return usdPrice * exchangeRate;
}

function formatCurrencySYP(amount) {
    return new Intl.NumberFormat('ar-SY', {
        style: 'currency',
        currency: 'SYP'
    }).format(amount);
}

function loadDashboard() {
    const content = document.getElementById('page-content');
    content.innerHTML = `
        <div class="dashboard">
            <h1>لوحة التحكم</h1>

            <div class="stats-grid">
                <div class="stat-card">
                    <h3>إجمالي المبيعات</h3>
                    <div class="stat-value">${formatCurrency(db.getTotalSales())}</div>
                    <div class="stat-value-syp">${formatCurrencySYP(getPriceInSYP(db.getTotalSales()))}</div>
                </div>
                <div class="stat-card">
                    <h3>عدد المنتجات</h3>
                    <div class="stat-value">${db.getAll('products').length}</div>
                </div>
                <div class="stat-card">
                    <h3>عدد العملاء</h3>
                    <div class="stat-value">${db.getAll('customers').length}</div>
                </div>
                <div class="stat-card">
                    <h3>المنتجات منخفضة المخزون</h3>
                    <div class="stat-value">${db.getLowStockProducts().length}</div>
                </div>
            </div>

            
                <div class="card">
                    <h3>تنبيهات المخزون</h3>
                    <div id="low-stock-alerts">
                        ${getLowStockAlerts()}
                    </div>
                </div>

                <div class="card">
                    <h3>أحدث المبيعات</h3>
                    <div id="recent-sales">
                        ${getRecentSales()}
                    </div>
                </div>

                <div class="card">
                    <h3>العملاء المدينون</h3>
                    <div id="debtor-customers">
                        ${getDebtorCustomers()}
                    </div>
                </div>
            </div>
        </div>
    `;

    // إضافة أنماط إضافية للوحة التحكم
    const style = document.createElement('style');
    style.textContent = `
        .dashboard h1 {
            margin-bottom: 2rem;
            color: var(--primary-color);
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .stat-card {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            padding: 1.5rem;
            border-radius: 20px;
            text-align: center;
            box-shadow: var(--shadow-light);
        }

        .stat-card h3 {
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
            opacity: 0.9;
        }

        .stat-value {
            font-size: 2rem;
            font-weight: bold;
        }

        .stat-value-syp {
            font-size: 1.2rem;
            font-weight: bold;
            color: #10b981;
            margin-top: 0.5rem;
        }

        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
        }

        .alert-item {
            padding: 0.5rem;
            margin-bottom: 0.5rem;
            background: var(--warning-color);
            color: white;
            border-radius: 5px;
            font-size: 0.9rem;
        }

        .recent-sale-item {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid #e5e7eb;
        }

        .debtor-item {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid #e5e7eb;
        }

        .price-syp {
            color: #10b981;
        }
    `;
    document.head.appendChild(style);
}

function getLowStockAlerts() {
    const lowStockProducts = db.getLowStockProducts();
    if (lowStockProducts.length === 0) {
        return '<p>لا توجد منتجات منخفضة المخزون</p>';
    }

    return lowStockProducts.map(product => `
        <div class="alert-item">
            ${product.name} - الكمية المتبقية: ${product.quantity}
        </div>
    `).join('');
}

function getRecentSales() {
    const sales = db.getAll('sales').slice(-5).reverse();
    if (sales.length === 0) {
        return '<p>لا توجد مبيعات حديثة</p>';
    }

    return sales.map(sale => `
        <div class="recent-sale-item">
            <span>${sale.customerName || 'عميل نقدي'}</span>
            <span>
                ${formatCurrency(sale.total)} دولار / <span class="price-syp">${formatCurrencySYP(sale.totalSYP || (sale.total * (sale.exchangeRate || 1)))} ل.س</span>
            </span>
            <span>${formatDate(sale.date)}</span>
        </div>
    `).join('');
}

function getDebtorCustomers() {
    const customers = db.getAll('customers');
    const debtors = customers.filter(customer => {
        const balanceSYP = db.getCustomerBalanceSYP ? db.getCustomerBalanceSYP(customer.id) : getPriceInSYP(db.getCustomerBalance(customer.id));
        return (balanceSYP || 0) > 0.5;
    });

    if (debtors.length === 0) {
        return '<p>لا يوجد عملاء مدينون</p>';
    }

    return debtors.slice(0, 5).map(customer => {
        const balanceSYP = db.getCustomerBalanceSYP ? db.getCustomerBalanceSYP(customer.id) : getPriceInSYP(db.getCustomerBalance(customer.id));
        return `
            <div class="debtor-item">
                <span>${customer.name}</span>
                <span>${formatCurrencySYP(balanceSYP)}</span>
            </div>
        `;
    }).join('');
}
