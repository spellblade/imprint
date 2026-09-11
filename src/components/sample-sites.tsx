import type { ReactNode } from "react";

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  required,
  placeholder,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="site-label" htmlFor={name}>
        {label}
        {required ? <span className="opacity-50"> *</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        placeholder={placeholder}
        className="site-input"
        suppressHydrationWarning
      />
      {hint ? <p className="site-hint mt-1">{hint}</p> : null}
    </div>
  );
}

function Area({
  label,
  name,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="sm:col-span-2">
      <label className="site-label" htmlFor={name}>
        {label}
        {required ? " *" : ""}
      </label>
      <textarea
        id={name}
        name={name}
        required={required}
        placeholder={placeholder}
        className="site-input"
        rows={4}
        suppressHydrationWarning
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  options,
  required,
}: {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <div>
      <label className="site-label" htmlFor={name}>
        {label}
        {required ? " *" : ""}
      </label>
      <select id={name} name={name} required={required} className="site-input" suppressHydrationWarning>
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function SiteShell({
  kicker,
  title,
  subtitle,
  children,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
      <p className="text-[11px] font-semibold tracking-[0.16em] uppercase opacity-70">
        {kicker}
      </p>
      <h1 className="mt-2 font-display text-3xl leading-tight font-medium">
        {title}
      </h1>
      <p className="mt-2 max-w-xl text-sm opacity-70">{subtitle}</p>
      <form
        className="site-card mt-8 p-5 sm:p-7"
        onSubmit={(e) => e.preventDefault()}
      >
        {children}
      </form>
    </div>
  );
}

function Grid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

export function CareersSite() {
  return (
    <SiteShell
      kicker="Northwind Studio · Careers"
      title="Product Designer"
      subtitle="Tell us who you are. Custom questions sit alongside the usual contact fields."
    >
      <Grid>
        <Field label="First name" name="first_name" autoComplete="given-name" required />
        <Field label="Last name" name="last_name" autoComplete="family-name" required />
        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <Field label="Phone" name="phone" type="tel" autoComplete="tel" />
        <Field label="LinkedIn" name="linkedin" placeholder="https://linkedin.com/in/…" />
        <Field label="Portfolio URL" name="portfolio" placeholder="https://" />
        <Field
          label="Years of experience"
          name="years_experience"
          type="number"
          hint="Full-time product design roles."
        />
        <SelectField
          label="Work authorization"
          name="work_auth"
          required
          options={["US Citizen", "Green Card", "H-1B", "Need sponsorship", "Other"]}
        />
        <Field
          label="Desired salary (USD)"
          name="desired_salary"
          placeholder="e.g. 165000"
        />
        <SelectField
          label="How did you hear about us?"
          name="referral_source"
          options={["LinkedIn", "Colleague", "Northwind site", "Twitter / X", "Other"]}
        />
        <Area
          label="Cover letter"
          name="cover_letter"
          placeholder="A short note on why this role."
        />
      </Grid>
      <label className="mt-5 flex items-start gap-2 text-sm opacity-80">
        <input type="checkbox" name="terms" className="mt-1 size-4" suppressHydrationWarning />
        I agree to the Northwind applicant privacy notice.
      </label>
      <button
        type="submit"
        className="mt-6 h-11 rounded-xl bg-[#2c2a27] px-5 text-sm font-medium text-[#f6f3ee]"
      >
        Submit application
      </button>
    </SiteShell>
  );
}

export function CheckoutSite() {
  return (
    <SiteShell
      kicker="Harbor Market"
      title="Checkout"
      subtitle="Walnut cutting board · qty 1 · $86. Shipping identity only — card fields are left alone."
    >
      <p className="mb-4 text-xs font-semibold tracking-wide uppercase opacity-60">
        Shipping
      </p>
      <Grid>
        <Field label="Full name" name="ship_name" autoComplete="name" required />
        <Field label="Email" name="ship_email" type="email" autoComplete="email" required />
        <Field label="Phone" name="ship_phone" type="tel" autoComplete="tel" />
        <Field label="Country" name="ship_country" autoComplete="country-name" />
        <Field
          label="Street address"
          name="ship_address"
          autoComplete="address-line1"
          required
        />
        <Field
          label="Apartment, suite"
          name="ship_address2"
          autoComplete="address-line2"
        />
        <Field label="City" name="ship_city" autoComplete="address-level2" required />
        <Field label="State" name="ship_state" autoComplete="address-level1" />
        <Field label="ZIP" name="ship_zip" autoComplete="postal-code" />
        <Area
          label="Delivery instructions"
          name="delivery_notes"
          placeholder="Gate code, leave at door…"
        />
      </Grid>
      <p className="mt-6 mb-4 text-xs font-semibold tracking-wide uppercase opacity-60">
        Payment
      </p>
      <Grid>
        <Field
          label="Card number"
          name="cc-number"
          autoComplete="cc-number"
          placeholder="•••• •••• •••• ••••"
        />
        <Field label="Expiry" name="cc-exp" autoComplete="cc-exp" placeholder="MM / YY" />
        <Field label="CVC" name="cvc" autoComplete="cc-csc" placeholder="123" />
        <Field label="Name on card" name="cc-name" autoComplete="cc-name" />
      </Grid>
      <button
        type="submit"
        className="mt-6 h-11 rounded-xl bg-[#3a332c] px-5 text-sm font-medium text-[#fbf7f1]"
      >
        Place order
      </button>
    </SiteShell>
  );
}

export function CivicSite() {
  return (
    <SiteShell
      kicker="Consulate of Alder · Form VS-14"
      title="Short-stay visa"
      subtitle="Official fields sit next to ones Imprint has never seen. It will ask before inventing anything."
    >
      <Grid>
        <Field label="Given names" name="given_names" autoComplete="given-name" required />
        <Field label="Surname" name="surname" autoComplete="family-name" required />
        <Field label="Date of birth" name="dob" type="date" autoComplete="bday" required />
        <Field label="Nationality" name="nationality" required />
        <Field
          label="Passport number"
          name="passport_number"
          required
          hint="Imprint will ask — this is not in the vault yet."
        />
        <Field label="Passport expiry" name="passport_expiry" type="date" />
        <Field label="Email" name="contact_email" type="email" autoComplete="email" />
        <Field label="Telephone" name="contact_phone" type="tel" autoComplete="tel" />
        <SelectField
          label="Purpose of travel"
          name="purpose"
          required
          options={["Tourism", "Business", "Family visit", "Study", "Transit"]}
        />
        <Field label="Date of entry" name="entry_date" type="date" />
        <Field
          label="Previous visa number"
          name="prev_visa"
          placeholder="Leave blank if none"
        />
        <Area
          label="Address while in Alder"
          name="stay_address"
          placeholder="Hotel or host address"
        />
      </Grid>
      <button
        type="submit"
        className="mt-6 h-11 rounded-xl bg-[#243447] px-5 text-sm font-medium text-[#f7f9fb]"
      >
        File application
      </button>
    </SiteShell>
  );
}

export function ClinicSite() {
  return (
    <SiteShell
      kicker="Oak Street Clinic"
      title="New patient intake"
      subtitle="Identity, insurance, and emergency contact. Allergies are asked, never guessed."
    >
      <Grid>
        <Field label="Legal first name" name="legal_first" autoComplete="given-name" required />
        <Field label="Legal last name" name="legal_last" autoComplete="family-name" required />
        <Field label="Date of birth" name="birth_date" type="date" autoComplete="bday" />
        <Field label="Phone" name="mobile" type="tel" autoComplete="tel" />
        <Field label="Email" name="patient_email" type="email" autoComplete="email" />
        <Field label="Street address" name="home_street" autoComplete="address-line1" />
        <Field label="City" name="home_city" autoComplete="address-level2" />
        <Field label="State" name="home_state" autoComplete="address-level1" />
        <Field label="ZIP" name="home_zip" autoComplete="postal-code" />
        <Field
          label="Insurance provider"
          name="insurance_provider"
          placeholder="e.g. Blue Shield"
        />
        <Field
          label="Member ID"
          name="member_id"
          hint="Not stored in the demo vault."
        />
        <Field label="Emergency contact name" name="emerg_name" />
        <Field label="Emergency contact phone" name="emerg_phone" type="tel" />
        <Area
          label="Allergies"
          name="allergies"
          placeholder="Medications, foods, latex…"
        />
      </Grid>
      <button
        type="submit"
        className="mt-6 h-11 rounded-xl bg-[#2a3d36] px-5 text-sm font-medium text-[#fbfdfb]"
      >
        Save intake
      </button>
    </SiteShell>
  );
}

export function SignupSite() {
  return (
    <SiteShell
      kicker="Lumen Labs"
      title="Set up your workspace"
      subtitle="A product onboarding form mixing profile data with questions Imprint has to learn."
    >
      <Grid>
        <Field label="Full name" name="full_name" autoComplete="name" required />
        <Field label="Work email" name="work_email" type="email" autoComplete="email" required />
        <Field label="Company" name="company" autoComplete="organization" />
        <Field label="Role" name="role" autoComplete="organization-title" />
        <SelectField
          label="Team size"
          name="team_size"
          options={["Just me", "2–10", "11–50", "51–200", "200+"]}
        />
        <SelectField
          label="How will you use Lumen?"
          name="use_case"
          options={[
            "Design ops",
            "Product research",
            "Customer success",
            "Internal tools",
            "Other",
          ]}
        />
        <Field label="Website" name="company_site" autoComplete="url" />
        <Area
          label="What are you hoping to solve?"
          name="hope_to_solve"
          placeholder="A sentence is enough."
        />
      </Grid>
      <label className="mt-5 flex items-start gap-2 text-sm opacity-80">
        <input type="checkbox" name="updates" className="mt-1 size-4" suppressHydrationWarning />
        Send product updates to this email.
      </label>
      <button
        type="submit"
        className="mt-6 h-11 rounded-xl bg-[#ecece8] px-5 text-sm font-medium text-[#101114]"
      >
        Create workspace
      </button>
    </SiteShell>
  );
}

export const SITE_VIEWS = {
  careers: CareersSite,
  checkout: CheckoutSite,
  civic: CivicSite,
  clinic: ClinicSite,
  signup: SignupSite,
};
