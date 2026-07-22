import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/store';
import { fetchAdminOrders, updateAdminOrderStatus } from '../features/admin/adminSlice';
import { ClipboardList, RefreshCw, Clock, DollarSign, Box } from 'lucide-react';
import { io } from 'socket.io-client';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

// Sparkline SVG Component for visual micro-charts
const Sparkline = ({ points = [], color = '#e23e20' }) => {
  if (points.length < 2) return null;
  const width = 100;
  const height = 32;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const coords = points
    .map((val, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - 2 - ((val - min) / range) * (height - 4);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg className="w-20 h-8 shrink-0 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={coords}
      />
    </svg>
  );
};

// Droppable Column Component
const KanbanColumn = ({ id, title, count, children }) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`p-4 rounded-3xl bg-stone-50 border border-stone-200 min-h-[500px] flex flex-col space-y-4 transition-colors ${
        isOver ? 'bg-orange-50/20 border-[#e23e20]/25' : ''
      }`}
    >
      <div className="flex justify-between items-center px-2">
        <h3 className="font-extrabold text-stone-900 capitalize text-sm">{title}</h3>
        <span className="bg-stone-200 text-stone-600 text-[10px] font-black px-2 py-0.5 rounded-full">
          {count}
        </span>
      </div>
      <div className="flex-grow space-y-3 overflow-y-auto max-h-[600px] pr-1">
        {children}
      </div>
    </div>
  );
};

// Draggable Card Component
const KanbanCard = ({ id, order }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : undefined;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white p-4 rounded-2xl border border-stone-200 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow select-none space-y-3 ${
        isDragging ? 'opacity-40 ring-2 ring-[#e23e20]/20' : ''
      }`}
    >
      <div className="flex justify-between items-center text-[9px] text-stone-400 font-bold">
        <span className="font-mono bg-stone-50 px-1.5 py-0.5 rounded">
          #{order._id.substring(order._id.length - 8)}
        </span>
        <span className="font-extrabold">{formatDate(order.createdAt)}</span>
      </div>

      <div className="space-y-1">
        <h4 className="font-black text-xs text-stone-850 line-clamp-2 leading-snug">
          {order.items.map((item) => `${item.quantity}x ${item.size} ${item.base?.name || 'Pizza'}`).join(', ')}
        </h4>
        <span className="text-[10px] text-stone-400 block max-w-full truncate capitalize">
          To: {order.deliveryAddress}
        </span>
      </div>

      <div className="flex justify-between items-center border-t border-dashed border-stone-100 pt-3 text-[10px]">
        <span
          className={`font-black uppercase tracking-wider ${
            order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-stone-400'
          }`}
        >
          {order.paymentStatus}
        </span>
        <span className="font-black text-stone-850">${order.totalAmount.toFixed(2)}</span>
      </div>
    </div>
  );
};

export const AdminOrders = () => {
  const dispatch = useAppDispatch();
  const { orders, loading } = useAppSelector((state) => state.admin);

  const fetchAllData = () => {
    dispatch(fetchAdminOrders());
  };

  useEffect(() => {
    fetchAllData();
  }, [dispatch]);

  // Hook up WebSockets to keep dashboard updated in real-time
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : 'http://localhost:5000';

    const socket = io(socketUrl, { withCredentials: true });

    socket.on('connect', () => {
      orders.forEach((order) => {
        if (order.status !== 'delivered') {
          socket.emit('joinOrder', order._id);
        }
      });
    });

    socket.on('orderStatusUpdated', () => {
      dispatch(fetchAdminOrders());
    });

    return () => {
      socket.disconnect();
    };
  }, [orders.length, dispatch]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const orderId = active.id;
    const newStatus = over.id; // column id
    
    // Find active order status to verify it's a change
    const order = orders.find(o => o._id === orderId);
    if (order && order.status !== newStatus) {
      dispatch(updateAdminOrderStatus({ id: orderId, status: newStatus }));
    }
  };

  // Filter columns for Kanban
  const receivedOrders = orders.filter((o) => o.status === 'received');
  const kitchenOrders = orders.filter((o) => o.status === 'in the kitchen');
  const transitOrders = orders.filter((o) => o.status === 'out for delivery');

  // Completed delivered orders (rendered in a list at the bottom)
  const completedOrders = orders.filter((o) => o.status === 'delivered');

  // Hardcoded daily stats mock trends for sparklines
  const orderTrends = [10, 14, 18, 12, 16, 22, orders.length];
  const revenueTrends = [110, 180, 240, 160, 200, 310, orders.reduce((sum, o) => sum + o.totalAmount, 0)];

  return (
    <div className="space-y-8 animate-fade-in min-h-screen bg-[#faf8f5] p-2 md:p-6 rounded-3xl text-[#1c1917]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1c1917] tracking-tight flex items-center gap-2">
            <ClipboardList className="h-8 w-8 text-[#e23e20]" />
            <span>Admin Orders Board</span>
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Drag-and-drop cards between stages to update status and trigger WebSocket updates instantly.
          </p>
        </div>

        <button
          onClick={fetchAllData}
          className="p-3 bg-white hover:bg-stone-50 rounded-xl border border-stone-200 text-stone-600 transition-colors shadow-sm"
          title="Refresh Queue"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Analytics widgets with sparklines */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="bg-white border border-stone-200 p-6 rounded-3xl shadow-sm flex justify-between items-center gap-4">
          <div>
            <span className="text-[10px] text-stone-400 font-black uppercase tracking-wider block">Total Orders</span>
            <div className="text-3xl font-black text-stone-900 mt-1">{orders.length}</div>
          </div>
          <Sparkline points={orderTrends} color="#e23e20" />
        </div>

        <div className="bg-white border border-stone-200 p-6 rounded-3xl shadow-sm flex justify-between items-center gap-4">
          <div>
            <span className="text-[10px] text-stone-400 font-black uppercase tracking-wider block">Today's Revenue</span>
            <div className="text-3xl font-black text-stone-900 mt-1">
              ${orders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}
            </div>
          </div>
          <Sparkline points={revenueTrends} color="#10b981" />
        </div>

        <div className="bg-white border border-stone-200 p-6 rounded-3xl shadow-sm flex justify-between items-center gap-4">
          <div>
            <span className="text-[10px] text-stone-400 font-black uppercase tracking-wider block">Active Queue</span>
            <div className="text-3xl font-black text-stone-900 mt-1">
              {receivedOrders.length + kitchenOrders.length + transitOrders.length}
            </div>
          </div>
          <div className="flex items-center text-xs font-black text-stone-400 gap-1.5 shrink-0 bg-stone-50 px-3 py-2 rounded-xl">
            <Clock className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
            <span>Live Feed</span>
          </div>
        </div>
      </div>

      {/* 2. KANBAN DRAG-AND-DROP BOARD */}
      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Column 1: Received */}
          <KanbanColumn id="received" title="Received" count={receivedOrders.length}>
            {receivedOrders.map((order) => (
              <KanbanCard key={order._id} id={order._id} order={order} />
            ))}
          </KanbanColumn>

          {/* Column 2: In the Kitchen */}
          <KanbanColumn id="in the kitchen" title="Preparing" count={kitchenOrders.length}>
            {kitchenOrders.map((order) => (
              <KanbanCard key={order._id} id={order._id} order={order} />
            ))}
          </KanbanColumn>

          {/* Column 3: Out for Delivery */}
          <KanbanColumn id="out for delivery" title="Out for Delivery" count={transitOrders.length}>
            {transitOrders.map((order) => (
              <KanbanCard key={order._id} id={order._id} order={order} />
            ))}
          </KanbanColumn>
        </div>
      </DndContext>

      {/* 3. COMPLETED DELIVERED LIST */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-stone-900 text-sm">Completed Deliveries History ({completedOrders.length})</h3>
        <div className="divide-y divide-stone-100 max-h-60 overflow-y-auto pr-1">
          {completedOrders.map((order) => (
            <div key={order._id} className="py-3 flex justify-between items-center gap-4 text-xs">
              <div>
                <span className="font-mono font-bold text-stone-700 bg-stone-50 px-1.5 py-0.5 rounded">
                  #{order._id.substring(order._id.length - 8)}
                </span>
                <span className="text-stone-500 ml-3 capitalize font-semibold">
                  {order.items.map((item) => `${item.quantity}x ${item.size} ${item.base?.name || 'Pizza'}`).join(', ')}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-stone-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                <span className="font-black text-stone-800">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          ))}
          {completedOrders.length === 0 && (
            <div className="text-center py-6 text-stone-400 text-xs">No orders completed yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
