import { useState } from "react";
import { ThemeProvider } from "@/components/lumen/ThemeProvider";
import { TopBar } from "@/components/lumen/TopBar";
import { BottomNav, type Tab } from "@/components/lumen/BottomNav";
import { HomeScreen } from "@/components/lumen/HomeScreen";
import { ServicesScreen } from "@/components/lumen/ServicesScreen";
import { BookingScreen } from "@/components/lumen/BookingScreen";
import { BookingsScreen } from "@/components/lumen/BookingsScreen";
import { AccountScreen } from "@/components/lumen/AccountScreen";

const Index = () => {
  const [tab, setTab] = useState<Tab>("home");
  const [booking, setBooking] = useState(false);

  const goBook = () => setBooking(true);

  return (
    <ThemeProvider>
      <div dir="rtl" className="min-h-screen relative md:py-6 lg:py-0">
        {/*
          Mobile: full bleed.
          Tablet (md): centered phone-like frame for preview.
          Desktop (lg+): fluid layout, no frame, top nav.
        */}
        <main className="mx-auto w-full max-w-md min-h-screen relative
                         md:min-h-[min(900px,calc(100vh-3rem))] md:max-w-[420px]
                         md:rounded-[44px] md:border md:border-hairline md:shadow-pop
                         md:overflow-hidden md:bg-background
                         lg:max-w-[1280px] lg:min-h-screen lg:rounded-none lg:border-0 lg:shadow-none lg:overflow-visible">
          {!booking && (
            <TopBar
              activeTab={tab}
              onTabChange={setTab}
            />
          )}

          <div key={booking ? "book" : tab} className="animate-rise">
            {booking ? (
              <BookingScreen onBack={() => setBooking(false)} />
            ) : tab === "home" ? (
              <HomeScreen onBook={goBook} onServices={() => setTab("services")} />
            ) : tab === "services" ? (
              <ServicesScreen onBook={goBook} />
            ) : tab === "bookings" ? (
              <BookingsScreen />
            ) : (
              <AccountScreen />
            )}
          </div>

          {!booking && <BottomNav active={tab} onChange={setTab} />}
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Index;
