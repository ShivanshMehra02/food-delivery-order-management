import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Package, ChefHat, Truck, CheckCircle, User, MapPin, Phone, Loader2 } from 'lucide-react';
import { getOrder } from '../services/api';
import { socketService } from '../services/socketService';

const STATUS_CONFIG = {
  'Order Received': { icon: Package, color: 'bg-blue-500', description: 'Your order has been received' },
  'Preparing': { icon: ChefHat, color: 'bg-yellow-500', description: 'Our chefs are preparing your meal' },
  'Out for Delivery': { icon: Truck, color: 'bg-green-500', description: 'Your order is on its way!' }
};

const STATUS_ORDER = ['Order Received', 'Preparing', 'Out for Delivery'];

function StatusTimeline({ currentStatus }) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  return (
    <div className="space-y-8">
      {STATUS_ORDER.map((status, index) => {
        const config = STATUS_CONFIG[status];
        const Icon = config.icon;
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isActive = isCompleted || isCurrent;

        return (
          <div key={status} className="relative flex items-start gap-4">
            {index < STATUS_ORDER.length - 1 && (
              <div className={`absolute left-5 top-10 w-0.5 h-12 ${index < currentIndex ? 'bg-primary' : 'bg-gray-200'}`} />
            )}
            
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${isActive ? config.color : 'bg-gray-200'} ${isCurrent ? 'ring-4 ring-orange-200 scale-110' : ''}`}>
              {isCompleted ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : (
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              )}
            </div>

            <div className="pt-1">
              <div className="flex items-center gap-2">
                <h3 className={`font-semibold ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>{status}</h3>
                {isCurrent && (
                  <span className="px-2 py-0.5 bg-orange-100 text-primary text-xs font-medium rounded-full animate-pulse">
                    Current
                  </span>
                )}
              </div>
              <p className={`text-sm ${isActive ? 'text-gray-600' : 'text-gray-300'}`}>{config.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getOrder(id)
      .then(res => setOrder(res.data))
      .catch(() => setError('Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = socketService.subscribeToOrder(id, (data) => {
      if (data.orderId === id) {
        setOrder(prev => prev ? { ...prev, status: data.status } : prev);
      }
    });
    return unsubscribe;
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
        <Link to="/" className="bg-primary text-white px-6 py-2 rounded-full">Back to Menu</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Menu
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">Order Tracking</h1>
          <span className="px-3 py-1 border border-primary text-primary text-sm font-medium rounded-full">
            #{order.id.slice(0, 8)}
          </span>
        </div>
        <p className="text-gray-500 flex items-center gap-2 mb-8">
          <Clock className="w-4 h-4" />
          Placed on {new Date(order.createdAt).toLocaleString()}
        </p>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Status */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-6">Order Status</h2>
              <StatusTimeline currentStatus={order.status} />
            </div>

            {/* Delivery Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-4">Delivery Information</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{order.customerName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{order.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{order.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.name} × {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <hr className="my-3" />
              <div className="flex justify-between text-gray-600 mb-2">
                <span>Subtotal</span>
                <span>₹{order.totalPrice}</span>
              </div>
              <div className="flex justify-between text-gray-600 mb-3">
                <span>Delivery</span>
                <span className="text-green-600">Free</span>
              </div>
              <hr className="my-3" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{order.totalPrice}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
