import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, Users, MapPin, Bell } from 'lucide-react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');
  const howItWorksImages = {
    1: PlaceHolderImages.find((img) => img.id === 'how-it-works-1'),
    2: PlaceHolderImages.find((img) => img.id === 'how-it-works-2'),
    3: PlaceHolderImages.find((img) => img.id === 'how-it-works-3'),
  };

  const features = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: 'Secure Authentication',
      description: 'Easy and secure sign-up for donors and distributors with optional Google OAuth.',
    },
    {
      icon: <MapPin className="h-8 w-8 text-primary" />,
      title: 'Donation Discovery',
      description: 'An interactive map to find surplus food donations in your local area quickly.',
    },
    {
      icon: <Bell className="h-8 w-8 text-primary" />,
      title: 'Real-time Notifications',
      description: 'Get instant alerts for donation claims, status updates, and new opportunities.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 lg:py-40">
           <div className="absolute inset-0 -z-10 h-full w-full bg-gradient-to-t from-background via-transparent to-transparent" />
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl font-headline animate-slide-up">
                Saving Food, Serving Lives
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground animate-slide-up animation-delay-200">
                FoodBridge connects communities to rescue surplus food, reduce waste, and fight hunger. Join us in making a difference, one meal at a time.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6 animate-slide-up animation-delay-400">
                <Button asChild size="lg">
                  <Link href="/signup">Get Started <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                   <Link href="#how-it-works">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
          {heroImage && (
            <div className="absolute inset-0 -z-20 h-full w-full">
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                quality={80}
                className="object-cover opacity-10"
                data-ai-hint={heroImage.imageHint}
              />
            </div>
          )}
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 sm:py-24 bg-card/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">How It Works</h2>
              <p className="mt-4 text-lg text-muted-foreground">A simple three-step process to connect surplus food with those in need.</p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                { step: 1, title: 'Post a Donation', description: "Donors list surplus food with details and photos through a simple form.", image: howItWorksImages[1] },
                { step: 2, title: 'Find & Claim', description: "Distributors browse available donations on a map and claim them instantly.", image: howItWorksImages[2] },
                { step: 3, title: 'Collect & Distribute', description: "Distributors pick up the food and deliver it to local communities in need.", image: howItWorksImages[3] },
              ].map(({ step, title, description, image }) => (
                <Card key={step} className="text-center shadow-lg hover:shadow-primary/20 transition-shadow duration-300 transform hover:-translate-y-1 animate-fade-in bg-card">
                  <CardHeader className="p-0">
                    {image && <Image src={image.imageUrl} alt={image.description} width={400} height={300} className="rounded-t-lg aspect-[4/3] object-cover" data-ai-hint={image.imageHint} />}
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-primary font-bold tracking-wider uppercase text-sm">Step {step}</div>
                    <h3 className="mt-2 text-xl font-semibold text-foreground">{title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 sm:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">Platform Features</h2>
              <p className="mt-4 text-lg text-muted-foreground">Everything you need to manage food donations and distribution efficiently.</p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col items-center text-center p-6 animate-fade-in" style={{ animationDelay: `${index * 200}ms` }}>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-card/50 py-16 sm:py-24">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline animate-slide-up">Join the Movement Today</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto animate-slide-up animation-delay-200">
              Whether you have food to give or hands to help, you can make a tangible impact on your community.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 animate-slide-up animation-delay-400">
              <Button asChild size="lg">
                <Link href="/signup">Sign Up to Donate</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/signup">Sign Up to Distribute</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
