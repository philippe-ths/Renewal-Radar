# Renewal Radar (Local-First)

One-page product definition (What we are building)

## What it is

Renewal Radar is a personal app that turns renewal-related Gmail emails and policy documents into a single, reliable timeline of upcoming renewals. It focuses on home insurance and car insurance first, helping you avoid missed deadlines and reduce “auto-renewal laziness” by making it quick to compare and negotiate.

It does not try to be a general life admin app. It is a focused “renewals cockpit”.

## Who it is for

Philippe Marr, UK-based, who wants a low-friction way to stay on top of renewals and consistently reduce costs without trawling through inbox threads and PDFs.

## What problems it solves

Renewal dates and prices are buried across emails, attachments, and portals.

Auto-renewing by default is expensive.

Comparing alternatives is tedious because the key details are hard to gather and easy to miss.

You end up re-reading the same documents every year.

## Core user experience

You open Renewal Radar and see:

What renews soon

What it will cost (based on renewal notices)

What you need to do next

Proof for the key facts (so you can trust it)

Then you generate a renewal pack to renegotiate or shop around with minimal effort.

## Key features (MVP)
### 1) Gmail renewal detection (read-only)

Connects to Gmail and identifies emails related to home and car insurance renewals.

Handles both plain text emails and emails with PDF attachments.

### 2) Evidence-backed extraction

For each renewal, the app extracts the essentials:

Category: home or car

Provider name

Policy number (if available)

Renewal date (or expiry date)

Renewal premium (annual and/or monthly if shown)

Every key extracted value is accompanied by an evidence snippet from the email or document so the user can verify it quickly.

### 3) Renewal timeline dashboard

A clean dashboard view that shows:

Next 30/60/90 days renewals

“Due soon” and “needs review” flags

Filters for home vs car

Search by provider or policy number

### 4) Item detail view

For each renewal item:

A clear summary of the renewal

Evidence snippets for the key fields

Links to the original source email and any attachments stored locally

### 5) Renewal pack generator (saves time and money)

One click produces a structured pack containing:

Summary of current renewal terms

Checklist of what information you need to gather for quotes

A comparison template (so you can paste in alternative quotes)

A negotiation call script / email draft to challenge the renewal price

“Questions to confirm” list (excess, add-ons, exclusions, policy details)

### 6) Year-over-year tracking (when data exists)

When previous years’ renewal info is available, the app shows:

Price change vs last year (amount and percentage)

A short summary of what to check or challenge

## What “done” looks like

A working version is considered complete when:

It reliably finds renewal emails in Gmail

It extracts renewal date and renewal premium correctly in most real cases

It shows a timeline and item details without manual fixes

The renewal pack is usable and saves time in the real renewal process

### Boundaries (important non-features for MVP)

No sending emails automatically

No buying or switching policies automatically

No auto-scraping comparison sites for quotes

No broad admin tracking beyond home and car insurance

## Why it is valuable

Renewal Radar eliminates the repetitive admin of:

finding renewal details

confirming dates and costs

preparing to compare and negotiate

It turns renewals into a predictable routine: review, compare, decide.