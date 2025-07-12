import { useTranslation } from "react-i18next";
import {
  ChatIcon,
  DocumentTextIcon,
  UserGroupIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/outline";
import { SparklesIcon } from "@heroicons/react/solid";

interface LearnMoreProps {
  highlightedCompanies?: Array<{
    name: string;
    description: string;
    tags: React.ReactNode;
  }>;
  setStartedFirstMessage: () => void;
}

export const LearnMore = ({
  highlightedCompanies = [],
  setStartedFirstMessage,
}: LearnMoreProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col justify-center items-center min-h-full p-8 animate-fade-in-up">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="relative mb-8">
          <div className="glass rounded-3xl p-8 shadow-modern">
            <SparklesIcon className="w-16 h-16 gradient-primary rounded-2xl p-3 mx-auto mb-4" />
            <h1
              className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4"
              data-testid="learn-more-header">
              {t("messages.messages_empty_header")}
            </h1>
            <p className="text-xl text-gray-600 max-w-md mx-auto leading-relaxed">
              Start meaningful conversations with end-to-end encryption powered
              by XMTP
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 w-full max-w-4xl mb-12">
        <div className="glass rounded-2xl p-6 shadow-elegant hover:shadow-modern transition-all duration-300 group">
          <div className="gradient-secondary w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ChatIcon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">
            {t("messages.messages_empty_cta_1_header")}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {t("messages.messages_empty_cta_1_subheader")}
          </p>
        </div>

        <div className="glass rounded-2xl p-6 shadow-elegant hover:shadow-modern transition-all duration-300 group">
          <div className="gradient-secondary w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <UserGroupIcon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">
            Join Community
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Connect with developers and users in our growing community
          </p>
        </div>

        <div className="glass rounded-2xl p-6 shadow-elegant hover:shadow-modern transition-all duration-300 group">
          <div className="gradient-secondary w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <DocumentTextIcon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">
            Documentation
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Learn how to integrate XMTP into your applications
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <h2
          className="text-2xl font-bold mb-6 text-gray-900"
          data-testid="get-started-header">
          {t("messages.messages_empty_subheader")}
        </h2>

        <button
          onClick={setStartedFirstMessage}
          className="gradient-primary text-white px-8 py-4 rounded-2xl font-semibold shadow-elegant hover:shadow-modern transition-all duration-300 hover:scale-105 flex items-center gap-3 mx-auto group"
          data-testid="message">
          <PaperAirplaneIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          Send your first message
        </button>

        <div className="flex gap-4 mt-6 justify-center">
          <a
            href="https://community.xmtp.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            data-testid="community">
            Join Community →
          </a>
          <a
            href="https://docs.xmtp.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            data-testid="docs">
            Read Docs →
          </a>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 gradient-primary rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 gradient-secondary rounded-full opacity-10 blur-3xl"></div>
      </div>
    </div>
  );
};
