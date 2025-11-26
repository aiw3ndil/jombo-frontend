import "../../globals.css";
import Header from "../components/Header";

export default function LangLayout({ children, params }: { children: React.ReactNode; params: { lang: string } }) {
  const lang = params.lang || "es";

  return (
    <html lang={lang}>
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <Header lang={lang} />
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
