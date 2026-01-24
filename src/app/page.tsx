import { cookies } from "next/headers";
import HomeClient from "@/components/HomeClient";

export default async function Home() {
  const cookieStore = await cookies();
  const initialLang = cookieStore.get("siteLang")?.value === "zh" ? "zh" : "en";
  return <HomeClient initialLang={initialLang} />;
}
