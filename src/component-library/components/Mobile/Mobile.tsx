const LinkEle = ({ url, text }: { url: string; text: string }) => (
  <a
    href={url}
    target="_blank"
    className="text-indigo-600 m-1 pb-4 cursor-pointer font-bold"
    rel="noreferrer">
    {text}
  </a>
);

export const Mobile = () => (
  <div className="border-t-2 border-gray-200 bg-white py-8 px-6 md:px-8">
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
      <div className="mb-4 md:mb-0">
        <img
          src="/xmtp-logo.png"
          alt="zkλ logo"
          className="w-8 h-8 md:w-10 md:h-10 mb-2"
        />
        <p className="text-sm text-gray-600 leading-relaxed">
          This is a reference app built with zkλ, an open protocol for private
          web3 messaging.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          className="text-gray-700 hover:text-gray-900 pb-4 cursor-pointer font-bold transition-colors"
          onClick={() =>
            window.open(
              "https://github.com/xmtp-labs/xmtp-react-native",
              "_blank",
            )
          }>
          View React Native
        </button>
        <button
          className="text-gray-700 hover:text-gray-900 pb-4 cursor-pointer font-bold transition-colors"
          onClick={() =>
            window.open("https://github.com/xmtp-labs/xmtp-inbox-web", "_blank")
          }>
          View Web App
        </button>
      </div>
    </div>
  </div>
);
