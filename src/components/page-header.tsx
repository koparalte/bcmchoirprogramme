import Image from 'next/image';

const logoUrl = "https://lh3.googleusercontent.com/d/1yOgPWEoQhO6nWt2AmwM4lxXgRsoZs7nM";

export function PageHeader() {
  return (
    <header className="flex flex-col items-center text-center mb-8 md:mb-12">
      <Image src={logoUrl} alt="BCM Choir Programme Logo" width="64" height="64" className="mb-4" />
      <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-primary uppercase">
        BCM CHOIR PROGRAMME & HLA ZIR
      </h1>
    </header>
  );
}
