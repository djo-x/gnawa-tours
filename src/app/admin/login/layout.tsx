export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Override admin layout - no sidebar on login page
  return <>{children}</>;
}
