import { useEffect, useRef } from "react";
import { Landing } from "./pages/Landing";
import { ClerkProvider, SignIn, SignUp, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
// light theme — no dark import needed
import { Switch, Route, useLocation, Router as WouterRouter } from 'wouter';

import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppRouter } from "./AppRouter";

const queryClient = new QueryClient();

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

// Only activate Clerk when an explicit publishable key is provided.
const clerkMissing = !import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkPubKey = clerkMissing
  ? ""
  : publishableKeyFromHost(
      window.location.hostname,
      import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
    );

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || "/" : path;
}

// Clerk appearance — light theme
const clerkAppearance = {
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
  },
  variables: {
    colorPrimary: "#7B1F3A",
    colorForeground: "#1a1a1a",
    colorMutedForeground: "#6b6b6b",
    colorDanger: "#ef4444",
    colorBackground: "#ffffff",
    colorInputBackground: "#f9f7f5",
    colorInputText: "#1a1a1a",
    fontFamily: "'Inter', sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl border border-gray-100",
    headerTitle: "font-serif text-2xl font-semibold text-gray-900",
    headerSubtitle: "text-gray-500",
    formFieldLabel: "text-gray-700 font-medium",
    formFieldInput: "border-gray-200 focus:border-[#7B1F3A] bg-[#f9f7f5] text-gray-900",
    formButtonPrimary: "bg-[#7B1F3A] hover:bg-[#6a1a32] text-white font-medium transition-all",
    socialButtonsBlockButton: "border-gray-200 hover:bg-gray-50 bg-white text-gray-700 transition-all",
    socialButtonsBlockButtonText: "text-gray-700 font-medium",
    dividerLine: "bg-gray-200",
    dividerText: "text-gray-400",
    footerActionLink: "text-[#7B1F3A] hover:text-[#6a1a32] transition-colors",
    footerActionText: "text-gray-500",
    main: "px-6 py-4",
  },
};

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const unsub = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) qc.clear();
      prevUserIdRef.current = userId;
    });
    return unsub;
  }, [addListener, qc]);
  return null;
}

export function SignInPage() {
  return (
    <div style={{ minHeight: "100dvh", background: "#FAF8F5", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" }}>
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        appearance={{
          ...clerkAppearance,
          elements: {
            ...clerkAppearance.elements,
            footerAction: "hidden",       // fsheh "Nuk keni llogari? Regjistrohuni"
            footer: "hidden",
          },
        }}
      />
    </div>
  );
}

export function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 dark">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: { start: { title: "Mirë se kthyet", subtitle: "Hyni në llogarinë tuaj" } },
        signUp: { start: { title: "Krijoni llogarinë tuaj", subtitle: "Filloni sot falas" } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ClerkQueryClientCacheInvalidator />
          <AppRouter />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function DemoAuthPage({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 dark text-foreground">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-card/60 backdrop-blur-xl p-8 shadow-2xl text-center space-y-4">
        <div className="inline-flex rounded-xl bg-primary/20 p-3 mb-2 shadow-[0_0_20px_rgba(217,56,94,0.3)]">
          <svg className="h-7 w-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">{title}</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">{subtitle}</p>
        <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground backdrop-blur-sm">
          Autentifikimi kërkon konfigurimin e <strong>Clerk</strong>.<br />
          Shtoni <code className="rounded bg-primary/20 px-1 font-mono text-xs">VITE_CLERK_PUBLISHABLE_KEY</code> në secrets.
        </div>
        <a href={basePath || "/"} className="block mt-2 text-sm text-primary hover:text-primary/80 transition-colors">← Kthehu në faqen kryesore</a>
      </div>
    </div>
  );
}

function App() {
  if (clerkMissing) {
    // No Clerk key configured — show Landing + informational auth pages in demo mode
    return (
      <WouterRouter base={basePath}>
        <Switch>
          <Route path="/sign-in">
            <DemoAuthPage title="Hyrja në llogari" subtitle="Kyçuni me emailin dhe fjalëkalimin tuaj." />
          </Route>
          <Route path="/sign-up">
            <DemoAuthPage title="Krijoni llogarinë" subtitle="Filloni falas sot dhe menaxhoni eventin tuaj." />
          </Route>
          <Route>
            <Landing />
          </Route>
        </Switch>
      </WouterRouter>
    );
  }
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
