import { useEffect, useRef } from "react";
import { Landing } from "./pages/Landing";
import { ClerkProvider, SignIn, SignUp, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { dark } from '@clerk/themes';
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

// Build appearance object matching the Wedding Reval dark theme
const clerkAppearance = {
  baseTheme: dark,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
  },
  variables: {
    colorPrimary: "#C94B6E",       // Rose
    colorForeground: "#e9e4e1",
    colorMutedForeground: "#998b92",
    colorDanger: "#ef4444",
    colorBackground: "#171215",    // Dark plum
    colorInputBackground: "#1e171b",
    colorInputText: "#e9e4e1",
    fontFamily: "'Inter', sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#171215] rounded-2xl w-[440px] max-w-full overflow-hidden shadow-2xl border border-white/5",
    headerTitle: "text-[#e9e4e1] font-serif text-2xl font-normal",
    headerSubtitle: "text-[#998b92]",
    socialButtonsBlockButtonText: "text-[#e9e4e1] font-medium",
    formFieldLabel: "text-[#e9e4e1]",
    footerActionLink: "text-[#C94B6E] hover:text-[#D4607B]",
    footerActionText: "text-[#998b92]",
    dividerText: "text-[#998b92]",
    formFieldInput: "border-white/10 focus:border-[#C94B6E] bg-[#1e171b] text-[#e9e4e1]",
    formButtonPrimary: "bg-[#C94B6E] hover:bg-[#D4607B] text-white font-semibold",
    socialButtonsBlockButton: "border-white/10 hover:border-white/20 bg-[#1e171b]",
    dividerLine: "bg-white/10",
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
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#171215] px-4 dark">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

export function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#171215] px-4 dark">
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
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#171215] px-4 dark text-foreground">
      <div className="w-full max-w-sm rounded-2xl border border-white/5 bg-[#1a1418] p-8 shadow-2xl text-center space-y-4">
        <div className="inline-flex rounded-xl bg-[#C94B6E]/10 p-3 mb-2">
          <svg className="h-7 w-7 text-[#C94B6E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">{title}</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">{subtitle}</p>
        <div className="rounded-xl border border-[#C94B6E]/20 bg-[#C94B6E]/5 px-4 py-3 text-sm text-[#e9e4e1]">
          Autentifikimi kërkon konfigurimin e <strong>Clerk</strong>.<br />
          Shtoni <code className="rounded bg-[#C94B6E]/20 px-1 font-mono text-xs">VITE_CLERK_PUBLISHABLE_KEY</code> në secrets.
        </div>
        <a href={basePath || "/"} className="block mt-2 text-sm text-[#C94B6E] hover:underline">← Kthehu në faqen kryesore</a>
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
