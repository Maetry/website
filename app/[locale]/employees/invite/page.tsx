import type { Metadata } from "next";

import EmployeeInvitePage from "./EmployeeInvitePage";

export const metadata: Metadata = {
  title: "Maetry — Invite (Employee)",
  robots: {
    index: false,
    follow: false,
  },
};

const EmployeeInvite = () => {
  return <EmployeeInvitePage />;
};

export default EmployeeInvite;
