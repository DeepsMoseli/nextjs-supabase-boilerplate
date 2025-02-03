'use client';

export function Footer() {
  return (
    <footer className="border-t mt-12 py-6">
      <div className="container mx-auto px-4">
        <p className="text-center text-muted-foreground">
          © {new Date().getFullYear()} THE SHARD CM. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
