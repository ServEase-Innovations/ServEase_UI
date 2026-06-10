import { publicAsset } from "src/utils/publicAsset";

export type ServiceTypeKey = "COOK" | "MAID" | "NANNY";

export type ServiceMenuItem = {
  type: ServiceTypeKey;
  labelKey: "homeCook" | "cleaningHelp" | "caregiver";
  descriptionKey: "homeCookDesc" | "cleaningHelpDesc" | "caregiverDesc";
  icon: string;
};

export const SERVICE_MENU_ITEMS: ServiceMenuItem[] = [
  {
    type: "COOK",
    labelKey: "homeCook",
    descriptionKey: "homeCookDesc",
    icon: publicAsset("CookNew.png"),
  },
  {
    type: "MAID",
    labelKey: "cleaningHelp",
    descriptionKey: "cleaningHelpDesc",
    icon: publicAsset("MaidNew.png"),
  },
  {
    type: "NANNY",
    labelKey: "caregiver",
    descriptionKey: "caregiverDesc",
    icon: publicAsset("NannyNew.png"),
  },
];
