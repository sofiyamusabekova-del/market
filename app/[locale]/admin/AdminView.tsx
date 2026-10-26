'use client';

import React, { useState } from 'react';
import { Locale } from '@/lib/i18n';
import styles from './admin.module.css';
import { Button } from '@/components/ui/Button';
import { Price } from '@/components/ui/Price';
import {
  ShieldCheck,
  Package,
  ShoppingCart,
  FolderTree,
  FileText,
  Plus,
  Trash2,
  Lock,
  DollarSign,
  AlertCircle,
  X,
  Search,
} from 'lucide-react';

interface AdminViewProps {
  locale: Locale;
  initialData: any;
}

export const AdminView: React.FC<AdminViewProps> = ({ locale, initialData }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authKey, setAuthKey] = useState('');
  const [authError, setAuthError] = useState(false);

  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'categories' | 'audit'>('orders');
  const [data, setData] = useState(initialData);
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [productSearch, setProductSearch] = useState('');

  // New product modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitleRu, setNewTitleRu] = useState('');
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('10');
  const [newCategory, setNewCategory] = useState('smartphones');
  const [newImage, setNewImage] = useState('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80');

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authKey === 'voltadmin2026' || authKey === 'admin') {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  // Change order status
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer voltadmin2026',
        },
        body: JSON.stringify({
          action: 'UPDATE_ORDER_STATUS',
          orderId,
          status: newStatus,
        }),
      });
      if (res.ok) {
        setData((prev: any) => ({
          ...prev,
          orders: prev.orders.map((o: any) =>
            o.id === orderId || o.orderNumber === orderId ? { ...o, status: newStatus } : o
          ),
        }));
      }
    } catch {}
  };

  // Delete product
  const handleDeleteProduct = async (slug: string) => {
    if (!confirm(locale === 'ru' ? 'Удалить этот товар?' : 'Delete this product?')) return;
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer voltadmin2026',
        },
        body: JSON.stringify({ action: 'DELETE_PRODUCT', slug }),
      });
      setData((prev: any) => ({
        ...prev,
        products: prev.products.filter((p: any) => p.slug !== slug),
      }));
    } catch {}
  };

  // Add Product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = newTitleEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const productPayload = {
      id: `prod-${Date.now()}`,
      slug,
      title: { ru: newTitleRu, en: newTitleEn },
      price: Number(newPrice),
      stockCount: Number(newStock),
      inStock: Number(newStock) > 0,
      categorySlug: newCategory,
      images: [newImage],
      attributes: [],
      description: { ru: 'Официальная сертифицированная продукция с гарантией.', en: 'Official certified products.' },
    };

    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer voltadmin2026',
        },
        body: JSON.stringify({ action: 'SAVE_PRODUCT', product: productPayload }),
      });

      setData((prev: any) => ({
        ...prev,
        products: [productPayload, ...prev.products],
      }));
      setShowAddModal(false);
      setNewTitleRu('');
      setNewTitleEn('');
      setNewPrice('');
    } catch {}
  };

  if (!isAuthenticated) {
    return (
      <div className={`container ${styles.adminContainer}`} style={{ maxWidth: '440px', margin: '4rem auto' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)', marginBottom: '1.25rem' }}>
            <Lock size={28} />
          </div>
          <h2 style={{ marginBottom: '0.5rem' }}>VOLT ADMIN</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            {locale === 'ru' ? 'Введите ключ доступа администратора' : 'Enter administrator security key'}
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="password"
              placeholder={locale === 'ru' ? 'Пароль (демо: voltadmin2026)' : 'Key (demo: voltadmin2026)'}
              value={authKey}
              onChange={(e) => setAuthKey(e.target.value)}
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', color: 'white', outline: 'none' }}
            />
            {authError && (
              <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>
                {locale === 'ru' ? 'Неверный ключ доступа' : 'Invalid passkey'}
              </span>
            )}
            <Button variant="primary" size="lg" type="submit" fullWidth>
              <span>{locale === 'ru' ? 'Войти в панель' : 'Access Dashboard'}</span>
            </Button>
          </form>
        </div>
      </div>
    );
  }

  const filteredOrders = data.orders.filter((o: any) => {
    if (orderFilter === 'ALL') return true;
    return o.status === orderFilter;
  });

  const filteredProducts = data.products.filter((p: any) => {
    if (!productSearch) return true;
    const q = productSearch.toLowerCase();
    return (
      p.title.ru.toLowerCase().includes(q) ||
      p.title.en.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q)
    );
  });

  return (
    <div className={`container ${styles.adminContainer}`}>
      {/* Top Header */}
      <div className={styles.topBar}>
        <div className={styles.titleGroup}>
          <h1>
            <span>VOLT STORE</span>
            <span className={styles.adminBadge}>ADMIN DASHBOARD</span>
          </h1>
        </div>

        {/* Tab navigation */}
        <div className={styles.tabsNav}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'orders' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingCart size={16} />
            <span>{locale === 'ru' ? 'Заказы' : 'Orders'} ({data.orders.length})</span>
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'products' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={16} />
            <span>{locale === 'ru' ? 'Товары' : 'Products'} ({data.products.length})</span>
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'categories' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <FolderTree size={16} />
            <span>{locale === 'ru' ? 'Категории' : 'Categories'}</span>
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'audit' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            <FileText size={16} />
            <span>{locale === 'ru' ? 'Аудит' : 'Audit Logs'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><DollarSign size={24} /></div>
          <div>
            <div className={styles.statLabel}>{locale === 'ru' ? 'Общий оборот' : 'Total Revenue'}</div>
            <div className={styles.statValue}><Price amount={data.stats.totalRevenue} locale={locale} size="md" /></div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}><ShoppingCart size={24} /></div>
          <div>
            <div className={styles.statLabel}>{locale === 'ru' ? 'Всего заказов' : 'Total Orders'}</div>
            <div className={styles.statValue}>{data.stats.totalOrders}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}><Package size={24} /></div>
          <div>
            <div className={styles.statLabel}>{locale === 'ru' ? 'Позиций каталога' : 'Active Products'}</div>
            <div className={styles.statValue}>{data.stats.totalProducts}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#fbbf24' }}><AlertCircle size={24} /></div>
          <div>
            <div className={styles.statLabel}>{locale === 'ru' ? 'Заканчиваются' : 'Low Stock Items'}</div>
            <div className={styles.statValue}>{data.stats.lowStockCount}</div>
          </div>
        </div>
      </div>

      {/* TAB 1: Orders Management */}
      {activeTab === 'orders' && (
        <div className={styles.tableCard}>
          <div className={styles.tableHeaderRow}>
            <h3>{locale === 'ru' ? 'Управление заказами' : 'Customer Orders'}</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['ALL', 'PENDING', 'PROCESSING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderFilter(st)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    background: orderFilter === st ? 'var(--accent-cyan)' : 'var(--bg-surface)',
                    color: orderFilter === st ? 'black' : 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                    fontWeight: 600,
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Номер</th>
                <th>Покупатель</th>
                <th>Город / Доставка</th>
                <th>Сумма</th>
                <th>Статус заказа</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((ord: any) => (
                <tr key={ord.id || ord.orderNumber}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {ord.orderNumber}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{ord.customerName}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{ord.customerPhone}</div>
                  </td>
                  <td>
                    <div>{ord.city}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{ord.deliveryMethod}</div>
                  </td>
                  <td><Price amount={ord.total} locale={locale} size="sm" /></td>
                  <td>
                    <select
                      className={styles.statusSelect}
                      value={ord.status}
                      onChange={(e) => handleStatusChange(ord.id || ord.orderNumber, e.target.value)}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="PAID">PAID</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {new Date(ord.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: Products CRUD */}
      {activeTab === 'products' && (
        <div className={styles.tableCard}>
          <div className={styles.tableHeaderRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, maxWidth: '360px' }}>
              <Search size={18} color="var(--text-muted)" />
              <input
                type="text"
                placeholder={locale === 'ru' ? 'Поиск товаров по названию...' : 'Search products...'}
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem', color: 'white', width: '100%' }}
              />
            </div>
            <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
              <Plus size={16} />
              <span>{locale === 'ru' ? 'Добавить товар' : 'Add Product'}</span>
            </Button>
          </div>

          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Фото</th>
                <th>Название</th>
                <th>Категория</th>
                <th>Цена</th>
                <th>Остаток</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p: any) => (
                <tr key={p.slug}>
                  <td>
                    <img src={p.images[0]} alt="" className={styles.productRowImg} />
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.title.ru}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{p.slug}</div>
                  </td>
                  <td>{p.categorySlug}</td>
                  <td><Price amount={p.price} locale={locale} size="sm" /></td>
                  <td>
                    <span className={`${styles.badgeStock} ${p.stockCount <= 5 ? styles.badgeLowStock : styles.badgeInStock}`}>
                      {p.stockCount} шт.
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDeleteProduct(p.slug)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}
                      title="Удалить товар"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: Categories */}
      {activeTab === 'categories' && (
        <div className={styles.tableCard}>
          <div className={styles.tableHeaderRow}>
            <h3>{locale === 'ru' ? 'Категории каталога' : 'Store Categories'}</h3>
          </div>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Slug</th>
                <th>Название (RU)</th>
                <th>Название (EN)</th>
                <th>Иконка</th>
                <th>Кол-во товаров</th>
              </tr>
            </thead>
            <tbody>
              {data.categories.map((c: any) => (
                <tr key={c.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>{c.slug}</td>
                  <td style={{ fontWeight: 600 }}>{c.name.ru}</td>
                  <td>{c.name.en}</td>
                  <td>{c.iconName}</td>
                  <td>{c.itemCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: Audit Log */}
      {activeTab === 'audit' && (
        <div className={styles.tableCard}>
          <h3 style={{ marginBottom: '1.5rem' }}>{locale === 'ru' ? 'Журнал аудита действий (Audit Log)' : 'Audit Trail'}</h3>
          <div className={styles.auditList}>
            {data.auditLogs.map((log: any) => (
              <div key={log.id} className={styles.auditItem}>
                <div>
                  <div className={styles.auditAction}>{log.action} — {log.entity}</div>
                  <div className={styles.auditDetails}>{log.details}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className={styles.auditTime}>{new Date(log.timestamp).toLocaleTimeString()}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Автор: {log.author}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add New Product */}
      {showAddModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>{locale === 'ru' ? 'Добавить новый товар' : 'Create Product'}</h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                  Название товара (RU) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Sony PlayStation 5 Pro"
                  value={newTitleRu}
                  onChange={(e) => setNewTitleRu(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.65rem', color: 'white' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                  Название товара (EN) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Sony PlayStation 5 Pro"
                  value={newTitleEn}
                  onChange={(e) => setNewTitleEn(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.65rem', color: 'white' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                    Цена (UZS) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="9500000"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.65rem', color: 'white' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                    Остаток на складе *
                  </label>
                  <input
                    type="number"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.65rem', color: 'white' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                  Категория
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.65rem', color: 'white' }}
                >
                  {data.categories.map((c: any) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name.ru} ({c.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                  URL фотографии
                </label>
                <input
                  type="text"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.65rem', color: 'white' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <Button variant="secondary" size="md" onClick={() => setShowAddModal(false)} type="button">
                  Отмена
                </Button>
                <Button variant="primary" size="md" type="submit">
                  Создать товар
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
