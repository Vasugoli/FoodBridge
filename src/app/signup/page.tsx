import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Logo } from '@/components/icons/logo';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-secondary p-4">
      <Card className="mx-auto w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mb-4">
             <Logo />
          </Link>
          <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
          <CardDescription>Join FoodBridge to start making a difference</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input id="full-name" placeholder="John Doe" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">I am a...</Label>
              <Select>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="donor">Donor (I want to donate food)</SelectItem>
                  <SelectItem value="distributor">Distributor (I want to collect food)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" asChild>
                <Link href="/dashboard">Create Account</Link>
            </Button>
            <Button variant="outline" className="w-full">
              Sign up with Google
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
