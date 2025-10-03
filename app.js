// app.js - وظائف التطبيق الرئيسية

document.addEventListener('DOMContentLoaded', function () {
    // معالج تسجيل الدخول
    document.getElementById('login-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const password = document.getElementById('password').value;
        const settings = JSON.parse(localStorage.getItem('settings')) || { password: '123' };

        if (password === settings.password) {
            localStorage.setItem('isLoggedIn', 'true');
            document.getElementById('login-screen').classList.remove('active');
            document.getElementById('main-app').classList.add('active');
            loadPage('dashboard');
            showMessage('تم تسجيل الدخول بنجاح', 'success');
        } else {
            document.getElementById('login-error').textContent = 'كلمة المرور غير صحيحة';
            showMessage('كلمة المرور غير صحيحة', 'error');
        }
    });
});

// دالة تسجيل الخروج
function logout() {
    localStorage.setItem('isLoggedIn', 'false');
    document.getElementById('main-app').classList.remove('active');
    document.getElementById('login-screen').classList.add('active');
    showMessage('تم تسجيل الخروج', 'info');
}

// دوال عامة للتطبيق
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function loadData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// دالة طباعة
function printElement(elementId) {
    const printContent = document.getElementById(elementId).innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    location.reload(); // إعادة تحميل لإعادة بناء الصفحة
}

// دالة تصدير البيانات
function exportData() {
    const data = {
        products: loadData('products'),
        customers: loadData('customers'),
        suppliers: loadData('suppliers'),
        sales: loadData('sales'),
        purchases: loadData('purchases'),
        settings: JSON.parse(localStorage.getItem('settings'))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup.json';
    a.click();
    URL.revokeObjectURL(url);
    showMessage('تم تصدير البيانات بنجاح', 'success');
}

// دالة استيراد البيانات
function importData(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = JSON.parse(e.target.result);
                if (confirm('هل أنت متأكد من استيراد البيانات؟ سيتم استبدال البيانات الحالية.')) {
                    saveData('products', data.products || []);
                    saveData('customers', data.customers || []);
                    saveData('suppliers', data.suppliers || []);
                    saveData('sales', data.sales || []);
                    saveData('purchases', data.purchases || []);
                    if (data.settings) {
                        localStorage.setItem('settings', JSON.stringify(data.settings));
                    }
                    showMessage('تم استيراد البيانات بنجاح', 'success');
                    location.reload();
                }
            } catch (error) {
                showMessage('خطأ في ملف البيانات', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// دالة البحث العامة
function searchItems(items, query, fields) {
    if (!query) return items;
    return items.filter(item => {
        return fields.some(field => {
            const value = item[field];
            return value && value.toString().toLowerCase().includes(query.toLowerCase());
        });
    });
}

// دالة الترتيب
function sortItems(items, field, direction = 'asc') {
    return items.sort((a, b) => {
        if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
        if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
        return 0;
    });
}

// الرفع الى Firebase
async function backupToFirebase() {
    const data = {
        products: loadData('products'),
        customers: loadData('customers'),
        suppliers: loadData('suppliers'),
        sales: loadData('sales'),
        purchases: loadData('purchases'),
        settings: JSON.parse(localStorage.getItem('settings')),
        createdAt: new Date().toISOString()
    };

    try {
        await firebaseDB.collection('backups').add(data);
        showMessage('تم رفع النسخة الاحتياطية إلى Firestore بنجاح', 'success');
    } catch (error) {
        console.error('Firestore backup error:', error);
        showMessage('خطأ في النسخ الاحتياطي: ' + error.message, 'error');
    }
}

// استرجاع من Firebase
async function restoreFromFirestore() {
    try {
        // جلب آخر نسخة (مرتبة حسب createdAt تنازليًا)
        const snapshot = await firebaseDB.collection('backups')
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();

        if (snapshot.empty) {
            showMessage('لا توجد نسخ احتياطية في Firestore', 'info');
            return;
        }

        // بيانات آخر نسخة
        const latestBackup = snapshot.docs[0].data();

        // استبدال بيانات localStorage
        saveData('products', latestBackup.products || []);
        saveData('customers', latestBackup.customers || []);
        saveData('suppliers', latestBackup.suppliers || []);
        saveData('sales', latestBackup.sales || []);
        saveData('purchases', latestBackup.purchases || []);
        if (latestBackup.settings) {
            localStorage.setItem('settings', JSON.stringify(latestBackup.settings));
        }

        showMessage('تم استرجاع البيانات من Firestore بنجاح', 'success');
        setTimeout(() => location.reload(), 1500);

    } catch (error) {
        console.error('Firestore restore error:', error);
        showMessage('خطأ أثناء الاسترجاع: ' + error.message, 'error');
    }
}

