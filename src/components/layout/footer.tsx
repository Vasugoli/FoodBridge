import Link from 'next/link';
import { Logo } from '@/components/icons/logo';
import { Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  const socialLinks = [
    { icon: <Twitter className="h-5 w-5" />, href: '#' },
    { icon: <Github className="h-5 w-5" />, href: '#' },
    { icon: <Linkedin className="h-5 w-5" />, href: '#' },
  ];

  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} FoodBridge. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-4">
            {socialLinks.map((social, index) => (
              <Link key={index} href={social.href} className="text-muted-foreground hover:text-foreground transition-colors">
                {social.icon}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
