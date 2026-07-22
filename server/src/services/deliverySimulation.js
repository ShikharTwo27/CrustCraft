const axios = require('axios');
const { env } = require('../config/env');
const { Order } = require('../models/Order');

// Origin coordinate configuration (fictional storefront near Amreli, Gujarat)
const STORE_LAT = parseFloat(env.STORE_LAT) || 21.6030;
const STORE_LNG = parseFloat(env.STORE_LNG) || 71.2225;

const activeSimulations = new Map();

/**
 * Generate real-road coordinates using project-osrm free public service
 */
const generateDeliveryRoute = async (orderId) => {
  let order;
  try {
    order = await Order.findById(orderId);
    if (!order) return;

    // Generate random customer coordinates within a 2km bounding box in Amreli, Gujarat
    const destLat = STORE_LAT + (Math.random() - 0.5) * 0.025;
    const destLng = STORE_LNG + (Math.random() - 0.5) * 0.025;

    // Direct road routing via project-osrm.org API
    const url = `http://router.project-osrm.org/route/v1/driving/${STORE_LNG},${STORE_LAT};${destLng},${destLat}?overview=full&geometries=geojson`;
    const response = await axios.get(url, { timeout: 6000 });

    if (response.data && response.data.routes && response.data.routes[0]) {
      const coords = response.data.routes[0].geometry.coordinates; // Returns [lng, lat]
      const duration = response.data.routes[0].duration; // seconds

      // Map to [lat, lng] arrays for Leaflet
      const mappedRoute = coords.map((c) => [c[1], c[0]]);

      order.deliveryRoute = mappedRoute;
      order.currentPosition = mappedRoute[0] || [STORE_LAT, STORE_LNG];
      order.deliveryEta = Math.round(duration);
      await order.save();
      console.log(`🗺️ OSRM route created for order ${orderId}: ${mappedRoute.length} points, duration: ${duration}s`);
    } else {
      // Fallback straight line route if OSRM is unreachable
      const points = 10;
      const routePoints = [];
      for (let i = 0; i <= points; i++) {
        const t = i / points;
        const lat = STORE_LAT + (destLat - STORE_LAT) * t;
        const lng = STORE_LNG + (destLng - STORE_LNG) * t;
        routePoints.push([lat, lng]);
      }
      order.deliveryRoute = routePoints;
      order.currentPosition = [STORE_LAT, STORE_LNG];
      order.deliveryEta = 300; // 5 min
      await order.save();
    }
  } catch (err) {
    console.warn('⚠️ OSRM API failed, generating straight line fallback:', err.message);
    // Straight line fallback coordinates
    const destLat = STORE_LAT + 0.012;
    const destLng = STORE_LNG + 0.012;
    const points = 10;
    const routePoints = [];
    for (let i = 0; i <= points; i++) {
      const t = i / points;
      routePoints.push([
        STORE_LAT + (destLat - STORE_LAT) * t,
        STORE_LNG + (destLng - STORE_LNG) * t,
      ]);
    }
    order.deliveryRoute = routePoints;
    order.currentPosition = [STORE_LAT, STORE_LNG];
    order.deliveryEta = 300;
    try {
      await order.save();
    } catch (saveErr) {}
  }
};

/**
 * Triggers server-side simulation updates
 */
const startSimulation = (orderId) => {
  if (activeSimulations.has(orderId.toString())) {
    return;
  }

  // Set counter progress index at 0
  let currentStep = 0;

  const intervalId = setInterval(async () => {
    try {
      const order = await Order.findById(orderId);
      
      // Stop condition: Order delivered or deleted
      if (!order || order.status !== 'out for delivery') {
        clearInterval(intervalId);
        activeSimulations.delete(orderId.toString());
        return;
      }

      const route = order.deliveryRoute;
      if (!route || route.length === 0) {
        clearInterval(intervalId);
        activeSimulations.delete(orderId.toString());
        return;
      }

      currentStep += 1;

      // Ensure we do not overflow indices
      if (currentStep >= route.length) {
        currentStep = route.length - 1;
      }

      const currentPos = route[currentStep];
      order.currentPosition = currentPos;
      await order.save();

      // Broadcast position update over socket room
      const { getIO } = require('../config/socket');
      try {
        const io = getIO();
        const estDuration = 40; // Total simulated delivery seconds (for snappy test demo)
        const progressPct = currentStep / route.length;
        const etaSeconds = Math.max(0, Math.round(estDuration * (1 - progressPct)));

        io.to(orderId.toString()).emit('driverPositionUpdated', {
          orderId: orderId.toString(),
          position: currentPos,
          eta: etaSeconds,
        });
      } catch (sockErr) {}

      // Check if driver has reached destination
      if (currentStep >= route.length - 1) {
        order.status = 'delivered';
        await order.save();

        // Broadcast status update
        try {
          const io = getIO();
          io.to(orderId.toString()).emit('orderStatusUpdated', {
            orderId: orderId.toString(),
            status: 'delivered',
            paymentStatus: order.paymentStatus,
          });
        } catch (sockErr) {}

        clearInterval(intervalId);
        activeSimulations.delete(orderId.toString());
        console.log(`🏁 Delivery completed for Order: ${orderId}`);
      }
    } catch (err) {
      console.error('❌ Error during delivery simulation step:', err.message);
      clearInterval(intervalId);
      activeSimulations.delete(orderId.toString());
    }
  }, 3500); // Trigger driver update every 3.5 seconds

  activeSimulations.set(orderId.toString(), intervalId);
};

module.exports = {
  generateDeliveryRoute,
  startSimulation,
};
