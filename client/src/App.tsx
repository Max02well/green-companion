import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Navigation from "@/components/navigation";
import Dashboard from "@/pages/dashboard";
import AddPlant from "@/pages/add-plant";
import EditPlant from "@/pages/edit-plant";
import PlantDetails from "@/pages/plant-details";
import CareGuide from "@/pages/care-guide";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-6">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/add" component={AddPlant} />
          <Route path="/edit/:id" component={EditPlant} />
          <Route path="/plant/:id" component={PlantDetails} />
          <Route path="/guide/:species" component={CareGuide} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
