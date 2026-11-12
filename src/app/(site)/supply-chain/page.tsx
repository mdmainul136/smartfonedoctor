"use client";

import React, { useState } from "react";
import Link from "next/link";
import Footer from "@/components/layout/Footer";

export default function SupplyChainPage() {
  const [activeTab, setActiveTab] = useState<"code" | "california">("code");

  return (
    <main className="bg-[#fcfcfc] min-h-screen">
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        
        {/* 1. Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-4 text-[12.5px] text-neutral-500 font-normal">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li>
              <Link href="/" className="hover:text-sfd-teal transition-colors">
                Home
              </Link>
            </li>
            <li className="text-neutral-400">&gt;</li>
            <li className="text-neutral-800 font-medium" aria-current="page">
              {activeTab === "code" ? "Supply Chain" : "California Supply Chain Act"}
            </li>
          </ol>
        </nav>

        {/* 2. Top Header & Tab Switcher matching both screenshots */}
        <div className="border-b border-neutral-200 pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] sm:text-[38px] lg:text-[44px] font-bold text-[#1d1c1a] tracking-tight leading-tight">
              {activeTab === "code" ? "Supply Chain" : "California Supply Chain Act"}
            </h1>
            <p className="text-xs sm:text-[13px] text-neutral-500 mt-2">
              Responsible Sourcing, Ethical Labor, and Supplier Compliance Standards
            </p>
          </div>

          {/* Quick Tab Switcher */}
          <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-full border border-neutral-200 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("code")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "code"
                  ? "bg-white text-[#1d1c1a] shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Supplier Code of Conduct
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("california")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "california"
                  ? "bg-white text-[#1d1c1a] shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              California Act Disclosure
            </button>
          </div>
        </div>

        {/* =========================================================
            TAB 1: SUPPLIER CODE OF CONDUCT (Image 1)
           ========================================================= */}
        {activeTab === "code" && (
          <div className="space-y-8 text-[13.5px] sm:text-[14px] text-neutral-700 leading-[1.75] font-normal animate-in fade-in duration-200">
            
            {/* Header intro */}
            <div className="space-y-3">
              <h2 className="text-[20px] sm:text-[22px] font-bold text-[#1d1c1a] tracking-tight">
                Supplier Code of Conduct
              </h2>
              <p className="font-medium text-neutral-800">
                We are committed to treating all people with respect and dignity, ensuring safe working conditions, and conducting environmentally responsible, ethical operations. We expect suppliers in our operations and supply chain, and their suppliers, to embrace the following social, environmental, and ethical responsibilities.
              </p>
              <p className="text-neutral-600 italic text-[13px]">
                Supplier Code is aligned with SmartFoneDoctor&apos;s Responsible Sourcing Protocol.
              </p>
            </div>

            {/* General Supplier Commitments */}
            <div className="space-y-3 p-5 rounded-2xl bg-neutral-50 border border-neutral-200">
              <p>
                <strong className="text-neutral-900">Underlying Obligations:</strong> In addition to these responsibilities, suppliers must comply with all applicable legal regulations, statutes, and governance, and all obligations in agreements suppliers may have with us.
              </p>
              <p>
                <strong className="text-neutral-900">On-Site Work:</strong> Suppliers using our properties or facilities will comply with all of our applicable policies and requirements.
              </p>
              <p>
                <strong className="text-neutral-900">Certifications:</strong> If we request specific industry certifications (such as ISO 14001 or R2 recycling standards), suppliers will make good-faith efforts to execute such certifications in a timely manner.
              </p>
              <p>
                <strong className="text-neutral-900">Information Disclosure:</strong> Suppliers must disclose information regarding their labor, health and safety, environmental practices, business activities, structure, financial situation, and performance in accordance with prevailing industry practices.
              </p>
              <p>
                <strong className="text-neutral-900">Cooperation:</strong> Suppliers will cooperate with any information requests and audits we may initiate to confirm their fulfillment of these responsibilities. Though we seek to work with suppliers to improve conditions, we may terminate relationships with any supplier that fails to meet these responsibilities.
              </p>
            </div>

            {/* Section 1: Labor and Human Rights */}
            <section className="space-y-3.5">
              <h2 className="text-[17px] sm:text-[18px] font-bold text-[#1d1c1a] tracking-wider uppercase border-b border-neutral-200 pb-2">
                Labor and Human Rights
              </h2>
              <p>
                We are committed to upholding the human rights of workers and treating them with dignity and respect. This applies to all workers, including temporary, migrant, student, contract, direct employees, and any other type of worker. As a result, suppliers must manage their own workforce in order to achieve the following results:
              </p>
              <div className="space-y-3 pl-2 sm:pl-4">
                <p>
                  <strong className="text-neutral-900 font-semibold">Freely Chosen Employment and Anti-Human Trafficking:</strong> Suppliers will not use or permit forced, bonded, or indentured labor. All work must be voluntary, and workers must be free to leave at any time without penalty. Suppliers will not hold or confiscate identity, immigration, or work permit documents longer than necessary for verification. Suppliers will provide written employment agreements in workers&apos; native languages prior to departure from their home country.
                </p>
                <p>
                  <strong className="text-neutral-900 font-semibold">Young Workers and Child Labor Avoidance:</strong> Suppliers will not use child labor. &quot;Child&quot; refers to any person under 15 (or the legal minimum age for employment in the country, whichever is higher). Workers under 18 must not perform work that is likely to jeopardize their health or safety, including night shifts or overtime.
                </p>
                <p>
                  <strong className="text-neutral-900 font-semibold">Wages:</strong> Suppliers will timely pay mandatory wages and benefits, comply with the law regarding wage deductions, and will provide workers with a detailed written explanation for pay in a language they understand. Deductions from wages as a disciplinary measure are strictly forbidden.
                </p>
                <p>
                  <strong className="text-neutral-900 font-semibold">Working Hours:</strong> Except in exceptional situations, the supplier of workers will not have excessive work hours exceeding 60 hours per work week, including overtime, or exceed the maximum set by local law. Workers must be allowed at least one day of rest every seven days.
                </p>
                <p>
                  <strong className="text-neutral-900 font-semibold">Non-Discrimination &amp; Equal Opportunity:</strong> Suppliers will not permit discrimination, harassment, or retaliation in hiring or employment practices based on race, color, age, gender, sexual orientation, gender identity, marital status, religion, disability, veteran status, or union affiliation.
                </p>
                <p>
                  <strong className="text-neutral-900 font-semibold">Freedom of Association and Collective Bargaining:</strong> Workers will be permitted to communicate freely and openly with management regarding working conditions without fear of reprisal, intimidation, or harassment.
                </p>
              </div>
            </section>

            {/* Section 2: Health and Safety */}
            <section className="space-y-3.5">
              <h2 className="text-[17px] sm:text-[18px] font-bold text-[#1d1c1a] tracking-wider uppercase border-b border-neutral-200 pb-2">
                Health and Safety
              </h2>
              <p>
                Suppliers will integrate the following health and safety management requirements into business processes to provide workers with a healthy and safe work environment:
              </p>
              <div className="space-y-3 pl-2 sm:pl-4">
                <p>
                  <strong className="text-neutral-900 font-semibold">Occupational Safety and Health:</strong> Suppliers will comply with all applicable workplace safety laws and regulations, identify, evaluate, and control worker exposure to safety and health hazards (chemical, biological, physical, and ergonomic stressors) through proper engineering controls, maintenance, safe work procedures, and protective equipment (PPE).
                </p>
                <p>
                  <strong className="text-neutral-900 font-semibold">Emergency Preparedness:</strong> Suppliers will identify and plan for potential emergencies and implement emergency plans, providing guidance to workers on emergency response procedures, emergency reporting, evacuation drills, fire detection, and appropriate first aid supplies.
                </p>
                <p>
                  <strong className="text-neutral-900 font-semibold">Sanitation, Food, and Housing:</strong> Suppliers will provide workers with ready access to clean toilet facilities, potable water, and sanitary food preparation, storage, and eating facilities. Worker dormitories will be maintained clean, safe, and provided with adequate heat, ventilation, emergency egresses, and hot water.
                </p>
              </div>
            </section>

            {/* Section 3: Environmental */}
            <section className="space-y-3.5">
              <h2 className="text-[17px] sm:text-[18px] font-bold text-[#1d1c1a] tracking-wider uppercase border-b border-neutral-200 pb-2">
                Environmental
              </h2>
              <p>
                We recognize that environmental responsibility is integral to producing world-class repair services. Suppliers are expected to create regenerative processes and will minimize adverse effects on the community environment and natural resources while safeguarding public health.
              </p>
              <div className="space-y-3 pl-2 sm:pl-4">
                <p>
                  <strong className="text-neutral-900 font-semibold">Environmental Permits and Reporting:</strong> Suppliers will obtain and keep current all required environmental permits and registrations, and follow their reporting requirements.
                </p>
                <p>
                  <strong className="text-neutral-900 font-semibold">Resource Efficiency and Clean Energy:</strong> Throughout their operations, suppliers will seek to minimize consumption of resources, including raw materials, energy, and water, and track and document greenhouse gas emissions.
                </p>
                <p>
                  <strong className="text-neutral-900 font-semibold">Hazardous and Toxic Substances:</strong> Suppliers will safely identify and manage chemicals and other materials that pose a hazard to the environment to ensure safe handling, movement, storage, and disposal.
                </p>
                <p>
                  <strong className="text-neutral-900 font-semibold">Waste Mitigation, Wastewater &amp; Solid Waste Management:</strong> Suppliers will track and reduce or eliminate waste of all types. Lithium-ion battery recycling and electronic scrap (e-waste) must follow certified zero-landfill protocols.
                </p>
              </div>
            </section>

            {/* Section 4: Ethics and Compliance */}
            <section className="space-y-3.5">
              <h2 className="text-[17px] sm:text-[18px] font-bold text-[#1d1c1a] tracking-wider uppercase border-b border-neutral-200 pb-2">
                Ethics and Compliance
              </h2>
              <p>
                Suppliers will uphold the highest standards of ethics to promote honesty and integrity in business operations:
              </p>
              <div className="space-y-3 pl-2 sm:pl-4">
                <p>
                  <strong className="text-neutral-900 font-semibold">Business Integrity:</strong> Suppliers will avoid actual and perceived conflicts of interest in their dealings with us. Bribes, kickbacks, or other improper advantages are strictly prohibited.
                </p>
                <p>
                  <strong className="text-neutral-900 font-semibold">Intellectual Property:</strong> Suppliers will respect intellectual property rights and transfer technology and know-how in a manner that protects intellectual property.
                </p>
                <p>
                  <strong className="text-neutral-900 font-semibold">Whistleblower Protection:</strong> Suppliers will maintain a policy ensuring confidentiality and protection of supplier and employee whistleblowers, prohibiting retaliation.
                </p>
                <p>
                  <strong className="text-neutral-900 font-semibold">Privacy and Information Security:</strong> Suppliers will protect the privacy of personal information of everyone with whom they do business.
                </p>
              </div>
            </section>

            {/* Section 5: Management System */}
            <section className="space-y-3.5">
              <h2 className="text-[17px] sm:text-[18px] font-bold text-[#1d1c1a] tracking-wider uppercase border-b border-neutral-200 pb-2">
                Management System
              </h2>
              <p>
                Suppliers are required to adopt or establish a management system to carry out these responsibilities. The management system will be designed to ensure suppliers&apos; operations: (a) comply with our requirements and applicable laws and regulations; (b) conform to these responsibilities; and (c) identify and mitigate operational risks related to these responsibilities.
              </p>
            </section>

            {/* Cross-Link to California Supply Chain Act */}
            <div className="pt-6 border-t border-neutral-200">
              <p className="text-[13px] text-neutral-600">
                To view our specific California legal disclosure, read the{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("california")}
                  className="text-sfd-teal font-semibold hover:underline cursor-pointer"
                >
                  California Supply Chain Act Disclosure →
                </button>
              </p>
            </div>

          </div>
        )}

        {/* =========================================================
            TAB 2: CALIFORNIA SUPPLY CHAIN ACT DISCLOSURE (Image 2)
           ========================================================= */}
        {activeTab === "california" && (
          <div className="space-y-8 text-[13.5px] sm:text-[14px] text-neutral-700 leading-[1.75] font-normal animate-in fade-in duration-200">
            
            <div className="space-y-4">
              <h2 className="text-[20px] sm:text-[24px] font-bold text-[#1d1c1a] tracking-tight">
                Transparency in Supply Chains Act Disclosure
              </h2>

              <p className="text-[14px] leading-relaxed">
                This disclosure is provided pursuant to the California Transparency in Supply Chains Act of 2010, Section 1714.43 of the California Civil Code, which requires retailers and manufacturers above a certain size and doing business in California to disclose what efforts, if any, they have taken to monitor human trafficking and the use of slave labor in their supply chains.
              </p>

              <p className="text-[14px] leading-relaxed">
                Our organization recognizes the critical role we play in providing services and selling products that improve the lives of our customers. Doing so requires us to balance the social, environmental, and economic benefits and risks of the products we offer, including how they are sourced, manufactured, and used.
              </p>

              <p className="text-[14px] leading-relaxed">
                Suppliers, franchisees, and employees play a key role in our efforts to ensure that we manage our supply chain in a sustainable way. We source products from reputable companies with responsible business practices. Our suppliers are required to sign a Supplier Code of Conduct that obligates them to conduct their business in compliance with various laws and ethical business practices including, but not limited to, laws that prohibit slavery and human trafficking. If a supplier fails to do so, we may terminate our business relationship and pursue other legal remedies against the supplier.
              </p>

              <p className="text-[14px] leading-relaxed">
                Additionally, the Company maintains internal accountability standards and procedures regarding employee compliance with applicable laws, which includes any laws regarding slavery and human trafficking.
              </p>

              <p className="text-[14px] leading-relaxed">
                The Company produces a confidential, annual compliance report and submits the report to its executive leadership and advisory board so that they may take corrective action and improve the Company&apos;s internal controls and policies as they deem necessary.
              </p>
            </div>

            {/* Direct Link to Supplier Code of Conduct matching screenshot */}
            <div className="p-5 rounded-2xl bg-neutral-100/80 border border-neutral-200">
              <p className="text-[14px] text-neutral-800">
                Learn more about SmartFoneDoctor&apos;s{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("code")}
                  className="font-bold underline text-neutral-900 hover:text-sfd-teal transition-colors cursor-pointer"
                >
                  Supplier Code of Conduct here
                </button>
                .
              </p>
            </div>

          </div>
        )}

        {/* Return to Home & Book Repair CTA */}
        <div className="mt-12 pt-6 border-t border-neutral-200 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-sfd-teal transition-colors"
          >
            ← Return to Home
          </Link>
          <Link
            href="/schedule-repair"
            className="px-6 py-2.5 rounded-full bg-sfd-teal hover:bg-sfd-dark text-white text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer"
          >
            Book a Repair
          </Link>
        </div>

      </div>

      {/* Global Footer */}
      <Footer />
    </main>
  );
}

