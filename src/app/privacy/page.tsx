"use client";
import AppLayout from "@/components/AppLayout";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-6 pb-28 lg:pb-8">
        <Link href="/settings" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft size={16} /> Back to Settings
        </Link>

        <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-sm border border-border">
          <h1 className="text-2xl font-bold text-foreground mb-1">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-6">Last updated: September 2026</p>

          <div className="space-y-6 text-sm leading-relaxed text-foreground/90">
            <p>
              At Dealspot Connect, we keep this simple. This page explains what
              information we collect when you use our app, why we need it, and
              what we do to keep it safe. If anything here is unclear, reach out
              to us — the contact details are at the bottom.
            </p>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">What we collect</h2>
              <p>When you create an account and use Dealspot, we collect:</p>
              <ul className="list-disc pl-5 space-y-1 text-foreground/80">
                <li>Your name, phone number, and email address.</li>
                <li>Your location or district, so we can show you listings nearby.</li>
                <li>The listings you post — titles, descriptions, prices, and photos.</li>
                <li>Basic activity, like which listings you view or save to favourites.</li>
                <li>Payment records when you unlock a seller&apos;s contact details.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Why we collect it</h2>
              <p>We use your information to:</p>
              <ul className="list-disc pl-5 space-y-1 text-foreground/80">
                <li>Let you post ads and connect with buyers and sellers.</li>
                <li>Show you relevant listings from your area.</li>
                <li>Verify your account and keep bad actors off the platform.</li>
                <li>Process payments securely when you unlock a contact.</li>
                <li>Send you important notices about your account or listings.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Who can see your information</h2>
              <p>
                Your phone number is <span className="font-medium">not shown publicly</span>.
                A buyer only sees your contact details after they choose to unlock
                them for your listing. Your name and general location appear on the
                ads you post, so buyers know who they&apos;re dealing with.
              </p>
              <p>
                We do not sell your personal data to anyone. Ever. We only share
                information with the trusted services that help us run the app —
                for example, our payment provider (Razorpay) to process payments,
                and our image host (Cloudinary) to store listing photos.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Payments</h2>
              <p>
                When you make a payment to unlock a contact, the transaction is
                handled by Razorpay, a secure payment gateway. We never see or
                store your card, UPI PIN, or bank details — that stays with the
                payment provider. We only keep a record that the payment happened.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">How we protect your data</h2>
              <p>
                Your data is stored on secure servers, connections are encrypted,
                and passwords are never stored in plain text. That said, no system
                is perfect — so please use a strong password and don&apos;t share
                your login with anyone.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Your choices</h2>
              <ul className="list-disc pl-5 space-y-1 text-foreground/80">
                <li>You can edit your profile details any time from your account.</li>
                <li>You can delete any listing you&apos;ve posted.</li>
                <li>You can delete your account entirely — this removes your listings and personal details from the platform.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Children</h2>
              <p>
                Dealspot is meant for adults. If you&apos;re under 18, please use
                the app only with a parent or guardian&apos;s involvement.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Changes to this policy</h2>
              <p>
                If we update this policy, we&apos;ll change the date at the top.
                For anything major, we&apos;ll let you know inside the app.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Contact us</h2>
              <p>
                Questions about your privacy? Write to us at{" "}
                <a href="mailto:dealspotconnect.official@gmail.com" className="text-primary hover:underline">
                  dealspotconnect.official@gmail.com
                </a>{" "}
                and we&apos;ll get back to you.
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
