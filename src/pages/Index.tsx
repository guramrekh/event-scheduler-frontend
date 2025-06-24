import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center py-2 pt-8">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.jpg" alt="Logo" className="h-10 w-10" />
          <span className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Huddle</span>
        </Link>
        <nav className="ml-auto flex items-center gap-2 sm:gap-3">
          <Button asChild size="lg" className="bg-black text-white hover:bg-zinc-800">
            <Link to="/login" className="text-[1.15rem] px-6 py-3">Login</Link>
          </Button>
          <Button asChild size="lg">
            <Link to="/register" className="text-[1.15rem] px-6 py-3">Register</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full pt-4 md:pt-8 lg:pt-12 xl:pt-16 pb-4">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none animate-fade-in [animation-delay:200ms]">
                    Seamless Event Scheduling
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl animate-fade-in [animation-delay:400ms]">
                    Organize, manage, and participate in events with ease. Our platform
                    streamlines everything from invitations to attendee management.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row animate-fade-in [animation-delay:600ms]">
                  <Button asChild size="lg">
                    <Link to="/register">
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="p-2 sm:p-3 lg:p-4 flex items-center justify-center">
                <img
                  src="/demo.png"
                  width={1100}
                  height={728}
                  alt="Demo"
                  className="mx-auto rounded-xl object-contain max-w-full h-auto lg:order-last animate-fade-in [animation-delay:800ms]"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
