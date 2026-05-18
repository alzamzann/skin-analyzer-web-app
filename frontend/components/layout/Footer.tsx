import type React from "react";

interface FooterProps {
  logo: React.ReactNode;
  brandName: string;
  socialLinks: Array<{
    icon: React.ReactNode;
    href: string;
    label: string;
  }>;
  mainLinks: Array<{
    href: string;
    label: string;
  }>;
  legalLinks: Array<{
    href: string;
    label: string;
  }>;
  copyright: {
    text: string;
    license?: string;
  };
}

export function Footer({
  logo,
  brandName,
  socialLinks,
  mainLinks,
  legalLinks,
  copyright,
}: FooterProps) {
  return (
    <footer className="border-t border-[#EAEAEA] bg-transparent pb-8 pt-10 lg:pb-10 lg:pt-14">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-start">
          <a
            href="#top"
            className="flex items-center gap-x-2"
            aria-label={brandName}
          >
            {logo}
            <span className="text-lg font-semibold tracking-[-0.02em] text-[#111111]">
              {brandName}
            </span>
          </a>
          <div className="grid gap-6 md:justify-items-end">
            <nav>
              <ul className="-mx-2 -my-1 flex list-none flex-wrap md:justify-end">
                {mainLinks.map((link, i) => (
                  <li key={i} className="mx-2 my-1 shrink-0">
                    <a
                      href={link.href}
                      className="text-sm font-medium text-[#2F3437] underline-offset-4 transition-colors duration-200 hover:text-[#111111] hover:underline"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            {socialLinks.length > 0 && (
              <ul className="flex list-none space-x-3">
                {socialLinks.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={link.label}
                      className="grid h-9 w-9 place-items-center rounded-[6px] border border-[#EAEAEA] bg-white text-sm text-[#2F3437] transition-colors duration-200 hover:bg-[#F7F6F3] hover:text-[#111111]"
                    >
                      {link.icon}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="mt-10 grid gap-5 border-t border-[#EAEAEA] pt-6 text-sm leading-6 text-[#787774] md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div>{copyright.text}</div>
            {copyright.license && <div>{copyright.license}</div>}
          </div>
          <div>
            <ul className="-mx-3 -my-1 flex list-none flex-wrap md:justify-end">
              {legalLinks.map((link, i) => (
                <li key={i} className="mx-3 my-1 shrink-0">
                  <a
                    href={link.href}
                    className="text-sm text-[#787774] underline-offset-4 transition-colors duration-200 hover:text-[#111111] hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
