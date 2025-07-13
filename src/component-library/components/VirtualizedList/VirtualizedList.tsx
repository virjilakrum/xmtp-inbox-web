import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { classNames } from "../../../helpers/classNames";

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number, isVisible: boolean) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  stickyIndices?: number[];
  scrollToIndex?: number;
  scrollToAlignment?: "start" | "center" | "end";
}

interface VirtualizedListState {
  scrollTop: number;
  isScrolling: boolean;
  scrollDirection: "forward" | "backward" | null;
}

export const VirtualizedList = <T,>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  keyExtractor,
  overscan = 5,
  className = "",
  onScroll,
  onEndReached,
  endReachedThreshold = 0.8,
  loading = false,
  loadingComponent,
  emptyComponent,
  stickyIndices = [],
  scrollToIndex,
  scrollToAlignment = "start",
}: VirtualizedListProps<T>) => {
  const [state, setState] = useState<VirtualizedListState>({
    scrollTop: 0,
    isScrolling: false,
    scrollDirection: null,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTop = useRef(0);
  const endReachedRef = useRef(false);

  const totalHeight = useMemo(
    () => items.length * itemHeight,
    [items.length, itemHeight],
  );

  const visibleRange = useMemo(() => {
    const { scrollTop } = state;
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length,
    );

    return {
      startIndex: Math.max(0, startIndex - overscan),
      endIndex: Math.min(items.length, endIndex + overscan),
    };
  }, [state.scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange;
    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      key: keyExtractor(item, startIndex + index),
    }));
  }, [items, visibleRange, keyExtractor]);

  const stickyItems = useMemo(() => {
    return stickyIndices
      .map((index) => ({
        item: items[index],
        index,
        key: keyExtractor(items[index], index),
      }))
      .filter((item) => item.item !== undefined);
  }, [items, stickyIndices, keyExtractor]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const scrollTop = e.currentTarget.scrollTop;
      const scrollDirection =
        scrollTop > lastScrollTop.current ? "forward" : "backward";

      setState((prev) => ({
        ...prev,
        scrollTop,
        isScrolling: true,
        scrollDirection,
      }));

      lastScrollTop.current = scrollTop;

      if (onScroll) {
        onScroll(scrollTop);
      }

      // Check if we've reached the end
      if (onEndReached && !endReachedRef.current) {
        const scrollHeight = e.currentTarget.scrollHeight;
        const clientHeight = e.currentTarget.clientHeight;
        const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

        if (scrollPercentage >= endReachedThreshold) {
          endReachedRef.current = true;
          onEndReached();
        }
      }

      // Clear scrolling state after a delay
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setState((prev) => ({
          ...prev,
          isScrolling: false,
          scrollDirection: null,
        }));
      }, 150);
    },
    [onScroll, onEndReached, endReachedThreshold],
  );

  const scrollToItem = useCallback(
    (index: number, alignment: "start" | "center" | "end" = "start") => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const itemTop = index * itemHeight;

      let scrollTop: number;

      switch (alignment) {
        case "start":
          scrollTop = itemTop;
          break;
        case "center":
          scrollTop = itemTop - (containerHeight - itemHeight) / 2;
          break;
        case "end":
          scrollTop = itemTop - containerHeight + itemHeight;
          break;
        default:
          scrollTop = itemTop;
      }

      container.scrollTo({
        top: Math.max(0, Math.min(scrollTop, totalHeight - containerHeight)),
        behavior: "smooth",
      });
    },
    [itemHeight, containerHeight, totalHeight],
  );

  // Handle scroll to index prop
  useEffect(() => {
    if (
      scrollToIndex !== undefined &&
      scrollToIndex >= 0 &&
      scrollToIndex < items.length
    ) {
      scrollToItem(scrollToIndex, scrollToAlignment);
    }
  }, [scrollToIndex, scrollToAlignment, scrollToItem, items.length]);

  // Reset end reached flag when items change
  useEffect(() => {
    endReachedRef.current = false;
  }, [items]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  if (items.length === 0 && !loading) {
    return (
      emptyComponent || (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📭</div>
            <p>No items to display</p>
          </div>
        </div>
      )
    );
  }

  return (
    <div
      ref={containerRef}
      className={classNames("virtualized-list overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      role="list"
      aria-label="Virtualized list">
      {/* Sticky Items */}
      {stickyItems.map(({ item, index, key }) => (
        <div
          key={`sticky-${key}`}
          className="sticky top-0 z-10 bg-white"
          style={{ height: itemHeight }}>
          {renderItem(item, index, true)}
        </div>
      ))}

      {/* Spacer for items before visible range */}
      {visibleRange.startIndex > 0 && (
        <div style={{ height: visibleRange.startIndex * itemHeight }} />
      )}

      {/* Visible Items */}
      {visibleItems.map(({ item, index, key }) => (
        <div
          key={key}
          style={{
            height: itemHeight,
            transform: `translateY(${index * itemHeight}px)`,
          }}
          className="absolute w-full">
          {renderItem(item, index, true)}
        </div>
      ))}

      {/* Spacer for items after visible range */}
      {visibleRange.endIndex < items.length && (
        <div
          style={{
            height: (items.length - visibleRange.endIndex) * itemHeight,
          }}
        />
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          {loadingComponent || (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-sm text-gray-500">Loading...</span>
            </div>
          )}
        </div>
      )}

      {/* Total height spacer */}
      <div style={{ height: totalHeight, position: "relative" }} />
    </div>
  );
};

// Enhanced conversation list with virtualization
interface ConversationListItem {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  avatar?: string;
  isOnline?: boolean;
  isTyping?: boolean;
}

interface VirtualizedConversationListProps {
  conversations: ConversationListItem[];
  onConversationClick: (conversation: ConversationListItem) => void;
  selectedConversationId?: string;
  searchQuery?: string;
  loading?: boolean;
  onLoadMore?: () => void;
  height?: number;
}

export const VirtualizedConversationList: React.FC<
  VirtualizedConversationListProps
> = ({
  conversations,
  onConversationClick,
  selectedConversationId,
  searchQuery = "",
  loading = false,
  onLoadMore,
  height = 400,
}) => {
  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;

    const query = searchQuery.toLowerCase();
    return conversations.filter(
      (conversation) =>
        conversation.name.toLowerCase().includes(query) ||
        conversation.lastMessage.toLowerCase().includes(query),
    );
  }, [conversations, searchQuery]);

  const renderConversationItem = useCallback(
    (conversation: ConversationListItem, index: number, isVisible: boolean) => {
      const isSelected = conversation.id === selectedConversationId;

      return (
        <div
          className={classNames(
            "flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150",
            isSelected ? "bg-blue-50 border-r-2 border-blue-500" : "",
          )}
          onClick={() => onConversationClick(conversation)}
          role="listitem"
          aria-selected={isSelected}>
          {/* Avatar */}
          <div className="relative flex-shrink-0 mr-3">
            {conversation.avatar ? (
              <img
                src={conversation.avatar}
                alt={conversation.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                {conversation.name.charAt(0).toUpperCase()}
              </div>
            )}
            {conversation.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {conversation.name}
              </h3>
              <span className="text-xs text-gray-500">
                {conversation.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-gray-500 truncate">
                {conversation.isTyping ? (
                  <span className="text-blue-500 italic">Typing...</span>
                ) : (
                  conversation.lastMessage
                )}
              </p>
              {conversation.unreadCount > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                  {conversation.unreadCount > 99
                    ? "99+"
                    : conversation.unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    },
    [selectedConversationId, onConversationClick],
  );

  const keyExtractor = useCallback(
    (conversation: ConversationListItem, index: number) => {
      return conversation.id;
    },
    [],
  );

  const handleEndReached = useCallback(() => {
    if (onLoadMore) {
      onLoadMore();
    }
  }, [onLoadMore]);

  return (
    <VirtualizedList
      items={filteredConversations}
      itemHeight={70}
      containerHeight={height}
      renderItem={renderConversationItem}
      keyExtractor={keyExtractor}
      onEndReached={handleEndReached}
      endReachedThreshold={0.9}
      loading={loading}
      emptyComponent={
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">💬</div>
            <p>No conversations found</p>
            {searchQuery && (
              <p className="text-sm mt-1">Try adjusting your search terms</p>
            )}
          </div>
        </div>
      }
      className="conversation-list"
    />
  );
};
