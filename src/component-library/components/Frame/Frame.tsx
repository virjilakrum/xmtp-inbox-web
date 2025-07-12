import { ArrowCircleRightIcon } from "@heroicons/react/outline";
import type {
  OpenFrameButton,
  OpenFrameResult,
} from "@open-frames/proxy-client";
import { classNames } from "../../../helpers";
import { ButtonLoader } from "../Loaders/ButtonLoader";

type FrameProps = {
  image: string;
  title: string;
  textInput?: string;
  buttons: OpenFrameResult["buttons"];
  handleClick: (
    buttonNumber: number,
    action?: OpenFrameButton["action"],
  ) => Promise<void>;
  onTextInputChange: (value: string) => void;
  frameButtonUpdating: number;
  interactionsEnabled: boolean;
};

const FrameButtonContainer = ({
  label,
  isExternalLink,
  isFullWidth,
  isLoading,
  isDisabled,
  testId = "",
  clickHandler,
}: {
  testId?: string;
  label: string;
  isExternalLink: boolean;
  isFullWidth: boolean;
  isLoading: boolean;
  isDisabled: boolean;
  clickHandler: () => void;
}) => {
  const columnWidth = isFullWidth ? "col-span-2" : "col-span-1";

  const icon = isExternalLink ? <ArrowCircleRightIcon width={18} /> : null;

  return (
    <button
      type="button"
      onClick={clickHandler}
      data-testid={testId}
      disabled={isDisabled}
      className={classNames(
        columnWidth,
        // Modern styling
        "bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-400",
        "text-gray-700 hover:text-gray-900",
        "focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2",
        "font-semibold text-sm",
        "min-w-[20%]",
        "rounded-xl shadow-sm hover:shadow-elegant",
        "flex items-center justify-center",
        "px-4 py-3",
        "transition-all duration-200 ease-out",
        "transform hover:scale-105 active:scale-95",
        "group relative overflow-hidden",
        isDisabled ? "opacity-50 cursor-not-allowed" : "",
      )}
      aria-label={label}>
      {/* Hover background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 -skew-x-12" />

      <div className="flex justify-center items-center space-x-2 relative z-10">
        <div className="transition-transform duration-200 group-hover:translate-x-0.5">
          {label}
        </div>
        {isLoading ? (
          <ButtonLoader color="primary" size="small" />
        ) : (
          icon && (
            <div className="transition-transform duration-200 group-hover:translate-x-0.5">
              {icon}
            </div>
          )
        )}
      </div>
    </button>
  );
};

type ButtonsContainerProps = Pick<
  FrameProps,
  "frameButtonUpdating" | "handleClick"
> & {
  buttons: NonNullable<OpenFrameResult["buttons"]>;
};

const ButtonsContainer = ({
  frameButtonUpdating,
  buttons,
  handleClick,
}: ButtonsContainerProps) => {
  if (Object.keys(buttons).length < 1 || Object.keys(buttons).length > 4) {
    return null;
  }
  // If there is only one button make it full-width
  const gridColumns =
    Object.keys(buttons).length === 1 ? "grid-cols-1" : "grid-cols-2";
  return (
    <div className={`grid ${gridColumns} gap-2 w-full pt-2`}>
      {Object.keys(buttons).map((key, index) => {
        const button = buttons[key];
        const buttonIndex = parseInt(key, 10);
        const clickHandler = () => {
          void handleClick(buttonIndex, button.action);
        };
        const isFullWidth = Object.keys(buttons).length === 3 && index === 2;
        return (
          <FrameButtonContainer
            key={button.label}
            isFullWidth={isFullWidth}
            label={button.label}
            isExternalLink={["post_redirect", "link"].includes(
              button.action || "",
            )}
            isLoading={frameButtonUpdating === buttonIndex}
            isDisabled={frameButtonUpdating > 0}
            clickHandler={clickHandler}
          />
        );
      })}
    </div>
  );
};

export const Frame = ({
  image,
  title,
  buttons,
  textInput,
  handleClick,
  onTextInputChange,
  frameButtonUpdating,
  interactionsEnabled,
}: FrameProps) => (
  <div className="px-6 md:px-8 py-4">
    {/* Frame Image */}
    <div className="relative mb-6 group">
      <img
        src={image}
        className="w-full max-h-80 rounded-2xl shadow-elegant hover:shadow-modern transition-all duration-300 transform group-hover:scale-[1.02]"
        alt={title}
      />
      {/* Image overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>

    {/* Text Input */}
    {!!textInput && interactionsEnabled && (
      <div className="mb-6">
        <input
          type="text"
          className="w-full h-12 px-4 py-3 border-2 border-gray-200 hover:border-gray-300 focus:border-gray-400 rounded-2xl shadow-sm focus:shadow-elegant transition-all duration-200 outline-none bg-white/80 backdrop-blur-sm font-medium"
          spellCheck="false"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          onChange={(e) =>
            onTextInputChange((e.target as HTMLInputElement).value)
          }
          placeholder={textInput}
        />
      </div>
    )}

    {/* Action Buttons */}
    <div className="flex flex-col items-center">
      {interactionsEnabled && buttons ? (
        <ButtonsContainer
          frameButtonUpdating={frameButtonUpdating}
          handleClick={handleClick}
          buttons={buttons}
        />
      ) : (
        <div className="glass rounded-2xl p-6 text-center">
          <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
              />
            </svg>
          </div>
          <span className="text-gray-600 font-medium">
            Frame interactions not supported
          </span>
        </div>
      )}
    </div>
  </div>
);
