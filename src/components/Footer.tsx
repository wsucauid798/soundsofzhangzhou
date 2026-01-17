interface FooterProps {
  copyright: string;
}

export default function Footer({ copyright }: FooterProps) {
  return (
    <footer className="container mx-auto shrink-0 border-t border-white/10 px-4 py-4 text-center">
      <p className="text-xs tracking-wide text-zinc-500">
        {copyright}
      </p>
    </footer>
  );
}
