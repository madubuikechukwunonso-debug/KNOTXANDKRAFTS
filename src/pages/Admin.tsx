import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import Navigation from "@/components/Navigation";
import {
  ShoppingBag, Calendar, Users, Mail, Image, MessageSquare,
  Check, X, Trash2, Shield,
} from "lucide-react";

const TABS = [
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "users", label: "Users", icon: Users },
  { id: "subscribers", label: "Newsletter", icon: Mail },
  { id: "heroImages", label: "Hero Images", icon: Image },
  { id: "messages", label: "Messages", icon: MessageSquare },
];

export default function Admin() {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("orders");

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [isLoading, user, isAdmin, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      <Navigation />

      <div className="pt-24 lg:pt-28 pb-20 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-serif text-3xl lg:text-4xl font-light mb-8">
            Admin Dashboard
          </h1>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-widest font-medium transition-all ${
                  tab === t.id
                    ? "bg-black text-white"
                    : "bg-white text-black/60 hover:text-black"
                }`}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white p-6 lg:p-8">
            {tab === "orders" && <OrdersTab />}
            {tab === "bookings" && <BookingsTab />}
            {tab === "users" && <UsersTab />}
            {tab === "subscribers" && <SubscribersTab />}
            {tab === "heroImages" && <HeroImagesTab />}
            {tab === "messages" && <MessagesTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Orders Tab ─── */
function OrdersTab() {
  const { data: orders } = trpc.order.list.useQuery();
  const utils = trpc.useUtils();
  const updateStatus = trpc.order.updateStatus.useMutation({
    onSuccess: () => utils.order.list.invalidate(),
  });

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div>
      <h2 className="text-xs uppercase tracking-widest font-medium mb-6">Orders</h2>
      {orders && orders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/5 text-left text-xs text-black/40 uppercase tracking-wider">
                <th className="pb-3 pr-4">#</th>
                <th className="pb-3 pr-4">Customer</th>
                <th className="pb-3 pr-4">Total</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-black/5">
                  <td className="py-3 pr-4">{order.id}</td>
                  <td className="py-3 pr-4">
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-xs text-black/40">{order.customerEmail}</p>
                  </td>
                  <td className="py-3 pr-4">{formatPrice(order.total)}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs uppercase px-2 py-1 ${
                      order.status === "paid" ? "bg-green-50 text-green-600" :
                      order.status === "pending" ? "bg-yellow-50 text-yellow-600" :
                      "bg-black/5"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-xs text-black/40">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateStatus.mutate({ id: order.id, status: e.target.value })
                      }
                      className="text-xs border border-black/10 px-2 py-1 outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-black/40">No orders yet</p>
      )}
    </div>
  );
}

/* ─── Bookings Tab ─── */
function BookingsTab() {
  const { data: bookings } = trpc.booking.list.useQuery();
  const utils = trpc.useUtils();
  const updateStatus = trpc.booking.updateStatus.useMutation({
    onSuccess: () => utils.booking.list.invalidate(),
  });
  const reschedule = trpc.booking.reschedule.useMutation({
    onSuccess: () => utils.booking.list.invalidate(),
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  return (
    <div>
      <h2 className="text-xs uppercase tracking-widest font-medium mb-6">Bookings</h2>
      {bookings && bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="border border-black/5 p-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium capitalize">
                      {booking.serviceType.replace(/-/g, " ")}
                    </p>
                    <span className={`text-xs uppercase px-2 py-0.5 ${
                      booking.status === "confirmed" ? "bg-green-50 text-green-600" :
                      booking.status === "pending" ? "bg-yellow-50 text-yellow-600" :
                      booking.status === "cancelled" ? "bg-red-50 text-red-600" :
                      "bg-blue-50 text-blue-600"
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-xs text-black/50">
                    {booking.customerName} &middot; {booking.customerEmail}
                  </p>
                  <p className="text-xs text-black/40 mt-1">
                    {booking.date} at {booking.time}
                    {booking.customerPhone && ` \u00b7 ${booking.customerPhone}`}
                  </p>
                  {booking.notes && (
                    <p className="text-xs text-black/30 mt-1 italic">{booking.notes}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 items-start">
                  {editingId === booking.id ? (
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="text-xs border border-black/10 px-2 py-1"
                      />
                      <input
                        type="time"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="text-xs border border-black/10 px-2 py-1"
                      />
                      <button
                        onClick={() => {
                          if (newDate && newTime) {
                            reschedule.mutate({ id: booking.id, date: newDate, time: newTime });
                            setEditingId(null);
                          }
                        }}
                        className="text-xs bg-black text-white px-3 py-1"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(booking.id);
                          setNewDate(booking.date);
                          setNewTime(booking.time);
                        }}
                        className="text-xs border border-black/10 px-3 py-1 hover:bg-black/5 transition-colors"
                      >
                        Reschedule
                      </button>
                      <select
                        value={booking.status}
                        onChange={(e) =>
                          updateStatus.mutate({ id: booking.id, status: e.target.value })
                        }
                        className="text-xs border border-black/10 px-2 py-1 outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-black/40">No bookings yet</p>
      )}
    </div>
  );
}

/* ─── Users Tab ─── */
function UsersTab() {
  const { data: allUsers } = trpc.user.list.useQuery();
  const utils = trpc.useUtils();
  const updateRole = trpc.user.updateRole.useMutation({
    onSuccess: () => utils.user.list.invalidate(),
  });
  const deleteUser = trpc.user.delete.useMutation({
    onSuccess: () => utils.user.list.invalidate(),
  });

  return (
    <div>
      <h2 className="text-xs uppercase tracking-widest font-medium mb-6">Users</h2>
      {allUsers && allUsers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/5 text-left text-xs text-black/40 uppercase tracking-wider">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 pr-4">Role</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((u) => (
                <tr key={`${u.userType}-${u.id}`} className="border-b border-black/5">
                  <td className="py-3 pr-4 font-medium">{u.name}</td>
                  <td className="py-3 pr-4 text-xs text-black/50">{u.email}</td>
                  <td className="py-3 pr-4">
                    <span className="text-xs uppercase px-2 py-0.5 bg-black/5">
                      {u.userType}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs uppercase px-2 py-0.5 ${
                      u.role === "admin" ? "bg-black text-white" : "bg-black/5"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          updateRole.mutate({
                            id: u.id,
                            userType: u.userType,
                            role: u.role === "admin" ? "user" : "admin",
                          })
                        }
                        className="text-xs flex items-center gap-1 border border-black/10 px-2 py-1 hover:bg-black/5"
                      >
                        <Shield className="w-3 h-3" />
                        {u.role === "admin" ? "Demote" : "Promote"}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Delete this user?")) {
                            deleteUser.mutate({ id: u.id, userType: u.userType });
                          }
                        }}
                        className="text-xs flex items-center gap-1 border border-red-100 text-red-500 px-2 py-1 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-black/40">No users found</p>
      )}
    </div>
  );
}

/* ─── Subscribers Tab ─── */
function SubscribersTab() {
  const { data: subs } = trpc.subscriber.list.useQuery();
  const utils = trpc.useUtils();
  const deleteSub = trpc.subscriber.delete.useMutation({
    onSuccess: () => utils.subscriber.list.invalidate(),
  });

  return (
    <div>
      <h2 className="text-xs uppercase tracking-widest font-medium mb-6">
        Newsletter Subscribers ({subs?.length || 0})
      </h2>
      {subs && subs.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/5 text-left text-xs text-black/40 uppercase tracking-wider">
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Subscribed</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((sub) => (
                <tr key={sub.id} className="border-b border-black/5">
                  <td className="py-3 pr-4">{sub.email}</td>
                  <td className="py-3 pr-4 text-xs text-black/40">
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => {
                        if (confirm("Remove this subscriber?")) {
                          deleteSub.mutate({ id: sub.id });
                        }
                      }}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-black/40">No subscribers yet</p>
      )}
    </div>
  );
}

/* ─── Hero Images Tab ─── */
function HeroImagesTab() {
  const { data: images } = trpc.heroImage.listAll.useQuery();
  const utils = trpc.useUtils();
  const create = trpc.heroImage.create.useMutation({
    onSuccess: () => {
      utils.heroImage.listAll.invalidate();
      setNewUrl("");
      setNewAlt("");
    },
  });
  const update = trpc.heroImage.update.useMutation({
    onSuccess: () => utils.heroImage.listAll.invalidate(),
  });
  const deleteImg = trpc.heroImage.delete.useMutation({
    onSuccess: () => utils.heroImage.listAll.invalidate(),
  });

  const [newUrl, setNewUrl] = useState("");
  const [newAlt, setNewAlt] = useState("");

  return (
    <div>
      <h2 className="text-xs uppercase tracking-widest font-medium mb-6">Hero Images</h2>

      {/* Add New */}
      <div className="flex gap-2 mb-8 p-4 bg-[#f6f6f6]">
        <input
          type="text"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="Image URL"
          className="flex-1 bg-white border border-black/10 px-3 py-2 text-sm outline-none"
        />
        <input
          type="text"
          value={newAlt}
          onChange={(e) => setNewAlt(e.target.value)}
          placeholder="Alt text"
          className="w-40 bg-white border border-black/10 px-3 py-2 text-sm outline-none"
        />
        <button
          onClick={() => {
            if (newUrl) create.mutate({ url: newUrl, alt: newAlt || undefined });
          }}
          className="bg-black text-white px-4 py-2 text-xs uppercase tracking-widest"
        >
          Add
        </button>
      </div>

      {/* Image Grid */}
      {images && images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="relative group">
              <div className="aspect-[3/4] bg-[#f6f6f6] overflow-hidden">
                <img
                  src={img.url}
                  alt={img.alt || ""}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() =>
                    update.mutate({
                      id: img.id,
                      active: !img.active,
                    })
                  }
                  className={`w-7 h-7 flex items-center justify-center text-xs ${
                    img.active ? "bg-green-500 text-white" : "bg-black/50 text-white"
                  }`}
                >
                  {img.active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this image?")) {
                      deleteImg.mutate({ id: img.id });
                    }
                  }}
                  className="w-7 h-7 bg-red-500 text-white flex items-center justify-center"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-black/40 mt-1 truncate">{img.alt}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-black/40">No hero images</p>
      )}
    </div>
  );
}

/* ─── Messages Tab ─── */
function MessagesTab() {
  const { data: messages } = trpc.contact.list.useQuery();
  const utils = trpc.useUtils();
  const markRead = trpc.contact.markRead.useMutation({
    onSuccess: () => utils.contact.list.invalidate(),
  });

  return (
    <div>
      <h2 className="text-xs uppercase tracking-widest font-medium mb-6">Contact Messages</h2>
      {messages && messages.length > 0 ? (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`border p-4 ${msg.read ? "border-black/5 bg-white" : "border-black/10 bg-[#fafafa]"}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-medium">{msg.name}</p>
                  <p className="text-xs text-black/40">{msg.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-black/30">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                  {!msg.read && (
                    <button
                      onClick={() => markRead.mutate({ id: msg.id })}
                      className="text-xs bg-black text-white px-2 py-0.5"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
              {msg.subject && (
                <p className="text-xs font-medium mb-1">{msg.subject}</p>
              )}
              <p className="text-sm text-black/60">{msg.message}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-black/40">No messages</p>
      )}
    </div>
  );
}
