import "dotenv/config";
import {
  Configuration,
  PersonsApi,
  CreatePersonRequest,
} from "@rangesecurity/faraday-sdk";

const baseUrl = process.env.FARADAY_BASE_URL!;
const token = process.env.FARADAY_API_KEY!;

const cfg = new Configuration({
  basePath: baseUrl,
  accessToken: token,
  headers: { accept: "application/json" },
});

const api = new PersonsApi(cfg);

const params: CreatePersonRequest = {
  createPersonPayload: {
    kind: "natural",
    name_identifiers: [
      {
        is_legal: true,
        kind: "LEGL",
        primary_identifier: "Example",
        secondary_identifier: "Alice",
      },
    ],
    national_identifiers: [
      {
        country_of_issue: "GB",
        identifier_type: "NINO",
        national_identifier: "AB123456C",
      },
    ],
    addresses: [
      {
        address_type: "HOME",
        country: "GB",
        street_name: "1 Regents Park",
        town_name: "London",
      },
    ],
    account_numbers: [
      {
        account_number: "0x1234567890abcdef1234567890abcdef12345678",
      },
    ],
    person: {
      country_of_residence: "GB",
      customer_identification: "ALICE-001",
      date_of_birth: new Date("1990-07-15"),
      place_of_birth: "London",
    },
  },
};

(async () => {
  try {
    const res = await api.createPerson(params);
    console.dir(res, { depth: null });
  } catch (e: any) {
    console.error("Error creating person:");
    const body = e?.response?.data ?? e?.message;
    console.error(body);
  }
})();
