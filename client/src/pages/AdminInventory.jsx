import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/store';
import { fetchInventory, updateInventoryItem, createInventoryItem, deleteInventoryItem } from '../features/admin/adminSlice';
import { ShieldAlert, Plus, Settings, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Pizza Loader animation with circular slice cutout
const PizzaLoader = () => (
  <div className="flex flex-col items-center justify-center p-24 min-h-[50vh] space-y-4">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
      className="w-16 h-16 relative"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="44" fill="none" stroke="#e4e4d9" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke="#e23e20"
          strokeWidth="8"
          strokeDasharray="60 140"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
    <p className="text-stone-500 font-extrabold text-sm animate-pulse tracking-wider">Syncing Inventory Logs...</p>
  </div>
);

export const AdminInventory = () => {
  const dispatch = useAppDispatch();
  const { inventory, loading, error } = useAppSelector((state) => state.admin);

  // States for adding a new item
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState('veggies');
  const [newItemQty, setNewItemQty] = useState(50);
  const [newItemThreshold, setNewItemThreshold] = useState(10);
  const [newItemUnit, setNewItemUnit] = useState('portions');

  // Inline edit state
  const [editItemId, setEditItemId] = useState(null);
  const [editQty, setEditQty] = useState(0);
  const [editThreshold, setEditThreshold] = useState(0);

  // Filter state
  const [filterLowStock, setFilterLowStock] = useState(false);

  useEffect(() => {
    dispatch(fetchInventory());
  }, [dispatch]);

  const handleUpdateStock = async (id) => {
    await dispatch(
      updateInventoryItem({
        id,
        data: {
          quantity: editQty,
          threshold: editThreshold,
        },
      })
    );
    setEditItemId(null);
  };

  const handleAddNewItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    await dispatch(
      createInventoryItem({
        name: newItemName,
        type: newItemType,
        quantity: newItemQty,
        threshold: newItemThreshold,
        unit: newItemUnit,
      })
    );

    // Reset Form
    setNewItemName('');
    setNewItemQty(50);
    setNewItemThreshold(10);
    setShowAddForm(false);
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this ingredient from the stock database?')) {
      dispatch(deleteInventoryItem(id));
    }
  };

  const lowStockItems = inventory.filter((item) => item.quantity <= item.threshold);
  const displayedItems = filterLowStock ? lowStockItems : inventory;

  if (loading && inventory.length === 0) return <PizzaLoader />;

  return (
    <div className="space-y-8 animate-fade-in min-h-screen bg-[#faf8f5] p-2 md:p-6 rounded-3xl text-[#1c1917]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1c1917] tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-[#e23e20]" />
            <span>Admin Inventory Management</span>
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Real-time stock warehouse levels, threshold alerts, and ingredient provisioning.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch(fetchInventory())}
            className="p-3 bg-white hover:bg-stone-50 rounded-xl border border-stone-200 text-stone-600 transition-colors shadow-sm"
            title="Refresh Stock List"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-1.5 bg-[#e23e20] hover:bg-[#c22e17] text-white font-bold px-4 py-3 rounded-xl transition-all shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>Provision Material</span>
          </button>
        </div>
      </div>

      {/* Analytics widgets */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="bg-white border border-stone-200 p-6 rounded-3xl shadow-sm">
          <span className="text-[10px] text-stone-400 font-black uppercase tracking-wider block">
            Total Ingredients
          </span>
          <div className="text-3xl font-black text-stone-900 mt-1">{inventory.length}</div>
        </div>

        <div className="bg-white border border-stone-200 p-6 rounded-3xl shadow-sm">
          <span className="text-[10px] text-stone-400 font-black uppercase tracking-wider block">
            Low Stock Warning count
          </span>
          <div className="text-3xl font-black text-amber-600 mt-1">{lowStockItems.length}</div>
        </div>

        <div className="bg-white border border-stone-200 p-6 rounded-3xl shadow-sm">
          <span className="text-[10px] text-stone-400 font-black uppercase tracking-wider block">
            Critical Out of stock
          </span>
          <div className="text-3xl font-black text-[#e23e20] mt-1">
            {inventory.filter((item) => item.quantity === 0).length}
          </div>
        </div>
      </div>

      {/* Add New Stock Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddNewItem}
            className="bg-white p-6 rounded-3xl border border-stone-200 shadow-md space-y-4 max-w-2xl overflow-hidden"
          >
            <h3 className="text-base font-extrabold text-stone-900">Provision New Stock Ingredient</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase mb-2">
                  Ingredient Name
                </label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e23e20]/20 text-xs text-stone-700"
                  placeholder="Pepperoni, Jalapeno..."
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase mb-2">
                  Category Type
                </label>
                <select
                  value={newItemType}
                  onChange={(e) => setNewItemType(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e23e20]/20 text-xs text-stone-700"
                >
                  <option value="base">Crust Base</option>
                  <option value="sauce">Pizza Sauce</option>
                  <option value="cheese">Cheese Blend</option>
                  <option value="veggies">Veggie Topping</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase mb-2">Unit</label>
                <input
                  type="text"
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e23e20]/20 text-xs text-stone-700"
                  placeholder="portions, grams, units..."
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase mb-2">
                  Initial Quantity
                </label>
                <input
                  type="number"
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e23e20]/20 text-xs text-stone-700"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase mb-2">
                  Alert Threshold
                </label>
                <input
                  type="number"
                  value={newItemThreshold}
                  onChange={(e) => setNewItemThreshold(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e23e20]/20 text-xs text-stone-700"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-stone-200 text-stone-500 rounded-xl text-xs font-bold hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#e23e20] hover:bg-[#c22e17] text-white rounded-xl text-xs font-bold shadow"
              >
                Create Stock Item
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Filter tab buttons */}
      <div className="flex border-b border-stone-200">
        <button
          onClick={() => setFilterLowStock(false)}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-all ${
            !filterLowStock
              ? 'border-[#e23e20] text-[#e23e20]'
              : 'border-transparent text-stone-500 hover:text-stone-700'
          }`}
        >
          All Items ({inventory.length})
        </button>
        <button
          onClick={() => setFilterLowStock(true)}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-1.5 ${
            filterLowStock
              ? 'border-[#e23e20] text-[#e23e20]'
              : 'border-transparent text-stone-500 hover:text-stone-700'
          }`}
        >
          <span>Low Stock Alerts</span>
          {lowStockItems.length > 0 && (
            <span className="bg-[#e23e20] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
              {lowStockItems.length}
            </span>
          )}
        </button>
      </div>

      {/* Inventory Items Table */}
      {displayedItems.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-3xl text-stone-500 border border-stone-200">
          No inventory stock items matching selected filters.
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/70 border-b border-stone-200 text-stone-400 font-black text-[10px] uppercase tracking-wider">
                  <th className="p-4">Ingredient</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Stock level</th>
                  <th className="p-4">Alert Threshold</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {displayedItems.map((item) => {
                  const isOutOfStock = item.quantity === 0;
                  const isLowStock = item.quantity <= item.threshold;
                  const isEditing = editItemId === item._id;

                  return (
                    <tr
                      key={item._id}
                      className={`transition-colors ${
                        isOutOfStock
                          ? 'bg-red-50/30'
                          : isLowStock
                          ? 'bg-amber-50/20'
                          : 'hover:bg-stone-50/30'
                      }`}
                    >
                      <td className="p-4 font-bold text-stone-850 capitalize">
                        {item.name}
                      </td>
                      <td className="p-4 text-[10px] text-stone-500 capitalize">{item.type}</td>
                      <td className="p-4">
                        {isEditing ? (
                          <div className="flex items-center space-x-1.5">
                            <input
                              type="number"
                              value={editQty}
                              onChange={(e) => setEditQty(parseInt(e.target.value) || 0)}
                              className="w-20 px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                              min="0"
                            />
                            <span className="text-[10px] text-stone-500">{item.unit}</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span
                              className={`font-black ${
                                isOutOfStock
                                  ? 'text-[#e23e20]'
                                  : isLowStock
                                  ? 'text-amber-600'
                                  : 'text-stone-800'
                              }`}
                            >
                              {item.quantity}
                            </span>
                            <span className="text-[10px] text-stone-400 capitalize">{item.unit}</span>
                            {isOutOfStock && (
                              <span className="bg-red-100 text-red-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                                Out of stock
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editThreshold}
                            onChange={(e) => setEditThreshold(parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                            min="0"
                          />
                        ) : (
                          <span className="text-stone-600 font-semibold">{item.threshold}</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditItemId(null)}
                              className="px-2.5 py-1 text-xs border border-stone-200 text-stone-500 rounded-lg hover:bg-stone-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleUpdateStock(item._id)}
                              className="px-2.5 py-1 text-xs bg-[#e23e20] hover:bg-[#c22e17] text-white rounded-lg font-bold"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end items-center gap-2">
                            <button
                              onClick={() => {
                                setEditItemId(item._id);
                                setEditQty(item.quantity);
                                setEditThreshold(item.threshold);
                              }}
                              className="text-stone-500 hover:text-[#e23e20] p-1.5 rounded-lg hover:bg-stone-50 transition-colors"
                            >
                              <Settings className="h-4.5 w-4.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item._id)}
                              className="text-stone-400 hover:text-[#e23e20] p-1.5 rounded-lg hover:bg-stone-50 transition-colors"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
