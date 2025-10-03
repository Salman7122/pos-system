

function uploadBackupToFirebase() {
    const backup = {
        products: JSON.parse(localStorage.getItem('products') || '[]'),
        customers: JSON.parse(localStorage.getItem('customers') || '[]'),
        suppliers: JSON.parse(localStorage.getItem('suppliers') || '[]'),
        sales: JSON.parse(localStorage.getItem('sales') || '[]'),
        purchases: JSON.parse(localStorage.getItem('purchases') || '[]'),
        settings: JSON.parse(localStorage.getItem('settings') || '{}'),
        exchangeRate: localStorage.getItem('exchangeRate') || ''
    };
    // يمكنك تغيير مسار النسخة الاحتياطية حسب رغبتك
    firebaseDB.ref('backup').set(backup, function(error) {
        if (error) {
            showMessage('حدث خطأ أثناء رفع النسخة الاحتياطية إلى Firebase', 'error');
        } else {
            showMessage('تم رفع النسخة الاحتياطية إلى Firebase بنجاح', 'success');
        }
    });
}
function loadSettings() {
    const content = document.getElementById('page-content');
    const settings = JSON.parse(localStorage.getItem('settings')) || { password: '123' };
    content.innerHTML = `
        <div class="settings-page">
            <div class="page-header">
                <h1>الإعدادات</h1>
            </div>
            <div class="settings-grid">
                <div class="settings-card">
                    <h3>بيانات الشركة</h3>
                    <form id="company-form">
                        <div class="form-group">
                            <label for="company-name">اسم الشركة</label>
                            <input type="text" id="company-name" value="${settings.companyName}">
                        </div>
                        <div class="form-group">
                            <label for="company-address">العنوان</label>
                            <input type="text" id="company-address" value="${settings.companyAddress || ''}">
                        </div>
                        <div class="form-group">
                            <label for="company-phone">رقم الهاتف</label>
                            <input type="tel" id="company-phone" value="${settings.companyPhone || ''}">
                        </div>
                        <div class="form-group">
                            <label for="company-email">البريد الإلكتروني</label>
                            <input type="email" id="company-email" value="${settings.companyEmail || ''}">
                        </div>
                        <button type="submit" class="btn btn-success">حفظ</button>
                    </form>
                </div>
                <div class="settings-card">
                    <h3>إعدادات النظام</h3>
                    <form id="system-form">
                        <div class="form-group">
                            <label for="tax-rate">معدل الضريبة (%)</label>
                            <input type="number" id="tax-rate" step="0.01" value="${settings.taxRate || 0}" min="0" max="100">
                        </div>
                        <div class="form-group">
                            <label for="current-password">كلمة المرور الحالية</label>
                            <input type="password" id="current-password">
                        </div>
                        <div class="form-group">
                            <label for="new-password">كلمة المرور الجديدة</label>
                            <input type="password" id="new-password">
                        </div>
                        <div class="form-group">
                            <label for="confirm-password">تأكيد كلمة المرور الجديدة</label>
                            <input type="password" id="confirm-password">
                        </div>
                        <button type="submit" class="btn btn-success">حفظ</button>
                    </form>
                </div>
                <div class="settings-card">
                    <h3>النسخ الاحتياطي</h3>
                    <div class="backup-actions">
                        <div class="backup-row">
                            <button class="btn btn-success" id="export-data-btn">تصدير البيانات</button>
                            <input type="file" id="import-file" accept=".json" style="display: none;" />
                            <button class="btn btn-warning" id="import-data-btn">استيراد البيانات</button>
                            <button class="btn btn-danger" id="clear-all-btn">حذف جميع البيانات</button>
                        </div>
                        <div class="backup-row">
                            <button class="btn btn-primary" id="firebase-backup-btn"> نسخة Firebase</button>
                            <button class="btn btn-danger" id="delete-products-btn">حذف جميع المنتجات</button>
                            <button class="btn btn-danger" id="delete-customers-btn">حذف جميع العملاء</button>
                        </div>

                        <div class="backup-row">
                            <button class="btn btn-danger" id="delete-debts-btn">حذف جميع الديون</button>
                            <button class="btn btn-danger" id="delete-suppliers-btn">حذف جميع الموردين</button>
                            <button class="btn btn-danger" id="delete-purchases-btn">حذف جميع المشتريات</button>
                        </div>

                        <div class="backup-row">
                            <button class="btn btn-primary" id="firebase-restore-btn">استرجاع Firestore</button>
                        </div>
                    </div>
                    <p class="backup-note">تحذير: استيراد البيانات سيستبدل جميع البيانات الحالية</p>
                    <p class="backup-note danger">تحذير: حذف البيانات لا يمكن التراجع عنه!</p>
                </div>
                <div class="settings-card">
                    <h3>المظهر</h3>
                    <div class="theme-toggle">
                        <label for="theme-switch">الوضع المظلم</label>
                        <input type="checkbox" id="theme-switch" ${document.body.classList.contains('dark') ? 'checked' : ''}>
                    </div>
                </div>
            </div>
        </div>
    `;

    // تفعيل مستمعات الأحداث للأزرار
    document.getElementById('company-form').addEventListener('submit', saveCompanySettings);
    document.getElementById('system-form').addEventListener('submit', saveSystemSettings);
    document.getElementById('import-file').addEventListener('change', importData);
    document.getElementById('theme-switch').addEventListener('change', toggleTheme);
    document.getElementById('export-data-btn').addEventListener('click', exportData);
    document.getElementById('import-data-btn').addEventListener('click', function() {
        document.getElementById('import-file').click();
    });
    document.getElementById('clear-all-btn').addEventListener('click', clearAllData);
    document.getElementById('firebase-backup-btn').addEventListener('click', backupToFirebase);
    document.getElementById('firebase-restore-btn').addEventListener('click', restoreFromFirestore);
    document.getElementById('delete-products-btn').addEventListener('click', deleteProducts);
    document.getElementById('delete-customers-btn').addEventListener('click', deleteCustomers);
    document.getElementById('delete-debts-btn').addEventListener('click', deleteDebts);
    document.getElementById('delete-suppliers-btn').addEventListener('click', deleteSuppliers);
    document.getElementById('delete-purchases-btn').addEventListener('click', deletePurchases);
}
// main.js - المنطق الأساسي والإعدادات
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة التطبيق
    initApp();
});

function initApp() {
    // التحقق من تسجيل الدخول
    checkLoginStatus();

    // إعداد التنقل
    setupNavigation();

    // تحميل البيانات الأولية
    loadInitialData();
}

function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const loginScreen = document.getElementById('login-screen');
    const mainApp = document.getElementById('main-app');

    if (isLoggedIn === 'true') {
        loginScreen.classList.remove('active');
        mainApp.classList.add('active');
        // استرجاع الصفحة المحفوظة أو الافتراضية
        const currentPage = localStorage.getItem('currentPage') || 'dashboard';
        // التحقق من صحة الصفحة المحفوظة
        const validPages = ['dashboard', 'products', 'sales', 'customers', 'suppliers', 'purchases', 'debts', 'reports', 'settings', 'exchange-rate'];
        const pageToLoad = validPages.includes(currentPage) ? currentPage : 'dashboard';
        loadPage(pageToLoad);

        // تحديث الـ active class في الشريط الجانبي
        updateSidebarActiveState(pageToLoad);
    } else {
        loginScreen.classList.add('active');
        mainApp.classList.remove('active');
    }
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            loadPage(page);

            // تحديث الرابط النشط
            navLinks.forEach(l => l.classList.remove('active'));
            // تعيين التحديد للزر الحالي
            document.querySelectorAll('.nav-menu a').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    // عند تغيير الصفحة عبر loadPage، أعد تعيين التحديد حسب الصفحة الحالية
    document.addEventListener('pageChanged', function() {
        const currentPage = document.querySelector('.nav-menu a[data-page].active');
        const pageContent = document.getElementById('page-content');
        // إذا كانت الصفحة إعدادات، فعين التحديد لزر الإعدادات فقط
        if (pageContent && pageContent.querySelector('.settings-page')) {
            navLinks.forEach(l => l.classList.remove('active'));
            const settingsLink = document.querySelector('.nav-menu a[data-page="settings"]');
            if (settingsLink) settingsLink.classList.add('active');
        }
    });
}

// دالة لتحديث حالة الـ active في الشريط الجانبي
function updateSidebarActiveState(page) {
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === page) {
            link.classList.add('active');
        }
    });
}

// تعريف دوال الحذف في النطاق العام
    window.deleteProducts = function() {
        if (confirm('هل أنت متأكد من حذف جميع المنتجات؟ لا يمكن التراجع!')) {
            localStorage.removeItem('products');
            showMessage('تم حذف جميع المنتجات بنجاح', 'success');
        }
    };
    window.deleteCustomers = function() {
        if (confirm('هل أنت متأكد من حذف جميع العملاء؟ لا يمكن التراجع!')) {
            localStorage.removeItem('customers');
            showMessage('تم حذف جميع العملاء بنجاح', 'success');
        }
    };
    window.deleteDebts = function() {
        if (confirm('هل أنت متأكد من حذف جميع الديون؟ لا يمكن التراجع!')) {
            localStorage.removeItem('debts');
            showMessage('تم حذف جميع الديون بنجاح', 'success');
        }
    };
    window.deleteSuppliers = function() {
        if (confirm('هل أنت متأكد من حذف جميع الموردين؟ لا يمكن التراجع!')) {
            localStorage.removeItem('suppliers');
            showMessage('تم حذف جميع الموردين بنجاح', 'success');
        }
    };
    window.deletePurchases = function() {
        if (confirm('هل أنت متأكد من حذف جميع المشتريات؟ لا يمكن التراجع!')) {
            localStorage.removeItem('purchases');
            showMessage('تم حذف جميع المشتريات بنجاح', 'success');
        }
    };

function loadPage(page) {
    const pageContent = document.getElementById('page-content');

    // حفظ الصفحة الحالية في localStorage
    localStorage.setItem('currentPage', page);

    // تحميل محتوى الصفحة حسب النوع
    switch(page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'products':
            loadProducts();
            break;
        case 'sales':
            loadSales();
            break;
        case 'customers':
            loadCustomers();
            break;
        case 'suppliers':
            loadSuppliers();
            break;
        case 'purchases':
            loadPurchases();
            break;
        case 'debts':
            loadDebts();
            break;
        case 'reports':
            loadReports();
            break;
        case 'settings':
            loadSettings();
            break;
        case 'exchange-rate':
            loadExchangeRate();
            break;
        default:
            pageContent.innerHTML = '<h1>صفحة غير موجودة</h1>';
    }

    // التحقق من الإشعارات
    checkNotifications();

    // إطلاق حدث تغيير الصفحة
    document.dispatchEvent(new CustomEvent('pageChanged'));
}

function loadInitialData() {
    // تحميل البيانات من localStorage
    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', JSON.stringify([]));
    }
    if (!localStorage.getItem('customers')) {
        localStorage.setItem('customers', JSON.stringify([]));
    }
    if (!localStorage.getItem('suppliers')) {
        localStorage.setItem('suppliers', JSON.stringify([]));
    }
    if (!localStorage.getItem('sales')) {
        localStorage.setItem('sales', JSON.stringify([]));
    }
    if (!localStorage.getItem('purchases')) {
        localStorage.setItem('purchases', JSON.stringify([]));
    }
    if (!localStorage.getItem('settings')) {
        localStorage.setItem('settings', JSON.stringify({
            companyName: 'شركة سلمان',
            taxRate: 0,
            password: '123'
        }));
    }

    // تعيين سعر الدولار الافتراضي إذا لم يكن موجوداً
    if (!localStorage.getItem('exchangeRate')) {
        localStorage.setItem('exchangeRate', '15000'); // سعر افتراضي للدولار بالليرة السورية
    }

    // تحديث أسعار المنتجات بالليرة السورية عند بدء التطبيق (فقط للمنتجات التي ليس لها سعر ليرة ثابت)
    updateProductPricesInSYP();
}

// جعل دالة حذف البيانات متاحة عالمياً (سيتم تعريفها لاحقاً)

// دوال مساعدة
function showMessage(message, type = 'info') {
    // عرض رسائل للمستخدم
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message ' + type;
    msgDiv.textContent = message;
    document.body.appendChild(msgDiv);
    setTimeout(() => msgDiv.remove(), 3000);
}
function saveCompanySettings(e) {
    e.preventDefault();
    const settings = JSON.parse(localStorage.getItem('settings')) || {};

    settings.companyName = document.getElementById('company-name').value;
    settings.companyAddress = document.getElementById('company-address').value;
    settings.companyPhone = document.getElementById('company-phone').value;
    settings.companyEmail = document.getElementById('company-email').value;

    localStorage.setItem('settings', JSON.stringify(settings));
    showMessage('تم حفظ إعدادات الشركة بنجاح', 'success');
}

function saveSystemSettings(e) {
    e.preventDefault();
    const settings = JSON.parse(localStorage.getItem('settings')) || {};

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword) {
        if (currentPassword !== settings.password) {
            showMessage('كلمة المرور الحالية غير صحيحة', 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            showMessage('كلمة المرور الجديدة غير متطابقة', 'error');
            return;
        }
        settings.password = newPassword;
    }

    settings.taxRate = parseFloat(document.getElementById('tax-rate').value) || 0;

    localStorage.setItem('settings', JSON.stringify(settings));
    showMessage('تم حفظ الإعدادات بنجاح', 'success');

    // إعادة تعيين حقول كلمة المرور
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
}

function toggleTheme() {
    const isDark = document.getElementById('theme-switch').checked;
    document.body.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function clearAllData() {
    if (confirm('هل أنت متأكد من حذف جميع البيانات؟\n\nسيتم حذف:\n- جميع المنتجات\n- جميع العملاء\n- جميع الموردين\n- جميع المبيعات\n- جميع المشتريات\n- جميع الإعدادات\n\nلا يمكن التراجع عن هذا الإجراء!')) {
        if (confirm('هل أنت متأكد تماماً؟ اكتب "نعم" للتأكيد:')) {
            // مسح جميع البيانات من localStorage
            localStorage.clear();

            // إعادة تحميل الصفحة
            showMessage('تم حذف جميع البيانات بنجاح. سيتم إعادة تحميل الصفحة...', 'success');
            setTimeout(() => {
                location.reload();
            }, 2000);
        }
    }
}

// جعل دالة حذف البيانات متاحة عالمياً
window.clearAllData = clearAllData;

// تحميل السمة عند بدء التطبيق
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    // سيتم تحديث المفتاح لاحقاً
}

// نظام الإشعارات
function checkNotifications() {
    const lowStockProducts = db.getLowStockProducts();
    const customers = db.getAll('customers');
    const debtorCustomers = customers.filter(c => (db.getCustomerBalanceSYP ? db.getCustomerBalanceSYP(c.id) : getPriceInSYP(db.getCustomerBalance(c.id))) > 0);

    let notifications = [];

    if (lowStockProducts.length > 0) {
        notifications.push({
            type: 'warning',
            message: `يوجد ${lowStockProducts.length} منتج منخفض المخزون`,
            action: () => loadPage('products')
        });
    }

    if (debtorCustomers.length > 0) {
        notifications.push({
            type: 'info',
            message: `يوجد ${debtorCustomers.length} عميل مدين`,
            action: () => loadPage('debts')
        });
    }

    displayNotifications(notifications);
}

function displayNotifications(notifications) {
    const notificationContainer = document.getElementById('notification-container') || createNotificationContainer();

    notificationContainer.innerHTML = '';
    notifications.forEach(notification => {
        const notificationEl = document.createElement('div');
        notificationEl.className = `notification ${notification.type}`;
        notificationEl.innerHTML = `
            <span>${notification.message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        if (notification.action) {
            notificationEl.addEventListener('click', notification.action);
            notificationEl.style.cursor = 'pointer';
        }
        notificationContainer.appendChild(notificationEl);
    });
}

function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 1000;
        max-width: 300px;
    `;
    document.body.appendChild(container);
    return container;
}

// التحقق من الإشعارات عند تحميل الصفحات
function onPageLoad() {
    checkNotifications();
}

// إضافة مستمع لتغيير الصفحة
document.addEventListener('pageChanged', onPageLoad);

function loadDebts() {
    const content = document.getElementById('page-content');
    const customers = db.getAll('customers');
    const suppliers = db.getAll('suppliers');

    const debtorCustomers = customers.filter(c => {
        const syp = (db.getCustomerBalanceSYP ? db.getCustomerBalanceSYP(c.id) : getPriceInSYP(db.getCustomerBalance(c.id)));
        return (syp || 0) > 0.5; // اعتبر الأرقام الصغيرة جداً صفراً
    });
    const debtorSuppliers = suppliers.filter(s => calculateSupplierBalance(s.id) > 0);

    content.innerHTML = `
        <div class="debts-page">
            <div class="page-header">
                <h1>إدارة الديون والمدفوعات</h1>
            </div>

            <div class="debts-grid">
                <div class="debts-card">
                    <h3>العملاء المدينون</h3>
                    <div class="debts-list">
                        ${debtorCustomers.map(customer => {
                            const balanceSYP = (db.getCustomerBalanceSYP ? db.getCustomerBalanceSYP(customer.id) : getPriceInSYP(db.getCustomerBalance(customer.id)));
                            const ex = parseFloat(localStorage.getItem('exchangeRate')) || 1;
                            const balanceUSD = (typeof convertSYPToUSD === 'function') ? convertSYPToUSD(balanceSYP) : (balanceSYP / ex);
                            return `
                                <div class="debt-item">
                                    <div class="debt-info">
                                        <h4>${customer.name}</h4>
                                        <p>الهاتف: ${customer.phone || 'غير محدد'}</p>
                                        <p class="debt-amount-syp">${formatCurrencySYP(balanceSYP)} <small>(${formatCurrency(balanceUSD)})</small></p>
                                    </div>
                                    <div class="debt-actions">
                                        <input type="number" id="debt-payment-${customer.id}" step="0.01" min="0" placeholder="الدفعة (ل.س)">
                                        <button class="btn btn-success" onclick="recordCustomerPayment('${customer.id}')">تسجيل دفعة</button>
                                        <button class="btn btn-warning" onclick="printCustomerStatement('${customer.id}')">كشف الحساب</button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                        ${debtorCustomers.length === 0 ? '<p>لا يوجد عملاء مدينون</p>' : ''}
                    </div>
                </div>

                <div class="debts-card">
                    <h3>الموردون المدينون</h3>
                    <div class="debts-list">
                        ${debtorSuppliers.map(supplier => `
                            <div class="debt-item">
                                <div class="debt-info">
                                    <h4>${supplier.name}</h4>
                                    <p>الهاتف: ${supplier.phone || 'غير محدد'}</p>
                                    <p class="debt-amount">المبلغ: ${formatCurrency(calculateSupplierBalance(supplier.id))}</p>
                                </div>
                                <div class="debt-actions">
                                    <button class="btn btn-success" onclick="recordSupplierPaymentFromDebts('${supplier.id}')">تسجيل دفعة</button>
                                </div>
                            </div>
                        `).join('')}
                        ${debtorSuppliers.length === 0 ? '<p>لا يوجد موردون مدينون</p>' : ''}
                    </div>
                </div>

                <div class="debts-card">
                    <h3>إحصائيات الديون</h3>
                    <div class="debt-stats">
                        <div class="stat-item">
                            <span>إجمالي ديون العملاء:</span>
                            <span>${formatCurrency((typeof convertSYPToUSD === 'function')
                                ? convertSYPToUSD(debtorCustomers.reduce((sum, c) => sum + (db.getCustomerBalanceSYP ? db.getCustomerBalanceSYP(c.id) : getPriceInSYP(db.getCustomerBalance(c.id))), 0))
                                : (debtorCustomers.reduce((sum, c) => sum + (db.getCustomerBalanceSYP ? db.getCustomerBalanceSYP(c.id) : getPriceInSYP(db.getCustomerBalance(c.id))), 0) / (parseFloat(localStorage.getItem('exchangeRate')) || 1)))}</span>
                            <span class="stat-value-syp">${formatCurrencySYP(debtorCustomers.reduce((sum, c) => sum + (db.getCustomerBalanceSYP ? db.getCustomerBalanceSYP(c.id) : getPriceInSYP(db.getCustomerBalance(c.id))), 0))}</span>
                        </div>
                        <div class="stat-item">
                            <span>إجمالي ديون الموردين:</span>
                            <span>${formatCurrency(debtorSuppliers.reduce((sum, s) => sum + calculateSupplierBalance(s.id), 0))}</span>
                            <span class="stat-value-syp">${formatCurrencySYP(getPriceInSYP(debtorSuppliers.reduce((sum, s) => sum + calculateSupplierBalance(s.id), 0)))}</span>
                        </div>
                        <div class="stat-item">
                            <span>عدد العملاء المدينين:</span>
                            <span>${debtorCustomers.length}</span>
                        </div>
                        <div class="stat-item">
                            <span>عدد الموردين المدينين:</span>
                            <span>${debtorSuppliers.length}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function recordCustomerPayment(customerId) {
    const input = document.getElementById(`debt-payment-${customerId}`);
    const valueSYP = input ? parseFloat(input.value) : NaN;

    if (isNaN(valueSYP) || valueSYP <= 0) {
        showMessage('يرجى إدخال الدفعة الجزئية بالليرة السورية بشكل صحيح', 'error');
        return;
    }

    const customer = db.getById('customers', customerId);
    const paymentData = {
        customerId: customerId,
        customerName: customer ? customer.name : '',
        items: [{ name: 'دفعة على الحساب', price: 0, quantity: 1 }],
        subtotal: 0,
        tax: 0,
        total: 0,               // الحسابات لا تستخدم الدولار
        totalSYP: -valueSYP,    // سالب لأن هذه دفعة تُنقص الدين بالليرة
        paymentMethod: 'cash',
        paidSYP: valueSYP,
        change: 0,
        date: new Date().toISOString(),
        isPayment: true
    };

    db.save('sales', paymentData);

    if (input) input.value = '';
    loadDebts();
    showMessage('تم تسجيل الدفعة بالليرة السورية بنجاح', 'success');
}

function recordSupplierPaymentFromDebts(supplierId) {
    const amount = prompt('أدخل مبلغ الدفعة:');
    if (amount && !isNaN(amount)) {
        // العثور على فاتورة شراء غير مدفوعة بالكامل
        const purchases = db.getAll('purchases').filter(p => p.supplierId === supplierId && p.total > (p.paid || 0));
        if (purchases.length > 0) {
            const purchase = purchases[0]; // أول فاتورة غير مدفوعة
            purchase.paid = (purchase.paid || 0) + parseFloat(amount);
            db.save('purchases', purchase);
            loadDebts();
            showMessage('تم تسجيل الدفعة بنجاح', 'success');
        } else {
            showMessage('لا توجد فواتير غير مدفوعة لهذا المورد', 'error');
        }
    }
}

function calculateSupplierBalance(supplierId) {
    const purchases = db.getAll('purchases').filter(purchase => purchase.supplierId === supplierId);
    const totalPurchases = purchases.reduce((total, purchase) => total + purchase.total, 0);
    const totalPaid = purchases.reduce((total, purchase) => total + (purchase.paid || 0), 0);
    return totalPurchases - totalPaid;
}

function loadExchangeRate() {
    const content = document.getElementById('page-content');
    const currentRate = parseFloat(localStorage.getItem('exchangeRate')) || 1;

    content.innerHTML = `
        <div class="exchange-rate-page">
            <div class="page-header">
                <h1>سعر الدولار بالليرة السورية</h1>
            </div>

            <div class="exchange-rate-container">
                <div class="exchange-rate-card">
                    <h3>تحديث سعر الدولار</h3>
                    <form id="exchange-rate-form">
                        <div class="form-group">
                            <label for="exchange-rate">سعر الدولار بالليرة السورية</label>
                            <input type="number" id="exchange-rate" step="0.01" value="${currentRate}" required>
                            <small class="form-help">مثال: إذا كان 1 دولار = 15000 ليرة سورية، أدخل 15000</small>
                        </div>
                        <div class="current-rate-display">
                            <p><strong>السعر الحالي:</strong> 1 دولار = ${currentRate.toLocaleString('ar-SY')} ليرة سورية</p>
                        </div>
                        <button type="submit" class="btn btn-success">تحديث السعر</button>
                    </form>
                </div>

                <div class="exchange-rate-info">
                    <h3>معلومات مهمة</h3>
                    <div class="info-list">
                        <div class="info-item">
                            <i class="info-icon">💰</i>
                            <div class="info-content">
                                <h4>تأثير تغيير السعر</h4>
                                <p>عند تحديث سعر الدولار، سيتم تحديث جميع أسعار المنتجات بالليرة السورية تلقائياً في جميع أنحاء النظام.</p>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="info-icon">📊</i>
                            <div class="info-content">
                                <h4>التقارير والإحصائيات</h4>
                                <p>جميع التقارير ستعرض الأسعار بالليرة السورية بناءً على السعر المحدث.</p>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="info-icon">🔄</i>
                            <div class="info-content">
                                <h4>التحديث التلقائي</h4>
                                <p>لا تحتاج لإعادة إدخال أسعار المنتجات - سيتم تحويلها تلقائياً.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    setupExchangeRateEventListeners();
}

function setupExchangeRateEventListeners() {
    document.getElementById('exchange-rate-form').addEventListener('submit', updateExchangeRate);
}

function updateExchangeRate(e) {
    e.preventDefault();

    const newRate = parseFloat(document.getElementById('exchange-rate').value);
    if (newRate <= 0) {
        showMessage('يجب أن يكون سعر الدولار أكبر من صفر', 'error');
        return;
    }

    localStorage.setItem('exchangeRate', newRate.toString());
    showMessage(`تم تحديث سعر الدولار إلى ${newRate.toLocaleString('ar-SY')} ليرة سورية`, 'success');

    // تحديث عرض السعر الحالي
    document.querySelector('.current-rate-display p').textContent =
        `السعر الحالي: 1 دولار = ${newRate.toLocaleString('ar-SY')} ليرة سورية`;

    // تحديث أسعار المنتجات بالليرة السورية
    updateProductPricesInSYP();
}

function updateProductPricesInSYP() {
    const products = db.getAll('products');
    const exchangeRate = parseFloat(localStorage.getItem('exchangeRate')) || 1;

    console.log('Updating product prices in SYP. Current exchange rate:', exchangeRate);

    products.forEach(product => {
        console.log('Processing product:', product.name, 'priceSYPLocked:', product.priceSYPLocked, 'current USD:', product.price, 'current SYP:', product.priceSYP);

        if (!product.priceSYPLocked) {
            // حفظ السعر الأصلي بالدولار إذا لم يكن محفوظاً
            if (product.originalPriceUSD === undefined || product.originalPriceUSD === null) {
                product.originalPriceUSD = product.price;
                console.log('  Setting originalPriceUSD for', product.name, 'to', product.originalPriceUSD);
            }
            product.priceSYP = product.originalPriceUSD * exchangeRate;
            console.log('  Updated SYP for', product.name, 'to', product.priceSYP);
        } else {
            // إذا كان سعر الليرة السورية ثابتًا، قم بتحديث سعر الدولار بناءً عليه
            product.originalPriceUSD = product.priceSYP / exchangeRate;
            product.price = product.originalPriceUSD;
            console.log('  SYP locked for', product.name, '. Updated USD to', product.price);
        }
        db.save('products', product);
    });
}

// دالة للحصول على السعر بالليرة السورية
function getPriceInSYP(usdPrice) {
    const exchangeRate = parseFloat(localStorage.getItem('exchangeRate')) || 1;
    return usdPrice * exchangeRate;
}

// دالة لتحويل من الليرة السورية إلى الدولار
function convertSYPToUSD(sypAmount) {
    const exchangeRate = parseFloat(localStorage.getItem('exchangeRate')) || 1;
    return sypAmount / exchangeRate;
}

// دالة للحصول على معدل الضريبة من الإعدادات
function getTaxRate() {
    const settings = JSON.parse(localStorage.getItem('settings')) || { taxRate: 0 };
    return settings.taxRate / 100; // تحويل من نسبة مئوية إلى كسر عشري
}
