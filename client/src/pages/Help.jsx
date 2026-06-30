import { useState } from "react";
import Navbar from "../components/reuse/Navbar";
import { categories, faqs, guides, safetyTips, supportChannels, troubleshootItems, communityGuidelines, styles } from "./help.const";

import { CategoryCard, FaqAccordion, GuideCard, TroubleCard } from "./help.const.jsx"
import Footer from "../components/reuse/Footer.jsx";


export default function Help() {
  const [searchVal, setSearchVal] = useState("");

  return (
    <div style={styles.page}>
      {/* NAV */}
      <Navbar />

      {/* HERO */}
      <section style={styles.hero}>
        <p style={styles.heroBadge}>Help Centre</p> <br />
        
        <p style={styles.heroBadge}>currently this page is static only !!</p>
        <h1 style={styles.heroHeading}>How can we help you?</h1>
        <p style={styles.heroSub}>
          Explore guides, FAQs, and support resources for buying, renting, selling, and managing properties on RentSmart.
        </p>
        <div style={styles.searchWrap}>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Search for help articles, topics, or questions…"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
          <button style={styles.searchBtn}>→</button>
        </div>
      </section>

      {/* QUICK CATEGORIES */}
      <div style={styles.section}>
        <p style={styles.sectionLabel}>Browse by Topic</p>
        <h2 style={styles.sectionTitle}>Quick Help Categories</h2>
        <p style={styles.sectionDesc}>
          Select a topic to explore relevant guides, FAQs, and step-by-step articles.
        </p>
        <div style={styles.catGrid}>
          {categories.map((c) => (
            <CategoryCard key={c.title} {...c} />
          ))}
        </div>
      </div>

      <hr style={styles.divider} />

      {/* FAQ */}
      <div style={{ ...styles.sectionGray }}>
        <div style={styles.sectionNarrow}>
          <p style={styles.sectionLabel}>Frequently Asked Questions</p>
          <h2 style={styles.sectionTitle}>Everything You Need to Know</h2>
          <p style={styles.sectionDesc}>
            Answers to the most common questions from buyers, renters, sellers, and property owners on RentSmart.
          </p>
          <FaqAccordion faqs={faqs} />
        </div>
      </div>

      {/* STEP-BY-STEP GUIDES */}
      <div style={styles.section}>
        <p style={styles.sectionLabel}>Getting Started</p>
        <h2 style={styles.sectionTitle}>Step-by-Step Guides</h2>
        <p style={styles.sectionDesc}>
          Detailed walkthroughs for every type of user — whether you're buying, renting, or selling your first property.
        </p>
        <div style={styles.guideGrid}>
          {guides.map((g) => (
            <GuideCard key={g.title} {...g} />
          ))}
        </div>
      </div>

      <hr style={styles.divider} />

      {/* SAFETY TIPS */}
      <div style={styles.sectionGray}>
        <div style={styles.section}>
          <p style={styles.sectionLabel}>Your Safety Matters</p>
          <h2 style={styles.sectionTitle}>Safety Tips for All Users</h2>
          <p style={styles.sectionDesc}>
            Follow these guidelines to protect yourself during every stage of a property transaction.
          </p>
          <div style={styles.safetyGrid}>
            {safetyTips.map((s) => (
              <div key={s.title} style={styles.safetyCard}>
                <div style={styles.safetyIcon}>{s.icon}</div>
                <p style={styles.safetyTitle}>{s.title}</p>
                <p style={styles.safetyDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONTACT SUPPORT */}
      <div style={styles.section}>
        <p style={styles.sectionLabel}>We're Here for You</p>
        <h2 style={styles.sectionTitle}>Contact Support</h2>
        <p style={styles.sectionDesc}>
          Reach our support specialists through the channel that works best for your query.
        </p>
        <div style={styles.supportGrid}>
          {supportChannels.map((s) => (
            <div key={s.title} style={styles.supportCard}>
              <div style={styles.supportIcon}>{s.icon}</div>
              <p style={styles.supportTitle}>{s.title}</p>
              <p style={styles.supportDesc}>{s.desc}</p>
              <button style={styles.btnOutline}>{s.action}</button>
            </div>
          ))}
        </div>
      </div>

      <hr style={styles.divider} />

      {/* TROUBLESHOOTING */}
      <div style={styles.sectionGray}>
        <div style={styles.section}>
          <p style={styles.sectionLabel}>Troubleshooting</p>
          <h2 style={styles.sectionTitle}>Resolve Common Issues</h2>
          <p style={styles.sectionDesc}>
            Self-service troubleshooting steps for the most frequently reported problems on RentSmart.
          </p>
          <div style={styles.troubleGrid}>
            {troubleshootItems.map((t) => (
              <TroubleCard key={t.title} {...t} />
            ))}
          </div>
        </div>
      </div>

      {/* COMMUNITY GUIDELINES */}
      <div style={styles.section}>
        <p style={styles.sectionLabel}>Platform Standards</p>
        <h2 style={styles.sectionTitle}>Community Guidelines</h2>
        <p style={styles.sectionDesc}>
          RentSmart is built on trust. These guidelines ensure a safe, honest, and respectful environment for all users.
        </p>
        <div style={styles.communityGrid}>
          {communityGuidelines.map((g) => (
            <div key={g.title} style={styles.communityCard}>
              <div style={styles.communityIcon}>{g.icon}</div>
              <p style={styles.communityTitle}>{g.title}</p>
              <p style={styles.communityDesc}>{g.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <hr style={styles.divider} />



      {/* CTA */}
      <div style={styles.cta}>
        <p style={styles.ctaLabel}>Still Have Questions?</p>
        <h2 style={styles.ctaTitle}>Still Need Assistance?</h2>
        <p style={styles.ctaDesc}>
          Our support team is here to help with buying, renting, selling, payments, listings, and account-related questions.
        </p>
        <div style={styles.ctaBtns}>
          <button style={styles.btnPrimary}>Contact Support</button>
          <button style={styles.btnWhite}>Browse Help Articles</button>
        </div>
      </div>
      <Footer />
    </div>
  );
}