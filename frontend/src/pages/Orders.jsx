import { useEffect, useState } from "react";
import Loader from "../components/Loader.jsx";
import api from "../api/api.js";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/orders/my-orders");
        setOrders(data);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <Loader fullScreen label="Loading your orders" />;
  }

  return (
    <div className="page-shell space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Order History</p>
        <h1 className="text-4xl font-black text-slate-950">Your recent purchases</h1>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="panel p-6">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Order ID</p>
                <p className="font-semibold text-slate-950">{order._id}</p>
              </div>
              <div className="flex gap-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Status</p>
                  <p className="font-semibold capitalize text-slate-950">{order.status}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Total</p>
                  <p className="font-semibold text-slate-950">Rs. {order.totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-4">
              {order.items.map((item) => (
                <div key={item.product} className="flex items-center gap-4 rounded-3xl bg-slate-50 p-4">
                  <img src={item.image} alt={item.name} className="h-20 w-20 rounded-2xl object-cover" />
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-950">{item.name}</h3>
                    <p className="text-sm text-slate-500">
                      Qty {item.quantity} • Rs. {item.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {!orders.length && <div className="panel p-10 text-center text-slate-600">No orders found yet.</div>}
      </div>
    </div>
  );
};

export default Orders;
