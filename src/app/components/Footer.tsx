interface FooterProps {
  copyright: string;
}

export default function Footer({ copyright }: FooterProps) {
  return (
    <footer className="border-t border-white/10 px-4 py-4 text-center sm:px-6 sm:py-5 md:px-8 md:py-6 lg:px-12">
      <p className="text-xs text-zinc-500 sm:text-sm">{copyright}</p>
    </footer>
  );
}
