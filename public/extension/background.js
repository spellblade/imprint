chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["vault"], (res) => {
    if (!res.vault) {
      chrome.storage.local.set({
        vault: DEFAULT_VAULT,
        savedForms: [],
      });
    }
  });
});

const DEFAULT_VAULT = [
  { key: "firstName", label: "First name", value: "" },
  { key: "lastName", label: "Last name", value: "" },
  { key: "fullName", label: "Full name", value: "" },
  { key: "email", label: "Email", value: "" },
  { key: "phone", label: "Phone", value: "" },
  { key: "address1", label: "Street address", value: "" },
  { key: "address2", label: "Apartment, suite", value: "" },
  { key: "city", label: "City", value: "" },
  { key: "state", label: "State / region", value: "" },
  { key: "zip", label: "ZIP / postal code", value: "" },
  { key: "country", label: "Country", value: "" },
  { key: "company", label: "Company", value: "" },
  { key: "jobTitle", label: "Job title", value: "" },
];
