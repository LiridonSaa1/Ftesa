import { useEffect, useRef } from "react";
import { Landing } from "./pages/Landing";
import { ClerkProvider, SignIn, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
// light theme — no dark import needed
import { Switch, Route, Redirect, useLocation, Router as WouterRouter } from 'wouter';

import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppRouter } from "./AppRouter";
import { LanguageProvider } from "./lib/i18n";

const queryClient = new QueryClient();

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const clerkMissing = !import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";

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
    footerActionLink: "hidden",
    footerActionText: "hidden",
    footerAction: "hidden",
    footer: "hidden",
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
        signUpUrl={`${basePath}/sign-in`}
        appearance={{
          ...clerkAppearance,
          elements: {
            ...clerkAppearance.elements,
            footerAction: "hidden",       // fsheh "Nuk keni llogari? Regjistrohuni"
            footerActionText: "hidden",
            footerActionLink: "hidden",
            footer: "hidden",
          },
        }}
      />
    </div>
  );
}

export function SignUpPage() {
  return <Redirect to="/sign-in" />;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-in`}
      localization={{
        signIn: { start: { title: "Mirë se kthyet", subtitle: "Hyni në llogarinë tuaj" } },
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

function App() {
  return (
    <LanguageProvider>
      <WouterRouter base={basePath}>
        {clerkMissing ? (
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <AppRouter />
              <Toaster />
            </TooltipProvider>
          </QueryClientProvider>
        ) : (
          <ClerkProviderWithRoutes />
        )}
      </WouterRouter>
    </LanguageProvider>
  );
}


export default App;
