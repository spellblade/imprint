import type { Profile, SampleSite, VaultField } from "@/lib/types";

function field(
  key: string,
  label: string,
  value: string,
  group: VaultField["group"],
  sensitive = false,
): VaultField {
  return { id: key, key, label, value, group, sensitive };
}

export const DEMO_PROFILE: Profile = {
  id: "personal",
  name: "Personal",
  fields: [
    field("firstName", "First name", "Maya", "identity"),
    field("lastName", "Last name", "Ellison", "identity"),
    field("fullName", "Full name", "Maya Ellison", "identity"),
    field("dob", "Date of birth", "1993-04-17", "identity"),
    field("nationality", "Nationality", "United States", "identity"),
    field("email", "Email", "maya.ellison@example.com", "contact"),
    field("phone", "Phone", "+1 415 555 0142", "contact"),
    field("address1", "Street address", "1847 Folsom Street", "address"),
    field("address2", "Apartment, suite", "Apt 4B", "address"),
    field("city", "City", "San Francisco", "address"),
    field("state", "State / region", "CA", "address"),
    field("zip", "ZIP / postal code", "94103", "address"),
    field("country", "Country", "United States", "address"),
    field("company", "Company", "Northwind Studio", "work"),
    field("jobTitle", "Job title", "Product Designer", "work"),
    field("linkedin", "LinkedIn", "https://linkedin.com/in/mayaellison", "work"),
    field("website", "Portfolio", "https://mayaellison.design", "work"),
    field("github", "GitHub", "mayaellison", "work"),
    field("yearsExperience", "Years of experience", "7", "custom"),
    field("workAuth", "Work authorization", "US Citizen", "custom"),
    field(
      "emergencyName",
      "Emergency contact name",
      "Julian Ellison",
      "custom",
    ),
    field(
      "emergencyPhone",
      "Emergency contact phone",
      "+1 415 555 0198",
      "custom",
    ),
  ],
};

export const WORK_PROFILE: Profile = {
  id: "work",
  name: "Work",
  fields: DEMO_PROFILE.fields.map((f) => {
    if (f.key === "email")
      return { ...f, id: "work-email", value: "maya@northwind.studio" };
    if (f.key === "phone")
      return { ...f, id: "work-phone", value: "+1 415 555 0108" };
    return { ...f, id: `work-${f.key}` };
  }),
};

export const SAMPLE_SITES: SampleSite[] = [
  {
    id: "careers",
    name: "Northwind Careers",
    host: "careers.northwind.studio",
    path: "/apply/product-designer",
    title: "Product Designer",
    blurb: "A job application with custom hiring fields.",
    theme: "careers",
  },
  {
    id: "checkout",
    name: "Harbor Market",
    host: "harbor.market",
    path: "/checkout",
    title: "Checkout",
    blurb: "Shipping details. Card numbers stay untouched.",
    theme: "checkout",
  },
  {
    id: "civic",
    name: "Consulate of Alder",
    host: "consulate.alder.gov",
    path: "/visa/short-stay",
    title: "Short-stay visa",
    blurb: "A civic form with passport and travel fields.",
    theme: "civic",
  },
  {
    id: "clinic",
    name: "Oak Street Clinic",
    host: "oakstreet.clinic",
    path: "/intake",
    title: "New patient intake",
    blurb: "Medical intake with insurance and emergency contact.",
    theme: "clinic",
  },
  {
    id: "signup",
    name: "Lumen Labs",
    host: "app.lumenlabs.io",
    path: "/onboarding",
    title: "Team onboarding",
    blurb: "A product signup with team and use-case questions.",
    theme: "signup",
  },
];

export const GROUP_LABELS: Record<VaultField["group"], string> = {
  identity: "Identity",
  contact: "Contact",
  address: "Address",
  work: "Work",
  custom: "Custom",
};
