export default function AppFooter() {
  return (
    <footer className="w-full border-t px-8 py-12">
      <div className="grid grid-cols-[repeat(auto-fit,190px)] gap-8 md:flex-row">
        <div className="space-y-3">
          <img className="h-9" src="/assets/logos/delv-fixed-borrow-logo.svg" />

          <p className="text-sm text-secondary-foreground">
            Copyright © 2024 DELV
          </p>

          <div className="mt-2 flex flex-row items-center gap-3">
            <a
              href="https://x.com/delv_tech"
              className="hover:opacity-80"
              target="_blank"
              rel="noreferrer noopener"
            >
              <img
                src="/assets/logos/x.svg"
                className="size-4"
                alt="Description"
                loading="lazy"
              />
            </a>

            <a
              href="https://warpcast.com/~/channel/delv"
              className="hover:opacity-80"
              target="_blank"
              rel="noreferrer noopener"
            >
              <img
                src="/assets/logos/farcaster-light.svg"
                className="size-6"
                alt="Description"
                loading="lazy"
              />
            </a>
            <a
              href="https://linkedin.com/company/delv-tech"
              className="hover:opacity-80"
              target="_blank"
              rel="noreferrer noopener"
            >
              <img
                src="/assets/logos/linkedin.svg"
                className="size-6"
                alt="Description"
                loading="lazy"
              />
            </a>
          </div>
        </div>

        <nav className="flex flex-col gap-2 text-sm font-light">
          <header className="text-md font-medium text-secondary-foreground">
            Resources
          </header>
          <a
            target="_blank"
            rel="noreferrer noopener"
            href="https://docs.hyperdrive.box"
            className="hover:underline"
          >
            Documentation
          </a>
          <a
            target="_blank"
            rel="noreferrer noopener"
            href="https://hyperdrive.blockanalitica.com"
            className="hover:underline"
          >
            Analytics
          </a>
          <a
            target="_blank"
            rel="noreferrer noopener"
            href="https://docs.hyperdrive.box/security/security-for-the-hyperdrive-protocol"
            className="hover:underline"
          >
            Security
          </a>
        </nav>

        <nav className="flex flex-col gap-2 text-sm font-light">
          <header className="text-md font-medium text-secondary-foreground">
            Ecosystem
          </header>
          <a
            target="_blank"
            rel="noreferrer noopener"
            href="https://app.hyperdrive.box"
            className="hover:underline"
          >
            Trading App
          </a>
          <a
            target="_blank"
            rel="noreferrer noopener"
            href="https://delv.tech/discord"
            className="hover:underline"
          >
            Community
          </a>
          <a
            target="_blank"
            rel="noreferrer noopener"
            href="https://governance.element.fi"
            className="hover:underline"
          >
            Governance
          </a>
        </nav>

        <nav className="flex flex-col gap-2 text-sm font-light">
          <header className="text-md font-medium text-secondary-foreground">
            About Us
          </header>
          <a
            target="_blank"
            rel="noreferrer noopener"
            href="https://www.delv.tech/"
            className="hover:underline"
          >
            DELV
          </a>
          <a
            target="_blank"
            rel="noreferrer noopener"
            href="https://blog.delv.tech/"
            className="hover:underline"
          >
            Blog
          </a>
          <a
            target="_blank"
            rel="noreferrer noopener"
            href="https://github.com/delvtech"
            className="hover:underline"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  )
}
