import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
} from "@/components/ui";

export default function Home() {
  return (
    <div className="space-y-section">
      {/* Hero */}
      <section className="rounded-card bg-gradient-to-br from-primary-light to-white p-6 md:p-10">
        <Badge variant="secondary" className="mb-4">
          Islamic Learning Platform
        </Badge>
        <h1 className="max-w-xl">Learn · Teach · Compete</h1>
        <p className="mt-3 max-w-lg text-body text-neutral-muted">
          Connect with qualified tutors, join Islamic competitions, and grow your knowledge — all in
          one place.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/register" size="lg">
            Get Started
          </ButtonLink>
          <ButtonLink href="/tutors" variant="outline" size="lg">
            Browse Tutors
          </ButtonLink>
        </div>
      </section>

      {/* Component showcase */}
      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Tutor Marketplace</CardTitle>
              <Badge variant="verified">Verified</Badge>
            </div>
            <CardDescription>Find tutors for Quran, Tajweed, Hifz, and more.</CardDescription>
          </CardHeader>
          <CardContent>
            <label className="mb-1.5 block text-caption font-medium text-neutral-text">
              Search tutors
            </label>
            <Input placeholder="e.g. Tajweed, Arabic..." />
          </CardContent>
          <CardFooter>
            <ButtonLink href="/tutors">Explore Tutors</ButtonLink>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Competition Hub</CardTitle>
              <Badge variant="premium">Open</Badge>
            </div>
            <CardDescription>
              Register for Quran recitation, Hifz, and quiz competitions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Join competitions, upload documents, and earn certificates.</p>
          </CardContent>
          <CardFooter className="gap-2">
            <Button variant="secondary">View All</Button>
            <Button variant="ghost">Learn More</Button>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}
