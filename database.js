// database.js - إدارة قاعدة البيانات المحلية
class Database {
    constructor() {
        this.init();
    }

    init() {
        // تهيئة الجداول الأساسية
        this.tables = {
            products: 'products',
            customers: 'customers',
            suppliers: 'suppliers',
            sales: 'sales',
            purchases: 'purchases',
            settings: 'settings'
        };
    }

    // دوال عامة للجداول
    getAll(table) {
        const data = localStorage.getItem(this.tables[table]);
        return data ? JSON.parse(data) : [];
    }

    getById(table, id) {
        const items = this.getAll(table);
        return items.find(item => item.id === id);
    }

    save(table, item) {
        const items = this.getAll(table);
        const existingIndex = items.findIndex(i => i.id === item.id);

        if (existingIndex >= 0) {
            items[existingIndex] = { ...items[existingIndex], ...item };
        } else {
            item.id = generateId();
            item.createdAt = new Date().toISOString();
            items.push(item);
        }

        localStorage.setItem(this.tables[table], JSON.stringify(items));
        return item;
    }

    delete(table, id) {
        const items = this.getAll(table);
        const filtered = items.filter(item => item.id !== id);
        localStorage.setItem(this.tables[table], JSON.stringify(filtered));
        return true;
    }

    // دوال خاصة بالمنتجات
    getLowStockProducts() {
        const products = this.getAll('products');
        return products.filter(product => product.quantity <= 0.25 * (product.originalQuantity || product.quantity));
    }

    updateProductQuantity(productId, quantityChange) {
        const product = this.getById('products', productId);
        if (product) {
            product.quantity += quantityChange;
            // فحص نقص المخزون
            if (product.quantity <= 0.25 * (product.originalQuantity || product.quantity)) {
                product.isLowStock = true;
            }
            this.save('products', product);
        }
    }

    // دوال خاصة بالعملاء
    getCustomerBalance(customerId) {
        const sales = this.getAll('sales').filter(sale => sale.customerId === customerId);
        let balance = 0;
        sales.forEach(sale => {
            if (sale.isPayment) {
                // دفعة (خصم من الدين)
                balance -= sale.total; // sale.total سالب لدفعة (للتوافق القديم بالدولار)
            } else {
                // بيع عادي
                balance += sale.total;
                if (sale.paymentMethod === 'cash') {
                    balance -= (sale.paid || 0);
                }
            }
        });
        return balance;
    }

    // دوال خاصة بالفواتير المعدلة
    getAllModifiedSales() {
        const data = localStorage.getItem('modifiedSales');
        return data ? JSON.parse(data) : [];
    }

    saveModifiedSale(item) {
        const items = this.getAllModifiedSales();
        const existingIndex = items.findIndex(i => i.id === item.id);

        if (existingIndex >= 0) {
            items[existingIndex] = { ...items[existingIndex], ...item };
        } else {
            item.id = generateId();
            item.createdAt = new Date().toISOString();
            item.editedAt = new Date().toISOString();
            items.push(item);
        }

        localStorage.setItem('modifiedSales', JSON.stringify(items));
        return item;
    }

    getModifiedSalesByOriginalId(originalId) {
        const modifiedSales = this.getAllModifiedSales();
        return modifiedSales.filter(ms => ms.originalSaleId === originalId);
    }

    // الرصيد بالليرة السورية (المعتمد لواجهة الديون)
    getCustomerBalanceSYP(customerId) {
        const sales = this.getAll('sales').filter(sale => sale.customerId === customerId);
        let balanceSYP = 0;
        sales.forEach(sale => {
            if (sale.isPayment) {
                // دفعة: نخصم قيمة الدفعة بالليرة مباشرة
                const paidSYP = parseFloat(sale.paidSYP || 0);
                const paymentAmountSYP = !isNaN(paidSYP) && paidSYP > 0
                    ? paidSYP
                    : Math.abs(parseFloat(sale.totalSYP || sale.total || 0)); // دعم السجلات القديمة
                balanceSYP -= paymentAmountSYP;
            } else {
                // بيع: نضيف قيمة الفاتورة الآجلة بالليرة
                if (sale.paymentMethod === 'credit') {
                    const saleTotalSYP = parseFloat(sale.totalSYP || 0) || (typeof getPriceInSYP === 'function' ? getPriceInSYP(sale.total) : 0);
                    balanceSYP += saleTotalSYP;
                    // خصم أي مبلغ مدفوع بالليرة مسجل ضمن الفاتورة (لو موجود)
                    if (sale.paidSYP) balanceSYP -= parseFloat(sale.paidSYP);
                }
            }
        });
        return balanceSYP;
    }
    
    // دوال خاصة بالمبيعات
    getSalesByDateRange(startDate, endDate) {
        const sales = this.getAll('sales');
        return sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
        });
    }

    getTotalSales() {
        const sales = this.getAll('sales');
        return sales.reduce((total, sale) => total + sale.total, 0);
    }

    // دوال خاصة بالمشتريات
    getPurchasesByDateRange(startDate, endDate) {
        const purchases = this.getAll('purchases');
        return purchases.filter(purchase => {
            const purchaseDate = new Date(purchase.date);
            return purchaseDate >= new Date(startDate) && purchaseDate <= new Date(endDate);
        });
    }

    // دوال التقارير
    getSalesReport(period = 'month') {
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

        const sales = this.getSalesByDateRange(startDate, now);
        const total = sales.reduce((sum, sale) => sum + sale.total, 0);
        const count = sales.length;

        return { total, count, sales };
    }

    getPurchasesReport(period = 'month') {
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

        const purchases = this.getPurchasesByDateRange(startDate, now);
        const total = purchases.reduce((sum, purchase) => sum + purchase.total, 0);
        const count = purchases.length;

        return { total, count, purchases };
    }

    getInventoryReport() {
        const products = this.getAll('products');
        const totalValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
        const lowStock = this.getLowStockProducts().length;
        const outOfStock = products.filter(p => p.quantity === 0).length;

        return { totalValue, lowStock, outOfStock, products };
    }

    // دوال النسخ الاحتياطي
    backup() {
        const data = {};
        Object.keys(this.tables).forEach(table => {
            data[table] = this.getAll(table);
        });
        return data;
    }

    restore(data) {
        Object.keys(data).forEach(table => {
            if (this.tables[table]) {
                localStorage.setItem(this.tables[table], JSON.stringify(data[table]));
            }
        });
    }
}

// إنشاء مثيل عام
const db = new Database();