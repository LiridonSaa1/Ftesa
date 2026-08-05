import { useEffect, useRef } from "react";
import { Landing } from "./pages/Landing";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { Switch, Route, useLocation, Router as WouterRouter } from 'wouter';

import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppRouter } from "./AppRouter";

const queryClient = new QueryClient();

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

// Only activate Clerk when an explicit publishable key is provided.
// publishableKeyFromHost can derive a key from the Replit hostname even without
// the env var, which causes Clerk to attempt — and fail — to load its JS bundle.
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

// Build appearance object matching the luxury gold/white/beige theme
const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#C9A96E",       // gold
    colorForeground: "#1a1a1a",
    colorMutedForeground: "#6b6b6b",
    colorDanger: "#e53e3e",
    colorBackground: "#FEFAF5",    // warm cream
    colorInput: "#ffffff",
    colorInputForeground: "#1a1a1a",
    colorNeutral: "#d4c5a9",
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#FEFAF5] rounded-2xl w-[440px] max-w-full overflow-hidden shadow-2xl border border-[#d4c5a9]",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-[#1a1a1a] font-serif",
    headerSubtitle: "text-[#6b6b6b]",
    socialButtonsBlockButtonText: "text-[#1a1a1a]",
    formFieldLabel: "text-[#1a1a1a]",
    footerActionLink: "text-[#C9A96E] hover:text-[#b8934d]",
    footerActionText: "text-[#6b6b6b]",
    dividerText: "text-[#6b6b6b]",
    identityPreviewEditButton: "text-[#C9A96E]",
    formFieldSuccessText: "text-green-600",
    alertText: "text-[#1a1a1a]",
    logoBox: "mb-2 flex justify-center w-full",
    logoImage: "h-16 w-auto",
    socialButtonsBlockButton: "border border-[#d4c5a9] hover:border-[#C9A96E]",
    formButtonPrimary: "bg-[#C9A96E] hover:bg-[#b8934d] text-white",
    formFieldInput: "border-[#d4c5a9] focus:border-[#C9A96E] bg-white text-[#1a1a1a]",
    footerAction: "bg-transparent",
    dividerLine: "bg-[#d4c5a9]",
    alert: "bg-red-50",
    otpCodeFieldInput: "border-[#d4c5a9]",
    formFieldRow: "",
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
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-[#FEFAF5] to-[#F5EDD9] px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

export function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-[#FEFAF5] to-[#F5EDD9] px-4">
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
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-[#FEFAF5] to-[#F5EDD9] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#d4c5a9] bg-[#FEFAF5] p-8 shadow-2xl text-center space-y-4">
        <div className="inline-flex rounded-xl bg-primary/10 p-3 mb-2">
          <svg className="h-7 w-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">{title}</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">{subtitle}</p>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Autentifikimi kërkon konfigurimin e <strong>Clerk</strong>.<br />
          Shtoni <code className="rounded bg-amber-100 px-1 font-mono text-xs">VITE_CLERK_PUBLISHABLE_KEY</code> në secrets.
        </div>
        <a href={basePath || "/"} className="block mt-2 text-sm text-primary hover:underline">← Kthehu në faqen kryesore</a>
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
