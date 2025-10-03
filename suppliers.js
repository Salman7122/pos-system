// suppliers.js - إدارة الموردين
function loadSuppliers() {
    const content = document.getElementById('page-content');
    content.innerHTML = `
        <div class="suppliers-page">
            <div class="page-header">
                <h1>إدارة الموردين</h1>
                <button class="btn btn-success" onclick="showAddSupplierModal()">إضافة مورد جديد</button>
            </div>

            <div class="filters-section">
                <div class="search-group">
                    <input type="text" id="supplier-search" placeholder="البحث عن مورد...">
                </div>
            </div>

            <div class="suppliers-table-container">
                <table class="table" id="suppliers-table">
                    <thead>
                        <tr>
                            <th>اسم المورد</th>
                            <th>رقم الهاتف</th>
                            <th>البريد الإلكتروني</th>
                            <th>العنوان</th>
                            <th>الرصيد</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="suppliers-tbody">
                        <!-- سيتم ملؤها ديناميكياً -->
                    </tbody>
                </table>
            </div>
        </div>

        <!-- نافذة إضافة/تعديل المورد -->
        <div id="supplier-modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="supplier-modal-title">إضافة مورد جديد</h3>
                    <span class="close" onclick="closeSupplierModal()">&times;</span>
                </div>
                <form id="supplier-form">
                    <div class="form-group">
                        <label for="supplier-name">اسم المورد</label>
                        <input type="text" id="supplier-name" required>
                    </div>
                    <div class="form-group">
                        <label for="supplier-phone">رقم الهاتف</label>
                        <input type="tel" id="supplier-phone">
                    </div>
                    <div class="form-group">
                        <label for="supplier-email">البريد الإلكتروني</label>
                        <input type="email" id="supplier-email">
                    </div>
                    <div class="form-group">
                        <label for="supplier-address">العنوان</label>
                        <textarea id="supplier-address" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="supplier-contact-person">الشخص المسؤول</label>
                        <input type="text" id="supplier-contact-person">
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-success">حفظ</button>
                        <button type="button" class="btn btn-danger" onclick="closeSupplierModal()">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    loadSuppliersData();
    setupSupplierEventListeners();
}

function loadSuppliersData() {
    const suppliers = db.getAll('suppliers');
    const tbody = document.getElementById('suppliers-tbody');

    tbody.innerHTML = suppliers.map(supplier => {
        const balance = calculateSupplierBalance(supplier.id);
        return `
            <tr>
                <td>${supplier.name}</td>
                <td>${supplier.phone || ''}</td>
                <td>${supplier.email || ''}</td>
                <td>${supplier.address || ''}</td>
                <td class="${balance > 0 ? 'debt' : balance < 0 ? 'credit' : ''}">${formatCurrency(balance)}</td>
                <td>
                    <button class="btn btn-warning" onclick="editSupplier('${supplier.id}')">تعديل</button>
                    <button class="btn btn-danger" onclick="deleteSupplier('${supplier.id}')">حذف</button>
                    <button class="btn btn-success" onclick="viewSupplierPurchases('${supplier.id}')">المشتريات</button>
                </td>
            </tr>
        `;
    }).join('');
}

function setupSupplierEventListeners() {
    document.getElementById('supplier-search').addEventListener('input', filterSuppliers);
    document.getElementById('supplier-form').addEventListener('submit', saveSupplier);
}

function filterSuppliers() {
    const searchTerm = document.getElementById('supplier-search').value.toLowerCase();
    const suppliers = db.getAll('suppliers');

    const filtered = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm) ||
        (supplier.phone && supplier.phone.includes(searchTerm)) ||
        (supplier.email && supplier.email.toLowerCase().includes(searchTerm))
    );

    const tbody = document.getElementById('suppliers-tbody');
    tbody.innerHTML = filtered.map(supplier => {
        const balance = calculateSupplierBalance(supplier.id);
        return `
            <tr>
                <td>${supplier.name}</td>
                <td>${supplier.phone || ''}</td>
                <td>${supplier.email || ''}</td>
                <td>${supplier.address || ''}</td>
                <td class="${balance > 0 ? 'debt' : balance < 0 ? 'credit' : ''}">${formatCurrency(balance)}</td>
                <td>
                    <button class="btn btn-warning" onclick="editSupplier('${supplier.id}')">تعديل</button>
                    <button class="btn btn-danger" onclick="deleteSupplier('${supplier.id}')">حذف</button>
                    <button class="btn btn-success" onclick="viewSupplierPurchases('${supplier.id}')">المشتريات</button>
                </td>
            </tr>
        `;
    }).join('');
}

function showAddSupplierModal() {
    document.getElementById('supplier-modal-title').textContent = 'إضافة مورد جديد';
    document.getElementById('supplier-form').reset();
    document.getElementById('supplier-modal').style.display = 'block';
}

function editSupplier(id) {
    const supplier = db.getById('suppliers', id);
    if (supplier) {
        document.getElementById('supplier-modal-title').textContent = 'تعديل المورد';
        document.getElementById('supplier-name').value = supplier.name;
        document.getElementById('supplier-phone').value = supplier.phone || '';
        document.getElementById('supplier-email').value = supplier.email || '';
        document.getElementById('supplier-address').value = supplier.address || '';
        document.getElementById('supplier-contact-person').value = supplier.contactPerson || '';
        document.getElementById('supplier-form').dataset.supplierId = id;
        document.getElementById('supplier-modal').style.display = 'block';
    }
}

function saveSupplier(e) {
    e.preventDefault();

    const supplierData = {
        name: document.getElementById('supplier-name').value,
        phone: document.getElementById('supplier-phone').value,
        email: document.getElementById('supplier-email').value,
        address: document.getElementById('supplier-address').value,
        contactPerson: document.getElementById('supplier-contact-person').value
    };

    const supplierId = e.target.dataset.supplierId;
    if (supplierId) {
        supplierData.id = supplierId;
    }

    db.save('suppliers', supplierData);
    closeSupplierModal();
    loadSuppliersData();
    showMessage('تم حفظ المورد بنجاح', 'success');
}

function deleteSupplier(id) {
    if (confirm('هل أنت متأكد من حذف هذا المورد؟ سيتم حذف جميع المشتريات المتعلقة به.')) {
        db.delete('suppliers', id);
        loadSuppliersData();
        showMessage('تم حذف المورد بنجاح', 'success');
    }
}

function viewSupplierPurchases(supplierId) {
    const supplier = db.getById('suppliers', supplierId);
    const purchases = db.getAll('purchases').filter(purchase => purchase.supplierId === supplierId);

    const content = document.getElementById('page-content');
    content.innerHTML = `
        <div class="supplier-purchases">
            <div class="page-header">
                <h1>مشتريات ${supplier.name}</h1>
                <button class="btn btn-warning" onclick="loadSuppliers()">العودة</button>
            </div>

            <div class="purchases-table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>رقم الفاتورة</th>
                            <th>التاريخ</th>
                            <th>المبلغ الكلي</th>
                            <th>المدفوع</th>
                            <th>الباقي</th>
                            <th>الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${purchases.map(purchase => `
                            <tr>
                                <td>${purchase.id}</td>
                                <td>${formatDate(purchase.date)}</td>
                                <td>${formatCurrency(purchase.total)}</td>
                                <td>${formatCurrency(purchase.paid || 0)}</td>
                                <td>${formatCurrency(purchase.total - (purchase.paid || 0))}</td>
                                <td>${(purchase.paid || 0) >= purchase.total ? 'مدفوعة' : 'غير مدفوعة'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function calculateSupplierBalance(supplierId) {
    const purchases = db.getAll('purchases').filter(purchase => purchase.supplierId === supplierId);
    const totalPurchases = purchases.reduce((total, purchase) => total + purchase.total, 0);
    const totalPaid = purchases.reduce((total, purchase) => total + (purchase.paid || 0), 0);
    return totalPurchases - totalPaid;
}

function closeSupplierModal() {
    document.getElementById('supplier-modal').style.display = 'none';
    document.getElementById('supplier-form').reset();
    delete document.getElementById('supplier-form').dataset.supplierId;
}