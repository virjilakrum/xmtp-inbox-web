import { useEffect } from "react";
import { useClient } from "../hooks/useV3Hooks";
import { OnboardingPage } from "../component-library/pages/OnboardingPage/OnboardingPage";
import InboxPage from "./inbox";

const Index = () => {
  const client = useClient();

  useEffect(() => {
    console.log("XMTP V3 client:", client);
  }, [client]);

  if (!client) {
    return <OnboardingPage step={1} />;
  }

  return <InboxPage />;
};

export default Index;
