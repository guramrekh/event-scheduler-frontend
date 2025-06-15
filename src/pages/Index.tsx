
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CalendarDays, Users, ArrowRight } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link to="/" className="flex items-center justify-center">
          <CalendarDays className="h-6 w-6" />
          <span className="sr-only">Event Scheduler</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            to="/login"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Login
          </Link>
          <Button asChild>
            <Link to="/register">Register</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none animate-fade-in [animation-delay:200ms]">
                    Seamless Event Scheduling
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl animate-fade-in [animation-delay:400ms]">
                    Organize, manage, and attend events with ease. Our platform
                    streamlines everything from invitations to attendee
                    management.
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
              <img
                src="/placeholder.svg"
                width="550"
                height="550"
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square animate-fade-in [animation-delay:800ms]"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
