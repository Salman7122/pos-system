// products.js - إدارة المنتجات
function loadProducts() {
    const content = document.getElementById('page-content');
    content.innerHTML = `
        <div class="products-page">
            <div class="page-header">
                <h1>إدارة المنتجات</h1>
                <button class="btn btn-success" onclick="showAddProductModal()">إضافة منتج جديد</button>
            </div>

            <div class="filters-section">
                <div class="search-group">
                    <input type="text" id="product-search" placeholder="البحث عن منتج...">
                    <select id="category-filter">
                        <option value="">جميع الفئات</option>
                    </select>
                </div>
                <button class="btn btn-warning" onclick="showBulkUpdateModal()">تحديث الأسعار بالجملة</button>
            </div>

            <div class="products-table-container">
                <table class="table" id="products-table">
                    <thead>
                        <tr>
                            <th>الاسم</th>
                            <th>الوصف</th>
                            <th>السعر (دولار)</th>
                            <th>السعر (ليرة سورية)</th>
                            <th>الشراء</th>
                            <th>الكمية</th>
                            <th>الفئة</th>
                            <th>نوع السعر</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="products-tbody">
                        <!-- سيتم ملؤها ديناميكياً -->
                    </tbody>
                </table>
            </div>
        </div>

        <!-- نافذة إضافة/تعديل المنتج -->
        <div id="product-modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modal-title">إضافة منتج جديد</h3>
                    <span class="close" onclick="closeModal()">&times;</span>
                </div>
                <form id="product-form">
                    <div class="form-group">
                        <label for="product-name">اسم المنتج</label>
                        <input type="text" id="product-name" required>
                    </div>
                    <div class="form-group">
                        <label for="product-description">الوصف</label>
                        <textarea id="product-description" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="product-price">السعر (دولار)</label>
                        <input type="number" id="product-price" step="0.01" min="0" required>
                    </div>
                    <div class="form-group">
                    <label for="product-price-syp">السعر (ليرة سورية)</label>
                    <input type="number" id="product-price-syp" step="0.01" min="0" required>
                </div>

                <!-- حقول سعر الشراء -->
                <div class="form-group">
                    <label for="purchase-price-usd">سعر الشراء (دولار)</label>
                    <input type="number" id="purchase-price-usd" step="0.01" min="0">
                </div>
                <div class="form-group">
                    <label for="purchase-price-syp">سعر الشراء (ليرة سورية)</label>
                    <input type="number" id="purchase-price-syp" step="0.01" min="0">
                </div>

                <div class="form-group">
                    <label for="product-quantity">الكمية</label>
                    <input type="number" id="product-quantity" required>
                </div>
                    <div class="form-group">
                        <label for="product-category">الفئة</label>
                        <input type="text" id="product-category">
                    </div>
                    <div class="form-group">
                        <label for="price-type">نوع السعر</label>
                        <select id="price-type">
                            <option value="USD">دولار</option>
                            <option value="SYP">ليرة سورية</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-success">حفظ</button>
                        <button type="button" class="btn btn-danger" onclick="closeModal()">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- نافذة التحديث بالجملة -->
        <div id="bulk-update-modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>تحديث الأسعار بالجملة</h3>
                    <span class="close" onclick="closeModal()">&times;</span>
                </div>
                <form id="bulk-update-form">
                    <div class="form-group">
                        <label for="bulk-percentage">نسبة الزيادة (%)</label>
                        <input type="number" id="bulk-percentage" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label for="bulk-category">الفئة (اترك فارغاً للجميع)</label>
                        <input type="text" id="bulk-category">
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-success">تحديث</button>
                        <button type="button" class="btn btn-danger" onclick="closeModal()">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    setupPriceInputs();
    setupPriceType();
    loadProductsData();
    setupProductEventListeners();
}

function setupPriceInputs() {
    const priceUSDInput = document.getElementById('product-price');
    const priceSYPInput = document.getElementById('product-price-syp');
    const purchaseUSDInput = document.getElementById('purchase-price-usd');
    const purchaseSYPInput = document.getElementById('purchase-price-syp');

    if (!priceUSDInput || !priceSYPInput) {
        return;
    }

    let exchangeRate = parseFloat(localStorage.getItem('exchangeRate')) || 1;
    localStorage.setItem('exchangeRate', exchangeRate); // حفظ سعر الصرف الحالي
    let isSyncing = false;

    const updateSYPFromUSD = () => {
        if (isSyncing) return;
        isSyncing = true;
        const usdValue = parseFloat(priceUSDInput.value);
        if (!isNaN(usdValue)) {
            const sypValue = priceSYPInput.dataset.priceSYPLocked === 'true' ? parseFloat(priceSYPInput.value) : (getPriceInSYP ? getPriceInSYP(usdValue) : usdValue * exchangeRate);
            priceSYPInput.value = sypValue ? sypValue.toFixed(2) : '';
        } else if (priceUSDInput.value === '') {
            priceSYPInput.value = '';
        }
        isSyncing = false;
    };

    const updateUSDFromSYP = () => {
        if (isSyncing) return;
        isSyncing = true;
        const sypValue = parseFloat(priceSYPInput.value);
        if (!isNaN(sypValue)) {
            // احسب الدولار دائماً من الليرة بغض النظر عن حالة القفل
            const usdValue = (typeof convertSYPToUSD === 'function') ? convertSYPToUSD(sypValue) : (sypValue / exchangeRate);
            priceUSDInput.value = usdValue ? usdValue.toFixed(2) : '';
        } else if (priceSYPInput.value === '') {
            priceUSDInput.value = '';
        }
        isSyncing = false;
    };

    // مزامنة سعر الشراء
    const updatePurchaseSYPFromUSD = () => {
        if (isSyncing) return;
        isSyncing = true;
        const usdValue = parseFloat(purchaseUSDInput?.value);
        if (!isNaN(usdValue)) {
            const sypValue = (typeof getPriceInSYP === 'function') ? getPriceInSYP(usdValue) : usdValue * exchangeRate;
            if (purchaseSYPInput) purchaseSYPInput.value = sypValue ? sypValue.toFixed(2) : '';
        } else if (purchaseUSDInput && purchaseUSDInput.value === '') {
            if (purchaseSYPInput) purchaseSYPInput.value = '';
        }
        isSyncing = false;
    };

    const updatePurchaseUSDFromSYP = () => {
        if (isSyncing) return;
        isSyncing = true;
        const sypValue = parseFloat(purchaseSYPInput?.value);
        if (!isNaN(sypValue)) {
            const usdValue = (typeof convertSYPToUSD === 'function') ? convertSYPToUSD(sypValue) : (sypValue / exchangeRate);
            if (purchaseUSDInput) purchaseUSDInput.value = usdValue ? usdValue.toFixed(2) : '';
        } else if (purchaseSYPInput && purchaseSYPInput.value === '') {
            if (purchaseUSDInput) purchaseUSDInput.value = '';
        }
        isSyncing = false;
    };

    if (!priceUSDInput.dataset.bound) {
        priceUSDInput.addEventListener('input', () => {
            if (priceSYPInput.dataset.priceSYPLocked !== 'true') {
                updateSYPFromUSD();
            }
            priceSYPInput.dataset.priceSYPLocked = 'false'; // إلغاء قفل سعر الليرة السورية إذا تم تعديل الدولار
        });
        priceSYPInput.addEventListener('input', () => {
            priceSYPInput.dataset.priceSYPLocked = 'true'; // قفل سعر الليرة السورية إذا تم تعديله يدويًا
            updateUSDFromSYP(); // حساب الدولار تلقائياً عند إدخال الليرة
        });

        // ربط حقول الشراء
        if (purchaseUSDInput && purchaseSYPInput) {
            purchaseUSDInput.addEventListener('input', () => {
                updatePurchaseSYPFromUSD();
            });
            purchaseSYPInput.addEventListener('input', () => {
                updatePurchaseUSDFromSYP();
            });
        }

        priceUSDInput.dataset.bound = 'true';
        priceSYPInput.dataset.bound = 'true';
        if (purchaseUSDInput) purchaseUSDInput.dataset.bound = 'true';
        if (purchaseSYPInput) purchaseSYPInput.dataset.bound = 'true';
    }

    // عند فتح النموذج، إذا كان هناك سعر دولار، قم بتحديث سعر الليرة السورية
    // إذا كان سعر الليرة السورية موجودًا بالفعل (أي تم إدخاله يدويًا)، فلا تقم بتحديثه تلقائيًا
    const currentProduct = document.getElementById('product-form').dataset.productId ? db.getById('products', document.getElementById('product-form').dataset.productId) : null;

    if (currentProduct && currentProduct.priceSYPLocked) {
        priceSYPInput.dataset.priceSYPLocked = 'true';
        updateUSDFromSYP(); // إذا كان سعر الليرة السورية مقفلاً، قم بتحديث الدولار بناءً عليه
    } else if (priceUSDInput.value !== '') {
        updateSYPFromUSD();
        priceSYPInput.dataset.priceSYPLocked = 'false';
    } else if (priceSYPInput.value !== '') {
        updateUSDFromSYP();
        priceSYPInput.dataset.priceSYPLocked = 'true';
    } else {
        priceSYPInput.dataset.priceSYPLocked = 'false';
    }
}

function setupPriceType() {
    const priceTypeSelect = document.getElementById('price-type');
    const priceUSDGroup = document.querySelector('label[for="product-price"]').parentElement;
    const priceSYPGroup = document.querySelector('label[for="product-price-syp"]').parentElement;
    const purchaseUSDGroup = document.querySelector('label[for="purchase-price-usd"]')?.parentElement;
    const purchaseSYPGroup = document.querySelector('label[for="purchase-price-syp"]')?.parentElement;

    const updateVisibility = () => {
        if (priceTypeSelect.value === 'USD') {
            priceUSDGroup.style.display = 'block';
            priceSYPGroup.style.display = 'none';
            if (purchaseUSDGroup) purchaseUSDGroup.style.display = 'block';
            if (purchaseSYPGroup) purchaseSYPGroup.style.display = 'none';
            document.getElementById('product-price').required = true;
            document.getElementById('product-price-syp').required = false;
        } else {
            priceUSDGroup.style.display = 'none';
            priceSYPGroup.style.display = 'block';
            if (purchaseUSDGroup) purchaseUSDGroup.style.display = 'none';
            if (purchaseSYPGroup) purchaseSYPGroup.style.display = 'block';
            document.getElementById('product-price').required = false;
            document.getElementById('product-price-syp').required = true;
        }
    };

    priceTypeSelect.addEventListener('change', updateVisibility);
    updateVisibility(); // initial
}

function loadProductsData() {
    const products = db.getAll('products');

    // تحديث المنتجات القديمة لإضافة originalQuantity إذا لم يكن موجوداً
    products.forEach(product => {
        if (!product.originalQuantity) {
            product.originalQuantity = product.quantity;
            db.save('products', product);
        }
    });

    // ترقية قديمة: فكّ قفل سعر الليرة وتحضير USD المرجعي كي تتأثر بسعر الصرف مستقبلاً
    try {
        const exchangeRate = parseFloat(localStorage.getItem('exchangeRate')) || 1;
        products.forEach(p => {
            if (p && p.priceSYPLocked === true) {
                // إذا كان السعر كان ثابتاً بالليرة سابقاً: احسب الدولار المرجعي وافتح القفل
                const syp = parseFloat(p.priceSYP);
                if (!isNaN(syp) && syp > 0) {
                    const usd = (typeof convertSYPToUSD === 'function') ? convertSYPToUSD(syp) : (syp / exchangeRate);
                    p.originalPriceUSD = usd;
                    p.price = usd;
                } else if (p.price && !isNaN(p.price)) {
                    // احتياط: إن وجد الدولار فقط، اعتمد عليه كمرجعي
                    p.originalPriceUSD = p.price;
                    p.priceSYP = (typeof getPriceInSYP === 'function') ? getPriceInSYP(p.price) : (p.price * exchangeRate);
                }
                p.priceSYPLocked = false;
                db.save('products', p);
            } else if (p && (p.originalPriceUSD === undefined || p.originalPriceUSD === null)) {
                // تأكيد وجود USD مرجعي دائماً
                if (p.price && !isNaN(p.price)) {
                    p.originalPriceUSD = p.price;
                } else if (p.priceSYP && !isNaN(p.priceSYP)) {
                    p.originalPriceUSD = (typeof convertSYPToUSD === 'function') ? convertSYPToUSD(p.priceSYP) : (p.priceSYP / exchangeRate);
                    p.price = p.originalPriceUSD;
                }
                db.save('products', p);
            }
        });
    } catch (e) {
        console.warn('Price lock migration skipped:', e);
    }

    const tbody = document.getElementById('products-tbody');
    const categoryFilter = document.getElementById('category-filter');

    // تحديث قائمة الفئات
    const categories = [...new Set(products.map(p => p.category).filter(c => c))];
    categoryFilter.innerHTML = '<option value="">جميع الفئات</option>';
    categories.forEach(category => {
        categoryFilter.innerHTML += `<option value="${category}">${category}</option>`;
    });

    // فحص الإشعارات لنقص المخزون
    products.forEach(product => {
        if (product.isLowStock) {
            showMessage(`تحذير: كمية المنتج "${product.name}" منخفضة (${product.quantity})`, 'warning');
            delete product.isLowStock;
            db.save('products', product);
        }
    });

    // عرض المنتجات
    tbody.innerHTML = products.map(product => {
        const priceInSYP = product.priceSYP !== undefined ? product.priceSYP : getPriceInSYP(product.price);
        const purchaseSYP = (product.purchasePriceSYP !== undefined && product.purchasePriceSYP !== null)
            ? product.purchasePriceSYP
            : (product.purchasePriceUSD !== undefined && product.purchasePriceUSD !== null ? getPriceInSYP(product.purchasePriceUSD) : null);
        const isLowStock = product.quantity <= 0.25 * (product.originalQuantity || product.quantity);
        return `
            <tr>
                <td>${product.name}</td>
                <td>${product.description || ''}</td>
                <td>${formatCurrency(product.price)}</td>
                <td>${formatCurrencySYP(priceInSYP)}</td>
                <td>${purchaseSYP !== null ? `${formatCurrencySYP(purchaseSYP)}<br><small>${formatCurrency(purchaseSYP ? purchaseSYP / (parseFloat(localStorage.getItem('exchangeRate')) || 1) : 0)}</small>` : '-'}</td>
                <td class="${isLowStock ? 'low-stock' : ''}">${product.quantity}</td>
                <td>${product.category || ''}</td>
                <td>${product.priceType === 'USD' ? 'دولار' : 'ليرة سورية'}</td>
                <td>
                    <button class="btn btn-warning" onclick="editProduct('${product.id}')">تعديل</button>
                    <button class="btn btn-danger" onclick="deleteProduct('${product.id}')">حذف</button>
                </td>
            </tr>
        `;
    }).join('');
}

function setupProductEventListeners() {
    // البحث
    document.getElementById('product-search').addEventListener('input', filterProducts);
    document.getElementById('category-filter').addEventListener('change', filterProducts);

    // نموذج المنتج
    document.getElementById('product-form').addEventListener('submit', saveProduct);

    // نموذج التحديث بالجملة
    document.getElementById('bulk-update-form').addEventListener('submit', bulkUpdatePrices);
}

function filterProducts() {
    const searchTerm = document.getElementById('product-search').value.toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;
    const products = db.getAll('products');

    const filtered = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                            (product.description && product.description.toLowerCase().includes(searchTerm));
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const tbody = document.getElementById('products-tbody');
    tbody.innerHTML = filtered.map(product => {
        const priceInSYP = product.priceSYP !== undefined ? product.priceSYP : getPriceInSYP(product.price);
        const purchaseSYP = (product.purchasePriceSYP !== undefined && product.purchasePriceSYP !== null)
            ? product.purchasePriceSYP
            : (product.purchasePriceUSD !== undefined && product.purchasePriceUSD !== null ? getPriceInSYP(product.purchasePriceUSD) : null);
        const isLowStock = product.quantity <= 0.25 * (product.originalQuantity || product.quantity);
        return `
            <tr>
                <td>${product.name}</td>
                <td>${product.description || ''}</td>
                <td>${formatCurrency(product.price)}</td>
                <td>${formatCurrencySYP(priceInSYP)}</td>
                <td>${purchaseSYP !== null ? `${formatCurrencySYP(purchaseSYP)}<br><small>${formatCurrency(purchaseSYP ? purchaseSYP / (parseFloat(localStorage.getItem('exchangeRate')) || 1) : 0)}</small>` : '-'}</td>
                <td class="${isLowStock ? 'low-stock' : ''}">${product.quantity}</td>
                <td>${product.category || ''}</td>
                <td>${product.priceType === 'USD' ? 'دولار' : 'ليرة سورية'}</td>
                <td>
                    <button class="btn btn-warning" onclick="editProduct('${product.id}')">تعديل</button>
                    <button class="btn btn-danger" onclick="deleteProduct('${product.id}')">حذف</button>
                </td>
            </tr>
        `;
    }).join('');
}

function showAddProductModal() {
    document.getElementById('modal-title').textContent = 'إضافة منتج جديد';
    const form = document.getElementById('product-form');
    form.reset();
    delete form.dataset.productId;

    const priceUSDInput = document.getElementById('product-price');
    const priceSYPInput = document.getElementById('product-price-syp');
    if (priceUSDInput) priceUSDInput.value = '';
    if (priceSYPInput) priceSYPInput.value = '';

    const purchaseUSDInput = document.getElementById('purchase-price-usd');
    const purchaseSYPInput = document.getElementById('purchase-price-syp');
    if (purchaseUSDInput) purchaseUSDInput.value = '';
    if (purchaseSYPInput) purchaseSYPInput.value = '';

    document.getElementById('price-type').value = 'USD';

    document.getElementById('product-modal').style.display = 'block';
    setupPriceInputs();
    setupPriceType();
}

function editProduct(id) {
    const product = db.getById('products', id);
    if (product) {
        document.getElementById('modal-title').textContent = 'تعديل المنتج';
        const form = document.getElementById('product-form');
        form.dataset.productId = id;

        document.getElementById('product-name').value = product.name;
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-price').value = (product.price ?? '').toString();
        document.getElementById('product-price-syp').value = (product.priceSYP ?? getPriceInSYP(product.price)).toFixed(2);
        document.getElementById('product-quantity').value = product.quantity;
        document.getElementById('product-category').value = product.category || '';
        document.getElementById('price-type').value = product.priceType || 'USD';

        // تعبئة سعر الشراء
        const purchaseUSDInput = document.getElementById('purchase-price-usd');
        const purchaseSYPInput = document.getElementById('purchase-price-syp');
        const ex = parseFloat(localStorage.getItem('exchangeRate')) || 1;
        const purchaseUSD = product.purchasePriceUSD;
        const purchaseSYP = product.purchasePriceSYP ?? (purchaseUSD != null ? (typeof getPriceInSYP === 'function' ? getPriceInSYP(purchaseUSD) : purchaseUSD * ex) : null);
        if (purchaseUSDInput) purchaseUSDInput.value = (purchaseUSD ?? '').toString();
        if (purchaseSYPInput) purchaseSYPInput.value = purchaseSYP != null ? purchaseSYP.toFixed(2) : '';

        document.getElementById('product-modal').style.display = 'block';
        setupPriceInputs();
        setupPriceType();
    }
}

function saveProduct(e) {
    e.preventDefault();

    const exchangeRate = parseFloat(localStorage.getItem('exchangeRate')) || 1;
    const priceUSDInput = document.getElementById('product-price');
    const priceSYPInput = document.getElementById('product-price-syp');

    let priceUSD = parseFloat(priceUSDInput.value);
    let priceSYP = parseFloat(priceSYPInput.value);

    if (isNaN(priceUSD) && !isNaN(priceSYP)) {
        priceUSD = convertSYPToUSD ? convertSYPToUSD(priceSYP) : priceSYP / exchangeRate;
    }

    if (isNaN(priceSYP) && !isNaN(priceUSD)) {
        priceSYP = getPriceInSYP ? getPriceInSYP(priceUSD) : priceUSD * exchangeRate;
    }

    // قراءة سعر الشراء
    const purchaseUSDInput = document.getElementById('purchase-price-usd');
    const purchaseSYPInput = document.getElementById('purchase-price-syp');
    let purchaseUSD = purchaseUSDInput ? parseFloat(purchaseUSDInput.value) : NaN;
    let purchaseSYP = purchaseSYPInput ? parseFloat(purchaseSYPInput.value) : NaN;

    if (isNaN(purchaseUSD) && !isNaN(purchaseSYP)) {
        purchaseUSD = convertSYPToUSD ? convertSYPToUSD(purchaseSYP) : purchaseSYP / exchangeRate;
    }
    if (isNaN(purchaseSYP) && !isNaN(purchaseUSD)) {
        purchaseSYP = getPriceInSYP ? getPriceInSYP(purchaseUSD) : purchaseUSD * exchangeRate;
    }

    if (isNaN(priceUSD) || isNaN(priceSYP)) {
        showMessage('يرجى إدخال سعر صالح بالدولار أو الليرة السورية', 'error');
        return;
    }

    const quantity = parseInt(document.getElementById('product-quantity').value, 10);
    if (isNaN(quantity)) {
        showMessage('يرجى إدخال كمية صالحة', 'error');
        return;
    }

    const priceType = document.getElementById('price-type').value;

    // احسب الدولار من الليرة عند اختيار نوع السعر "ليرة"
    let computedUSD = parseFloat(priceUSD);
    if (isNaN(computedUSD)) {
        computedUSD = (typeof convertSYPToUSD === 'function') ? convertSYPToUSD(priceSYP) : (priceSYP / exchangeRate);
    }

    const productData = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        price: parseFloat(computedUSD.toFixed(2)),
        priceSYP: parseFloat(priceSYP.toFixed(2)),
        originalPriceUSD: parseFloat(computedUSD.toFixed(4)),
        quantity: quantity,
        category: document.getElementById('product-category').value,
        priceType: priceType,
        // اجعل السعر غير مقفل دائماً لكي يتأثر بسعر الصرف لاحقاً
        priceSYPLocked: false,
        // أسعار الشراء
        purchasePriceUSD: isNaN(purchaseUSD) ? null : parseFloat(purchaseUSD.toFixed(2)),
        purchasePriceSYP: isNaN(purchaseSYP) ? null : parseFloat(purchaseSYP.toFixed(2))
    };

    const productId = e.target.dataset.productId;
    if (productId) {
        productData.id = productId;
        const existingProduct = db.getById('products', productId);
        if (existingProduct) {
            if (quantity > existingProduct.quantity) {
                productData.originalQuantity = quantity;
            } else {
                productData.originalQuantity = existingProduct.originalQuantity;
            }
        }
    } else {
        productData.originalQuantity = quantity;
    }

    db.save('products', productData);
    updateProductPricesInSYP();

    closeModal();
    loadProductsData();
    showMessage('تم حفظ المنتج بنجاح', 'success');
}

function deleteProduct(id) {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
        db.delete('products', id);
        loadProductsData();
        showMessage('تم حذف المنتج بنجاح', 'success');
    }
}

function showBulkUpdateModal() {
    document.getElementById('bulk-update-modal').style.display = 'block';
}

function bulkUpdatePrices(e) {
    e.preventDefault();

    const percentage = parseFloat(document.getElementById('bulk-percentage').value);
    const category = document.getElementById('bulk-category').value;

    let products = db.getAll('products');
    if (category) {
        products = products.filter(p => p.category === category);
    }

    products.forEach(product => {
        if (product.priceType === 'USD') {
            product.price = product.price * (1 + percentage / 100);
            db.save('products', product);
        }
    });

    // تحديث الأسعار بالليرة السورية
    updateProductPricesInSYP();

    closeModal();
    loadProductsData();
    showMessage('تم تحديث الأسعار بنجاح', 'success');
}

function closeModal() {
    document.getElementById('product-modal').style.display = 'none';
    document.getElementById('bulk-update-modal').style.display = 'none';

    const form = document.getElementById('product-form');
    form.reset();
    delete form.dataset.productId;

    const priceUSDInput = document.getElementById('product-price');
    const priceSYPInput = document.getElementById('product-price-syp');
    if (priceUSDInput) priceUSDInput.value = '';
    if (priceSYPInput) priceSYPInput.value = '';
    if (priceSYPInput) priceSYPInput.dataset.priceSYPLocked = 'false'; // إعادة تعيين حالة القفل
}