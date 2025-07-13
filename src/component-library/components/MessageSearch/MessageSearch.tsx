import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { classNames } from "../../../helpers/classNames";
import { PillButton } from "../PillButton/PillButton";

export interface SearchResult {
  id: string;
  content: string;
  timestamp: Date;
  author: string;
  conversationId: string;
  conversationName: string;
  matchedText: string;
  matchIndex: number;
  context: {
    before: string;
    after: string;
  };
}

export interface SearchFilters {
  author?: string;
  conversation?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  messageType?: "text" | "image" | "file" | "all";
  sortBy?: "relevance" | "date" | "author";
  sortOrder?: "asc" | "desc";
}

interface MessageSearchProps {
  onSearch: (query: string, filters: SearchFilters) => Promise<SearchResult[]>;
  onResultClick: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  maxResults?: number;
  highlightColor?: string;
  showFilters?: boolean;
  showResultCount?: boolean;
  authors?: string[];
  conversations?: Array<{ id: string; name: string }>;
}

interface SearchState {
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  hasSearched: boolean;
  error: string | null;
  selectedIndex: number;
  filters: SearchFilters;
  showAdvancedFilters: boolean;
}

const HighlightedText: React.FC<{
  text: string;
  query: string;
  highlightColor?: string;
}> = ({ text, query, highlightColor = "bg-yellow-200" }) => {
  const highlightedText = useMemo(() => {
    if (!query.trim()) return text;

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    const parts = text.split(regex);

    return parts.map((part, index) => {
      const isMatch = regex.test(part);
      return isMatch ? (
        <mark key={index} className={`${highlightColor} px-1 rounded`}>
          {part}
        </mark>
      ) : (
        part
      );
    });
  }, [text, query, highlightColor]);

  return <span>{highlightedText}</span>;
};

const SearchResult: React.FC<{
  result: SearchResult;
  query: string;
  onClick: (result: SearchResult) => void;
  isSelected: boolean;
  highlightColor?: string;
}> = ({ result, query, onClick, isSelected, highlightColor }) => {
  return (
    <div
      className={classNames(
        "p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors duration-150",
        isSelected ? "bg-blue-50 border-l-4 border-blue-500" : "",
      )}
      onClick={() => onClick(result)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-gray-900">
              {result.author}
            </span>
            <span className="text-xs text-gray-500">
              in {result.conversationName}
            </span>
            <span className="text-xs text-gray-400">
              {result.timestamp.toLocaleString()}
            </span>
          </div>

          <div className="text-sm text-gray-700 leading-relaxed">
            <span className="text-gray-500">{result.context.before}</span>
            <HighlightedText
              text={result.matchedText}
              query={query}
              highlightColor={highlightColor}
            />
            <span className="text-gray-500">{result.context.after}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MessageSearch: React.FC<MessageSearchProps> = ({
  onSearch,
  onResultClick,
  placeholder = "Search messages...",
  className = "",
  debounceMs = 300,
  maxResults = 50,
  highlightColor = "bg-yellow-200",
  showFilters = true,
  showResultCount = true,
  authors = [],
  conversations = [],
}) => {
  const [state, setState] = useState<SearchState>({
    query: "",
    results: [],
    isSearching: false,
    hasSearched: false,
    error: null,
    selectedIndex: -1,
    filters: {
      messageType: "all",
      sortBy: "relevance",
      sortOrder: "desc",
    },
    showAdvancedFilters: false,
  });

  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const performSearch = useCallback(
    async (query: string, filters: SearchFilters) => {
      if (!query.trim()) {
        setState((prev) => ({
          ...prev,
          results: [],
          hasSearched: false,
          error: null,
        }));
        return;
      }

      // Cancel previous search
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setState((prev) => ({
        ...prev,
        isSearching: true,
        error: null,
      }));

      try {
        const results = await onSearch(query, filters);

        setState((prev) => ({
          ...prev,
          results: results.slice(0, maxResults),
          isSearching: false,
          hasSearched: true,
          selectedIndex: -1,
        }));
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return; // Search was cancelled
        }

        setState((prev) => ({
          ...prev,
          isSearching: false,
          hasSearched: true,
          error: error instanceof Error ? error.message : "Search failed",
        }));
      }
    },
    [onSearch, maxResults],
  );

  const debouncedSearch = useCallback(
    (query: string, filters: SearchFilters) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        performSearch(query, filters);
      }, debounceMs);
    },
    [performSearch, debounceMs],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setState((prev) => ({
        ...prev,
        query,
      }));

      debouncedSearch(query, state.filters);
    },
    [debouncedSearch, state.filters],
  );

  const handleFilterChange = useCallback(
    (newFilters: Partial<SearchFilters>) => {
      const updatedFilters = { ...state.filters, ...newFilters };
      setState((prev) => ({
        ...prev,
        filters: updatedFilters,
      }));

      if (state.query.trim()) {
        debouncedSearch(state.query, updatedFilters);
      }
    },
    [state.filters, state.query, debouncedSearch],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setState((prev) => ({
          ...prev,
          selectedIndex: Math.min(
            prev.selectedIndex + 1,
            prev.results.length - 1,
          ),
        }));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setState((prev) => ({
          ...prev,
          selectedIndex: Math.max(prev.selectedIndex - 1, -1),
        }));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (state.selectedIndex >= 0 && state.results[state.selectedIndex]) {
          onResultClick(state.results[state.selectedIndex]);
        }
      } else if (e.key === "Escape") {
        setState((prev) => ({
          ...prev,
          query: "",
          results: [],
          hasSearched: false,
          selectedIndex: -1,
        }));
        searchInputRef.current?.blur();
      }
    },
    [state.selectedIndex, state.results, onResultClick],
  );

  const clearSearch = useCallback(() => {
    setState((prev) => ({
      ...prev,
      query: "",
      results: [],
      hasSearched: false,
      error: null,
      selectedIndex: -1,
    }));
    searchInputRef.current?.focus();
  }, []);

  const toggleAdvancedFilters = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showAdvancedFilters: !prev.showAdvancedFilters,
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const filteredResults = useMemo(() => {
    let results = [...state.results];

    // Apply sorting
    if (state.filters.sortBy === "date") {
      results.sort((a, b) => {
        const comparison = a.timestamp.getTime() - b.timestamp.getTime();
        return state.filters.sortOrder === "asc" ? comparison : -comparison;
      });
    } else if (state.filters.sortBy === "author") {
      results.sort((a, b) => {
        const comparison = a.author.localeCompare(b.author);
        return state.filters.sortOrder === "asc" ? comparison : -comparison;
      });
    }

    return results;
  }, [state.results, state.filters.sortBy, state.filters.sortOrder]);

  return (
    <div className={classNames("message-search", className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <input
          ref={searchInputRef}
          type="text"
          value={state.query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {state.query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg
              className="h-5 w-5 text-gray-400 hover:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <select
                value={state.filters.messageType}
                onChange={(e) =>
                  handleFilterChange({ messageType: e.target.value as any })
                }
                className="text-sm border border-gray-300 rounded px-2 py-1">
                <option value="all">All types</option>
                <option value="text">Text only</option>
                <option value="image">Images</option>
                <option value="file">Files</option>
              </select>

              <select
                value={state.filters.sortBy}
                onChange={(e) =>
                  handleFilterChange({ sortBy: e.target.value as any })
                }
                className="text-sm border border-gray-300 rounded px-2 py-1">
                <option value="relevance">Relevance</option>
                <option value="date">Date</option>
                <option value="author">Author</option>
              </select>

              <select
                value={state.filters.sortOrder}
                onChange={(e) =>
                  handleFilterChange({ sortOrder: e.target.value as any })
                }
                className="text-sm border border-gray-300 rounded px-2 py-1">
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
              </select>
            </div>

            <button
              onClick={toggleAdvancedFilters}
              className="text-sm text-blue-600 hover:text-blue-800">
              {state.showAdvancedFilters ? "Hide" : "Show"} filters
            </button>
          </div>

          {state.showAdvancedFilters && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {authors.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Author
                    </label>
                    <select
                      value={state.filters.author || ""}
                      onChange={(e) =>
                        handleFilterChange({
                          author: e.target.value || undefined,
                        })
                      }
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1">
                      <option value="">All authors</option>
                      {authors.map((author) => (
                        <option key={author} value={author}>
                          {author}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {conversations.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Conversation
                    </label>
                    <select
                      value={state.filters.conversation || ""}
                      onChange={(e) =>
                        handleFilterChange({
                          conversation: e.target.value || undefined,
                        })
                      }
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1">
                      <option value="">All conversations</option>
                      {conversations.map((conv) => (
                        <option key={conv.id} value={conv.id}>
                          {conv.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {state.isSearching && (
        <div className="mt-4 flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-sm text-gray-500">Searching...</span>
        </div>
      )}

      {/* Error State */}
      {state.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-red-400 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-red-800">{state.error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {state.hasSearched && !state.isSearching && !state.error && (
        <div className="mt-4">
          {showResultCount && (
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">
                {filteredResults.length} result
                {filteredResults.length !== 1 ? "s" : ""}
                {state.query && <span> for "{state.query}"</span>}
              </p>
            </div>
          )}

          {filteredResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🔍</div>
              <p>No messages found</p>
              <p className="text-sm mt-1">
                Try adjusting your search terms or filters
              </p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
              {filteredResults.map((result, index) => (
                <SearchResult
                  key={result.id}
                  result={result}
                  query={state.query}
                  onClick={onResultClick}
                  isSelected={index === state.selectedIndex}
                  highlightColor={highlightColor}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
