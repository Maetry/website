import type { Metadata } from "next";

import ClientInvitePage from "./ClientInvitePage";

export const metadata: Metadata = {
  title: "Maetry — Invite (Client)",
  robots: {
    index: false,
    follow: false,
  },
};

const ClientInvite = () => {
  return <ClientInvitePage />;
};

export default ClientInvite;
