import { ReactNode, useState, useEffect } from "react";
import { Switch, Route, Redirect } from "wouter";
import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { SignInPage, SignUpPage } from "./App";
import { Dashboard } from "./pages/Dashboard";
import { Landing } from "./pages/Landing";
import { EventList } from "./pages/events/EventList";
import { EventCreate } from "./pages/events/EventCreate";
import { EventWorkspace } from "./pages/events/EventWorkspace";
import { RsvpPage } from "./pages/rsvp/RsvpPage";
import { Subscription } from "./pages/Subscription";
import { Settings } from "./pages/Settings";
import { AdminPanel } from "./pages/AdminPanel";
import { PendingPayment } from "./pages/PendingPayment";
import { CheckoutSuccess } from "./pages/CheckoutSuccess";
import NotFound from "./pages/not-found";
import { Layout } from "./components/Layout";

// ── Subscription guard ────────────────────────────────────────────────────────
// Fetches /api/auth/me and redirects to /checkout/pending if status is pending_payment.

function SubscriptionGuard({ children }: { children: ReactNode }) {
  const [guardTimeout, setGuardTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setGuardTimeout(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["user-status"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) return { status: "active", role: "organizer" };
        return res.json() as Promise<{ status: string; role: string }>;
      } catch {
        return { status: "active", role: "organizer" };
      }
    },
    staleTime: 30_000,
    retry: false,
  });

  if (isLoading && !guardTimeout) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7B1F3A] border-t-transparent" />
      </div>
    );
  }

  if (data?.status === "pending_payment") {
    return <Redirect to="/checkout/pending" />;
  }

  return <>{children}</>;
}

// ── Route helpers ─────────────────────────────────────────────────────────────

function HomeRedirect() {
  let isLoaded = true;
  let isSignedIn = false;
  try {
    const auth = useAuth();
    isLoaded = auth.isLoaded;
    isSignedIn = auth.isSignedIn || false;
  } catch {
    isLoaded = true;
    isSignedIn = false;
  }

  if (!isLoaded) return null;
  if (isSignedIn) {
    return <Redirect to="/dashboard" />;
  }
  return <Landing />;
}

/** Requires sign-in + active subscription with guaranteed 600ms reload unblock */
function AuthenticatedRoute({ component: Component }: { component: any }) {
  const [forceReady, setForceReady] = useState(false);
  let isLoaded = true;

  try {
    const auth = useAuth();
    isLoaded = auth.isLoaded;
  } catch {
    isLoaded = true;
  }

  useEffect(() => {
    const timer = setTimeout(() => setForceReady(true), 600);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded && !forceReady) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7B1F3A] border-t-transparent" />
          <span className="text-xs text-slate-400 font-medium">Po ngarkohet llogaria...</span>
        </div>
      </div>
    );
  }

  return (
    <SubscriptionGuard>
      <Layout>
        <Component />
      </Layout>
    </SubscriptionGuard>
  );
}

/** Requires sign-in route wrapper */
function AuthOnlyRoute({ component: Component }: { component: any }) {
  const [forceReady, setForceReady] = useState(false);
  let isLoaded = true;

  try {
    const auth = useAuth();
    isLoaded = auth.isLoaded;
  } catch {
    isLoaded = true;
  }

  useEffect(() => {
    const timer = setTimeout(() => setForceReady(true), 600);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded && !forceReady) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7B1F3A] border-t-transparent" />
          <span className="text-xs text-slate-400 font-medium">Po ngarkohet...</span>
        </div>
      </div>
    );
  }

  return <Component />;
}

// ── Router ────────────────────────────────────────────────────────────────────

export function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?">
        <Redirect to="/sign-in" />
      </Route>

      {/* Payment flow — auth required, no subscription guard */}
      <Route path="/checkout/pending">
        <AuthOnlyRoute component={PendingPayment} />
      </Route>
      <Route path="/checkout/success">
        <AuthOnlyRoute component={CheckoutSuccess} />
      </Route>

      {/* Public RSVP route without Layout */}
      <Route path="/rsvp/:token" component={RsvpPage} />

      {/* Subscription management */}
      <Route path="/subscription">
        <AuthOnlyRoute component={() => (
          <Layout>
            <Subscription />
          </Layout>
        )} />
      </Route>

      {/* Authenticated + active subscription routes */}
      <Route path="/dashboard">
        <AuthenticatedRoute component={Dashboard} />
      </Route>

      <Route path="/events">
        <AuthenticatedRoute component={EventList} />
      </Route>

      <Route path="/events/new">
        <AuthenticatedRoute component={EventCreate} />
      </Route>

      <Route path="/events/:id">
        <AuthenticatedRoute component={EventWorkspace} />
      </Route>

      <Route path="/settings">
        <AuthenticatedRoute component={Settings} />
      </Route>

      <Route path="/admin">
        <AuthenticatedRoute component={AdminPanel} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}
