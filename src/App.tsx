import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider, useCart } from './context/CartContext.tsx';
import { Header } from './components/Header.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { StudentHome } from './views/student/StudentHome.tsx';
import { CanteenDetailView } from './views/student/CanteenDetailView.tsx';
import { CartDrawer } from './views/student/CartDrawer.tsx';
import { OrderTrackingView } from './views/student/OrderTrackingView.tsx';
import { StudentOrdersList } from './views/student/StudentOrdersList.tsx';
import { StudentProfileView } from './views/student/StudentProfileView.tsx';
import { VendorDashboardView } from './views/vendor/VendorDashboardView.tsx';
import { AgentDashboardView } from './views/agent/AgentDashboardView.tsx';
import { AdminDashboardView } from './views/admin/AdminDashboardView.tsx';
import { CustomizationModal } from './components/CustomizationModal.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { AIOrderAssistantModal } from './components/AIOrderAssistantModal.tsx';
import { AISupportModal } from './components/AISupportModal.tsx';
import { AIReviewSummaryModal } from './components/AIReviewSummaryModal.tsx';
import { NotificationsModal } from './components/NotificationsModal.tsx';
import { WalletModal } from './components/WalletModal.tsx';
import { CampusLocationModal } from './components/CampusLocationModal.tsx';
import { OrderInvoiceModal } from './components/OrderInvoiceModal.tsx';
import { RateOrderModal } from './components/RateOrderModal.tsx';
import { AuthModal } from './views/auth/AuthModal.tsx';
import { Canteen, MenuItem, Order, Address } from './types/index.ts';
import { api } from './services/api.ts';

const AppContent: React.FC = () => {
  const { user, role, loading } = useAuth();
  const { selectedAddress, setSelectedAddress } = useCart();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<string>('explore');

  // Student specific navigation states
  const [selectedCanteen, setSelectedCanteen] = useState<Canteen | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isReviewSummaryOpen, setIsReviewSummaryOpen] = useState(false);
  const [reviewCanteen, setReviewCanteen] = useState<Canteen | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [isRateOpen, setIsRateOpen] = useState(false);
  const [rateOrder, setRateOrder] = useState<Order | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Item customization modal state
  const [customizingItem, setCustomizingItem] = useState<{
    item: MenuItem;
    canteenName: string;
  } | null>(null);

  const [addresses, setAddresses] = useState<Address[]>([]);

  // Fetch addresses for location modal
  React.useEffect(() => {
    if (user) {
      api.getAddresses().then((res) => {
        setAddresses(res.addresses);
        if (!selectedAddress && res.addresses.length > 0) {
          setSelectedAddress(res.addresses[0]);
        }
      }).catch(() => {});
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-bold text-slate-600">Connecting to CampusBites Network...</p>
      </div>
    );
  }

  // Handle address addition
  const handleAddNewAddress = async (newAddr: Partial<Address>) => {
    try {
      const res = await api.addAddress(newAddr);
      setAddresses((prev) => [...prev, res.address]);
      setSelectedAddress(res.address);
    } catch (e) {
      console.error('Failed to add address:', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenNotifications={() => setIsNotifOpen(true)}
        onOpenWalletModal={() => setIsWalletOpen(true)}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        currentLocationLabel={selectedAddress ? `${selectedAddress.label} (${selectedAddress.block})` : 'Select Location'}
      />

      {/* Main Role-Based Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-4 pb-20">
        {!user ? (
          <div className="py-20 text-center max-w-sm mx-auto space-y-4">
            <h2 className="text-xl font-black">Welcome to CampusBites</h2>
            <p className="text-xs text-slate-500">
              Sign in with your student or campus email to start ordering.
            </p>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="w-full py-3 bg-emerald-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/20"
            >
              Sign In or Register
            </button>
          </div>
        ) : role === 'student' ? (
          /* Student Flow */
          <>
            {activeTab === 'explore' && !selectedCanteen && (
              <StudentHome
                onSelectCanteen={(canteen) => setSelectedCanteen(canteen)}
                onOpenAIAssistant={() => setIsAssistantOpen(true)}
                onOpenAISupport={() => setIsSupportOpen(true)}
                onOpenReviewSummary={(canteen) => {
                  setReviewCanteen(canteen);
                  setIsReviewSummaryOpen(true);
                }}
                onOpenItemCustomization={(item, canteenName) => {
                  setCustomizingItem({ item, canteenName });
                }}
              />
            )}

            {activeTab === 'explore' && selectedCanteen && (
              <CanteenDetailView
                canteen={selectedCanteen}
                onBack={() => setSelectedCanteen(null)}
                onOpenItemCustomization={(item, canteenName) => {
                  setCustomizingItem({ item, canteenName });
                }}
                onOpenReviewSummary={(c) => {
                  setReviewCanteen(c);
                  setIsReviewSummaryOpen(true);
                }}
                onOpenCart={() => setIsCartOpen(true)}
              />
            )}

            {activeTab === 'orders' && !selectedOrder && (
              <StudentOrdersList
                onSelectOrder={(order) => setSelectedOrder(order)}
                onOpenInvoice={(order) => {
                  setInvoiceOrder(order);
                  setIsInvoiceOpen(true);
                }}
                onOpenRate={(order) => {
                  setRateOrder(order);
                  setIsRateOpen(true);
                }}
                onExplore={() => {
                  setActiveTab('explore');
                  setSelectedCanteen(null);
                }}
              />
            )}

            {activeTab === 'orders' && selectedOrder && (
              <OrderTrackingView
                orderId={selectedOrder.id}
                onBack={() => setSelectedOrder(null)}
                onOpenInvoice={(order) => {
                  setInvoiceOrder(order);
                  setIsInvoiceOpen(true);
                }}
                onOpenRate={(order) => {
                  setRateOrder(order);
                  setIsRateOpen(true);
                }}
                onOpenSupport={() => setIsSupportOpen(true)}
              />
            )}

            {activeTab === 'profile' && (
              <StudentProfileView
                onOpenWallet={() => setIsWalletOpen(true)}
                onOpenLocationModal={() => setIsLocationModalOpen(true)}
              />
            )}
          </>
        ) : role === 'canteen' ? (
          /* Canteen / Vendor Flow */
          <VendorDashboardView />
        ) : role === 'agent' ? (
          /* Delivery Agent Flow */
          <AgentDashboardView />
        ) : role === 'admin' ? (
          /* College Admin Flow */
          <AdminDashboardView />
        ) : null}
      </main>

      {/* Role-Adaptive Bottom Navigation */}
      {user && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab === 'explore') setSelectedCanteen(null);
            if (tab === 'orders') setSelectedOrder(null);
          }}
          onOpenCart={() => setIsCartOpen(true)}
        />
      )}

      {/* Floating Support Concierge Button */}
      {user && role === 'student' && (
        <button
          onClick={() => setIsSupportOpen(true)}
          className="fixed bottom-20 right-4 z-30 p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 text-xs font-bold transition-all hover:scale-105"
          title="Ask CampusBot AI"
        >
          <span className="text-sm">🤖</span>
          <span className="hidden sm:inline">Ask CampusBot</span>
        </button>
      )}

      {/* MODALS */}
      {/* 1. Item Customization Modal */}
      {customizingItem && (
        <CustomizationModal
          item={customizingItem.item}
          canteenName={customizingItem.canteenName}
          isOpen={Boolean(customizingItem)}
          onClose={() => setCustomizingItem(null)}
          onAddToCart={() => {
            setCustomizingItem(null);
            setIsCartOpen(true);
          }}
        />
      )}

      {/* 2. Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
      />

      {/* 3. Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderPlaced={(order) => {
          setSelectedOrder(order);
          setActiveTab('orders');
        }}
      />

      {/* 4. AI Order Assistant Modal */}
      <AIOrderAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        canteensMenu={[]}
      />

      {/* 5. AI Support Modal */}
      <AISupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />

      {/* 6. AI Review Summary Modal */}
      <AIReviewSummaryModal
        canteen={reviewCanteen}
        isOpen={isReviewSummaryOpen}
        onClose={() => {
          setIsReviewSummaryOpen(false);
          setReviewCanteen(null);
        }}
      />

      {/* 7. Notifications Modal */}
      <NotificationsModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        onSelectOrder={(orderId) => {
          api.getOrder(orderId).then((res) => {
            setSelectedOrder(res.order);
            setActiveTab('orders');
          }).catch(() => {});
        }}
      />

      {/* 8. Campus Wallet Modal */}
      <WalletModal isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} />

      {/* 9. Campus Location Selector Modal */}
      <CampusLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        addresses={addresses}
        currentAddress={selectedAddress}
        onSelectAddress={(addr) => setSelectedAddress(addr)}
        onAddNewAddress={handleAddNewAddress}
      />

      {/* 10. Tax Invoice Modal */}
      <OrderInvoiceModal
        order={invoiceOrder}
        isOpen={isInvoiceOpen}
        onClose={() => {
          setIsInvoiceOpen(false);
          setInvoiceOrder(null);
        }}
      />

      {/* 11. Rate & Review Modal */}
      <RateOrderModal
        order={rateOrder}
        isOpen={isRateOpen}
        onClose={() => {
          setIsRateOpen(false);
          setRateOrder(null);
        }}
        onReviewed={() => {}}
      />

      {/* 12. Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
