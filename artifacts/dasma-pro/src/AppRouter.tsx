import { Switch, Route, Redirect } from "wouter";
import { Show } from "@clerk/react";
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
import NotFound from "./pages/not-found";
import { Layout } from "./components/Layout";

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

function AuthenticatedRoute({ component: Component }: { component: any }) {
  return (
    <>
      <Show when="signed-in">
        <Layout>
          <Component />
        </Layout>
      </Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  );
}

export function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      
      {/* Public RSVP route without Layout */}
      <Route path="/rsvp/:token" component={RsvpPage} />
      
      {/* Authenticated routes wrapped in Layout */}
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
      
      <Route path="/subscription">
        <AuthenticatedRoute component={Subscription} />
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
