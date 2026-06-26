import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation, Redirect } from 'wouter';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

import Login from '@/pages/login';
import UserDashboard from '@/pages/user-dashboard';
import AdminDashboard from '@/pages/admin-dashboard';

const queryClient = new QueryClient();

function Layout({ children }: { children: React.ReactNode }) {
  const { logout, email, role } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary w-8 h-8 rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">P</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">JRPrestamos</span>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-muted text-xs font-medium text-muted-foreground border">
              {role === 'ROLE_ADMIN' ? 'Admin' : 'Usuario'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium hidden sm:inline-block text-muted-foreground">
              {email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

// Named components for each route — fixes React hooks ordering issue
function RootRoute() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Redirect to="/login" />;
  return <Redirect to={role === 'ROLE_ADMIN' ? '/admin' : '/user'} />;
}

function LoginRoute() {
  const { isAuthenticated, role } = useAuth();
  if (isAuthenticated) {
    return <Redirect to={role === 'ROLE_ADMIN' ? '/admin' : '/user'} />;
  }
  return <Login />;
}

function UserRoute() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Redirect to="/login" />;
  if (role !== 'ROLE_USER') return <Redirect to="/admin" />;
  return (
    <Layout>
      <UserDashboard />
    </Layout>
  );
}

function AdminRoute() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Redirect to="/login" />;
  if (role !== 'ROLE_ADMIN') return <Redirect to="/user" />;
  return (
    <Layout>
      <AdminDashboard />
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRoute} />
      <Route path="/login" component={LoginRoute} />
      <Route path="/user" component={UserRoute} />
      <Route path="/admin" component={AdminRoute} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
