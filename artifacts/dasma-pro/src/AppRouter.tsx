import { ReactNode } from "react";
import { Switch, Route, Redirect } from "wouter";
import { Show } from "@clerk/react";
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
  const { data, isLoading } = useQuery({
    queryKey: ["user-status"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch user status");
      return res.json() as Promise<{ status: string; role: string }>;
    },
    staleTime: 30_000,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background dark">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
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
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <Landing />
      </Show>
    </>
  );
}

/** Requires Clerk sign-in + active subscription */
function AuthenticatedRoute({ component: Component }: { component: any }) {
  return (
    <>
      <Show when="signed-in">
        <SubscriptionGuard>
          <Layout>
            <Component />
          </Layout>
        </SubscriptionGuard>
      </Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  );
}

/** Requires Clerk sign-in but NO subscription guard (payment flow routes) */
function AuthOnlyRoute({ component: Component }: { component: any }) {
  return (
    <>
      <Show when="signed-in">
        <Component />
      </Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  );
}

// ── Router ────────────────────────────────────────────────────────────────────

export function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />

      {/* Payment flow — auth required, no subscription guard */}
      <Route path="/checkout/pending">
        <AuthOnlyRoute component={PendingPayment} />
      </Route>
      <Route path="/checkout/success">
        <AuthOnlyRoute component={CheckoutSuccess} />
      </Route>

      {/* Public RSVP route without Layout */}
      <Route path="/rsvp/:token" component={RsvpPage} />

      {/* Subscription management — auth required, no subscription guard
          (so pending_payment users can pay) */}
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
