import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "globetrotter",
  description: "Test your geography knowledge and explore the world!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased akaya-kanadaka-regular">
        {children}
      </body>
    </html>
  );
}
