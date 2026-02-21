import Link from "next/link";
import { faqItems } from "@/utils/faq";
import Image from "next/image";

const featuredSchemes = [
  {
    title: "Public Provident Fund (PPF)",
    description:
      "A long-term savings option with tax benefits, commonly used for disciplined wealth building.",
    href: "/schemes",
  },
  {
    title: "Atal Pension Yojana (APY)",
    description:
      "Pension-focused scheme for unorganized sector workers to support retirement planning.",
    href: "/schemes",
  },
  {
    title: "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)",
    description:
      "Affordable life insurance cover that can support families with basic financial protection.",
    href: "/schemes",
  },
  {
    title: "Pradhan Mantri Suraksha Bima Yojana (PMSBY)",
    description:
      "Low-cost accident insurance cover aimed at widening insurance access in India.",
    href: "/schemes",
  },
];



export default function Home() {
  return (
    <main className="bg-blue-50/40 text-slate-900">
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8 ">
        <div className="flex flex-col justify-center">
          <p className="mb-3 inline-flex w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold tracking-wide text-blue-800">
            India-Focused Financial Planning
          </p>
          <h1 className="text-3xl font-bold leading-tight text-blue-900 sm:text-4xl">
            Save smarter and protect your family with the right schemes.
          </h1>
          <p className="mt-4 text-base text-slate-700 sm:text-lg">
            Explore practical guidance on savings, insurance, and government schemes in
            India. Compare options, set goals, and build a safer financial future.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/schemes"
              className="rounded-md bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Explore Schemes
            </Link>
            <Link
              href="/goals"
              className="rounded-md border border-blue-200 bg-white px-5 py-2.5 text-sm font-semibold text-blue-800 transition hover:bg-blue-50"
            >
              Set Financial Goals
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="relative h-72 w-full max-w-xl overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-100 via-white to-blue-200 shadow-sm sm:h-80">
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="rounded-md bg-white/80 px-4 py-2 text-sm font-medium text-blue-800">
                <Image src="/fore.jpg" alt="image" width={500} height={500}/>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-blue-900">Popular Savings & Insurance Schemes</h2>
        <p className="mt-2 text-slate-700">
          Quick overview of commonly discussed Indian schemes you can start learning today.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {featuredSchemes.map((scheme) => (
            <article
              key={scheme.title}
              className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-900">{scheme.title}</h3>
              <p className="mt-2 text-sm text-slate-700">{scheme.description}</p>
              <Link
                href={scheme.href}
                className="mt-4 inline-block text-sm font-semibold text-blue-700 hover:text-blue-900"
              >
                Learn more
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-blue-900">Continue Your Journey</h2>
        <div className="mt-5 flex flex-col justify-center">
          <Link
            href="/pages/chatbot"
            className="rounded-lg border border-blue-100 bg-white px-4 py-3 text-md font-medium text-blue-900 transition hover:bg-blue-50"
          >
            Ask the Chatbot
          </Link>
          <Link
            href="/pages/goals"
            className="rounded-lg border border-blue-100 bg-white px-4 py-3 text-md font-medium text-blue-900 transition hover:bg-blue-50"
          >
            Build Savings Goals
          </Link>
          <Link
            href="/pages/profile"
            className="rounded-lg border border-blue-100 bg-white px-4 py-3 text-md font-medium text-blue-900 transition hover:bg-blue-50"
          >
            Update Profile
          </Link>
          <Link
            href="/pages/auth/register"
            className="rounded-lg border border-blue-100 bg-white px-4 py-3 text-md font-medium text-blue-900 transition hover:bg-blue-50"
          >
            Create Account
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-blue-900">FAQs: Financial & Insurance Schemes in India</h2>
        <div className="mt-5 space-y-3">
          {faqItems.map((item) => (
            <details key={item.question} className="rounded-lg border border-blue-100 bg-white p-4">
              <summary className="cursor-pointer list-none pr-6 text-md font-semibold text-slate-900">
                {item.question}
              </summary>
              <p className="mt-3 text-sm leading-6 text-slate-700">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
