"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

type AppShellProps = {
  children: ReactNode;
};

const navigation = [
  { label: "Overview", href: "/" },
  { label: "Explore Sites", href: "/sites" },
  { label: "Priority & Monitoring", href: "/priority" },
  { label: "Boroughs", href: "/boroughs" },
  { label: "Protection & Reconciliation", href: "/protection" },
  { label: "About", href: "/about" },
];

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div style={shellStyle}>
      <header style={headerStyle}>
        <div style={redBarStyle} />

        <div style={headerInnerStyle}>
          <Link href="/" style={brandLinkStyle}>
            <div style={brandMarkStyle}>LONDON SPORT</div>

            <div style={productNameStyle}>
              London Early Warning System
            </div>
          </Link>

          <nav style={navStyle}>
            {navigation.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    ...navLinkStyle,
                    ...(active ? activeNavLinkStyle : {}),
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <div style={contentStyle}>{children}</div>

      <footer style={footerStyle}>
        <div style={footerInnerStyle}>
          <div>
            <strong>London Early Warning System</strong>
            <div style={footerMutedStyle}>
              Playing field strategic value, risk and protection
              intelligence
            </div>
          </div>

          <div style={footerMutedStyle}>
            London Sport
          </div>
        </div>
      </footer>
    </div>
  );
}

const shellStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f7f5f2",
  color: "#171717",
  fontFamily:
    'Inter, Arial, Helvetica, system-ui, -apple-system, sans-serif',
};

const headerStyle: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 100,
  background: "rgba(255,255,255,0.97)",
  borderBottom: "1px solid #e5e2de",
  backdropFilter: "blur(10px)",
};

const redBarStyle: React.CSSProperties = {
  height: "5px",
  background: "#e21b23",
};

const headerInnerStyle: React.CSSProperties = {
  maxWidth: "1440px",
  margin: "0 auto",
  padding: "15px 28px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "32px",
};

const brandLinkStyle: React.CSSProperties = {
  textDecoration: "none",
  color: "inherit",
  flexShrink: 0,
};

const brandMarkStyle: React.CSSProperties = {
  color: "#e21b23",
  fontWeight: 900,
  fontSize: "18px",
  letterSpacing: "-0.02em",
};

const productNameStyle: React.CSSProperties = {
  marginTop: "2px",
  fontSize: "12px",
  fontWeight: 700,
  color: "#555",
};

const navStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "5px",
  overflowX: "auto",
};

const navLinkStyle: React.CSSProperties = {
  textDecoration: "none",
  color: "#555",
  padding: "9px 11px",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const activeNavLinkStyle: React.CSSProperties = {
  color: "#171717",
  background: "#f0ede9",
};

const contentStyle: React.CSSProperties = {
  minHeight: "calc(100vh - 180px)",
};

const footerStyle: React.CSSProperties = {
  marginTop: "60px",
  background: "#171717",
  color: "#fff",
};

const footerInnerStyle: React.CSSProperties = {
  maxWidth: "1440px",
  margin: "0 auto",
  padding: "32px 28px",
  display: "flex",
  justifyContent: "space-between",
  gap: "24px",
  alignItems: "center",
};

const footerMutedStyle: React.CSSProperties = {
  color: "#aaa",
  fontSize: "12px",
  marginTop: "4px",
};
