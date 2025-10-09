import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { BarChart3, Database, Calculator, ArrowRight } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">DataHub</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="gradient-subtle py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="mb-6 text-5xl font-bold">
              Enterprise Data Management Platform
            </h1>
            <p className="mb-8 text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful analytics, smart calculations, and secure data repository - all in one place
            </p>
            <Link to="/register">
              <Button size="lg" className="gap-2">
                Start Your Journey <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Key Features</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-lg border p-6 text-center hover:shadow-lg transition-shadow">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                  <BarChart3 className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Power BI Analysis</h3>
                <p className="text-muted-foreground">
                  View and analyze embedded Power BI dashboards with real-time data
                </p>
              </div>

              <div className="rounded-lg border p-6 text-center hover:shadow-lg transition-shadow">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                  <Calculator className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Unit Estimator</h3>
                <p className="text-muted-foreground">
                  Calculate unit goods requirements with intelligent estimation tools
                </p>
              </div>

              <div className="rounded-lg border p-6 text-center hover:shadow-lg transition-shadow">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-success">
                  <Database className="h-6 w-6 text-success-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Data Repository</h3>
                <p className="text-muted-foreground">
                  Secure file storage with review and approval workflows
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="gradient-subtle py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-4 text-3xl font-bold">Ready to get started?</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join our platform and streamline your data management today
            </p>
            <Link to="/register">
              <Button size="lg" variant="default">
                Create Account
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 DataHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
