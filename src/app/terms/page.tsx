"use client";
import AppLayout from "@/components/AppLayout";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-6 pb-28 lg:pb-8">
        <Link href="/settings" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft size={16} /> Back to Settings
        </Link>

        <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-sm border border-border">
          <h1 className="text-2xl font-bold text-foreground mb-1">Terms &amp; Conditions</h1>
          <p className="text-sm text-muted-foreground mb-6">Last updated: September 2026</p>

          <div className="space-y-6 text-sm leading-relaxed text-foreground/90">
            <p>
              Welcome to Dealspot Connect. By using our app, you agree to the
              terms below. We&apos;ve tried to keep them plain and fair. Please
              read through them.
            </p>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">What Dealspot is</h2>
              <p>
                Dealspot is a marketplace that connects buyers and sellers in
                rural Karnataka — for property, livestock, farm equipment,
                vehicles, services, and more. We&apos;re the platform that brings
                people together. We are <span className="font-medium">not</span> a
                party to the actual deals made between users.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Your account</h2>
              <ul className="list-disc pl-5 space-y-1 text-foreground/80">
                <li>You must give accurate details when you register.</li>
                <li>You&apos;re responsible for keeping your password safe.</li>
                <li>One person, one account. Don&apos;t impersonate anyone else.</li>
                <li>You must be 18 or older, or use the app with a guardian.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Posting listings</h2>
              <p>When you post an ad, you agree that:</p>
              <ul className="list-disc pl-5 space-y-1 text-foreground/80">
                <li>The listing is genuine and the details are true.</li>
                <li>You actually own or are allowed to sell what you list.</li>
                <li>You won&apos;t post anything illegal, fake, offensive, or misleading.</li>
                <li>The photos are of the real item, not copied from elsewhere.</li>
              </ul>
              <p>
                We may review, hide, or remove any listing that breaks these rules
                or that we consider harmful — without prior notice.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Deals and payments</h2>
              <p>
                Deals happen directly between buyers and sellers. Dealspot charges
                a small fee only to unlock a seller&apos;s contact details — that
                fee is for the platform service, not the item itself. Once you pay
                to unlock a contact, that fee is non-refundable, since you receive
                the information immediately.
              </p>
              <p>
                Please meet safely, inspect goods before paying, and use your own
                judgement. Dealspot does not guarantee the quality, safety, or
                legality of any item or service listed, and we&apos;re not
                responsible for what happens between users after a deal.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">What you shouldn&apos;t do</h2>
              <ul className="list-disc pl-5 space-y-1 text-foreground/80">
                <li>Don&apos;t spam, scam, or harass other users.</li>
                <li>Don&apos;t post duplicate or misleading ads.</li>
                <li>Don&apos;t try to break, hack, or overload the platform.</li>
                <li>Don&apos;t use the app for anything against the law.</li>
              </ul>
              <p>
                Breaking these rules can get your account suspended or removed.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Our responsibility</h2>
              <p>
                We work hard to keep Dealspot running smoothly, but we can&apos;t
                promise it will always be perfect or available. We&apos;re not
                liable for losses that come from deals between users, from listings
                posted by others, or from the app being temporarily down.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Our name and content</h2>
              <p>
                The Dealspot Connect name, logo, design, and the app itself belong
                to us. Please don&apos;t copy, rebrand, or reuse any part of the
                platform without our permission. The listings and photos you post
                stay yours — but by posting them you allow us to display them
                inside the app so buyers can find you.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">If something goes wrong because of you</h2>
              <p>
                If your use of Dealspot — or something you post — causes a problem
                that leads to a claim or cost against us, you agree to cover us for
                it. In plain terms: you&apos;re responsible for what you do on the
                platform.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Ending your access</h2>
              <p>
                You can stop using Dealspot and delete your account any time. We
                may also suspend or close an account if the rules here are broken
                or we spot misuse — sometimes without warning if the situation is
                serious.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Which laws apply</h2>
              <p>
                These terms follow the laws of India. If a dispute ever comes up
                that can&apos;t be sorted out directly, it will be handled by the
                courts in Karnataka, India.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Changes</h2>
              <p>
                We may update these terms as the platform grows. If we make a big
                change, we&apos;ll let you know in the app. Continuing to use
                Dealspot after a change means you accept the updated terms.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Contact</h2>
              <p>
                Got a question about these terms? Email us at{" "}
                <a href="mailto:dealspotconnect.official@gmail.com" className="text-primary hover:underline">
                  dealspotconnect.official@gmail.com
                </a>.
              </p>
            </section>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8 pt-6 border-t border-border">
            © 2026 Dealspot Connect. All rights reserved.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
