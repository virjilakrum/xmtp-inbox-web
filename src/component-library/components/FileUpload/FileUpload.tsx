import React, { useCallback, useState, useRef, useEffect } from "react";
import { classNames } from "../../../helpers/classNames";
import { PillButton } from "../PillButton/PillButton";
import { useToast } from "../Toast/Toast";

export interface FileUploadProgress {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
  uploadId: string;
}

export interface FileUploadConfig {
  maxFileSize?: number; // in bytes
  acceptedTypes?: string[];
  maxFiles?: number;
  allowMultiple?: boolean;
  onUploadProgress?: (progress: FileUploadProgress) => void;
  onUploadComplete?: (file: File, result: any) => void;
  onUploadError?: (file: File, error: string) => void;
  uploadFunction?: (
    file: File,
    onProgress: (progress: number) => void,
  ) => Promise<any>;
}

interface FileUploadProps {
  config: FileUploadConfig;
  onFilesSelected?: (files: File[]) => void;
  onUploadStart?: (files: File[]) => void;
  onAllUploadsComplete?: (results: any[]) => void;
  className?: string;
  disabled?: boolean;
}

interface FileItemProps {
  fileProgress: FileUploadProgress;
  onRemove: (uploadId: string) => void;
  onRetry: (uploadId: string) => void;
  disabled?: boolean;
}

const FileItem: React.FC<FileItemProps> = ({
  fileProgress,
  onRemove,
  onRetry,
  disabled,
}) => {
  const { file, progress, status, error } = fileProgress;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileName: string): string => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "svg":
        return "🖼️";
      case "pdf":
        return "📄";
      case "doc":
      case "docx":
        return "📝";
      case "mp4":
      case "avi":
      case "mov":
        return "🎬";
      case "mp3":
      case "wav":
        return "🎵";
      default:
        return "📁";
    }
  };

  const getStatusColor = (status: FileUploadProgress["status"]) => {
    switch (status) {
      case "pending":
        return "text-gray-500";
      case "uploading":
        return "text-blue-500";
      case "completed":
        return "text-green-500";
      case "error":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
      {/* File Icon */}
      <div className="flex-shrink-0 text-2xl mr-3">
        {getFileIcon(file.name)}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900 truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-500 ml-2">
            {formatFileSize(file.size)}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs">
            <span className={classNames("font-medium", getStatusColor(status))}>
              {status === "pending" && "Pending"}
              {status === "uploading" &&
                `Uploading... ${Math.round(progress)}%`}
              {status === "completed" && "Completed"}
              {status === "error" && "Error"}
            </span>
            {status === "uploading" && (
              <span className="text-gray-500">{Math.round(progress)}%</span>
            )}
          </div>

          {status !== "pending" && (
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div
                className={classNames(
                  "h-1.5 rounded-full transition-all duration-300",
                  status === "completed"
                    ? "bg-green-500"
                    : status === "error"
                      ? "bg-red-500"
                      : "bg-blue-500",
                )}
                style={{ width: `${status === "error" ? 100 : progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 ml-3 flex items-center space-x-2">
        {status === "error" && (
          <button
            onClick={() => onRetry(fileProgress.uploadId)}
            disabled={disabled}
            className="text-blue-500 hover:text-blue-700 text-sm font-medium disabled:opacity-50">
            Retry
          </button>
        )}
        <button
          onClick={() => onRemove(fileProgress.uploadId)}
          disabled={disabled}
          className="text-red-500 hover:text-red-700 disabled:opacity-50">
          <svg
            className="w-4 h-4"
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
      </div>
    </div>
  );
};

export const FileUpload: React.FC<FileUploadProps> = ({
  config,
  onFilesSelected,
  onUploadStart,
  onAllUploadsComplete,
  className = "",
  disabled = false,
}) => {
  const [files, setFiles] = useState<FileUploadProgress[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const {
    maxFileSize = 25 * 1024 * 1024, // 25MB default
    acceptedTypes = ["image/*", "application/pdf", "text/*"],
    maxFiles = 5,
    allowMultiple = true,
    onUploadProgress,
    onUploadComplete,
    onUploadError,
    uploadFunction,
  } = config;

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file size
      if (file.size > maxFileSize) {
        return `File size must be less than ${Math.round(maxFileSize / (1024 * 1024))}MB`;
      }

      // Check file type
      const isValidType = acceptedTypes.some((type) => {
        if (type.includes("*")) {
          const baseType = type.split("/")[0];
          return file.type.startsWith(baseType);
        }
        return file.type === type;
      });

      if (!isValidType) {
        return `File type not supported. Accepted types: ${acceptedTypes.join(", ")}`;
      }

      return null;
    },
    [maxFileSize, acceptedTypes],
  );

  const handleFileSelect = useCallback(
    (selectedFiles: FileList | null) => {
      if (!selectedFiles || selectedFiles.length === 0) return;

      const fileArray = Array.from(selectedFiles);

      // Check max files limit
      if (files.length + fileArray.length > maxFiles) {
        showToast({
          type: "error",
          title: "Too many files",
          message: `Maximum ${maxFiles} files allowed`,
        });
        return;
      }

      // Validate and process files
      const validFiles: File[] = [];
      const invalidFiles: { file: File; error: string }[] = [];

      fileArray.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          invalidFiles.push({ file, error });
        } else {
          validFiles.push(file);
        }
      });

      // Show errors for invalid files
      invalidFiles.forEach(({ file, error }) => {
        showToast({
          type: "error",
          title: "Invalid file",
          message: `${file.name}: ${error}`,
        });
      });

      // Add valid files to the list
      if (validFiles.length > 0) {
        const newFileProgress: FileUploadProgress[] = validFiles.map(
          (file) => ({
            file,
            progress: 0,
            status: "pending",
            uploadId: `upload-${Date.now()}-${Math.random()}`,
          }),
        );

        setFiles((prev) => [...prev, ...newFileProgress]);

        if (onFilesSelected) {
          onFilesSelected(validFiles);
        }
      }
    },
    [files.length, maxFiles, validateFile, showToast, onFilesSelected],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const droppedFiles = e.dataTransfer.files;
      handleFileSelect(droppedFiles);
    },
    [handleFileSelect],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files);
      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFileSelect],
  );

  const uploadFile = useCallback(
    async (fileProgress: FileUploadProgress) => {
      if (!uploadFunction) return;

      try {
        setFiles((prev) =>
          prev.map((f) =>
            f.uploadId === fileProgress.uploadId
              ? { ...f, status: "uploading" as const }
              : f,
          ),
        );

        const result = await uploadFunction(
          fileProgress.file,
          (progress: number) => {
            setFiles((prev) =>
              prev.map((f) =>
                f.uploadId === fileProgress.uploadId ? { ...f, progress } : f,
              ),
            );

            if (onUploadProgress) {
              onUploadProgress({ ...fileProgress, progress });
            }
          },
        );

        setFiles((prev) =>
          prev.map((f) =>
            f.uploadId === fileProgress.uploadId
              ? { ...f, status: "completed" as const, progress: 100 }
              : f,
          ),
        );

        if (onUploadComplete) {
          onUploadComplete(fileProgress.file, result);
        }

        showToast({
          type: "success",
          title: "Upload complete",
          message: `${fileProgress.file.name} uploaded successfully`,
        });

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";

        setFiles((prev) =>
          prev.map((f) =>
            f.uploadId === fileProgress.uploadId
              ? { ...f, status: "error" as const, error: errorMessage }
              : f,
          ),
        );

        if (onUploadError) {
          onUploadError(fileProgress.file, errorMessage);
        }

        showToast({
          type: "error",
          title: "Upload failed",
          message: `${fileProgress.file.name}: ${errorMessage}`,
        });

        throw error;
      }
    },
    [
      uploadFunction,
      onUploadProgress,
      onUploadComplete,
      onUploadError,
      showToast,
    ],
  );

  const handleUploadAll = useCallback(async () => {
    if (!uploadFunction) {
      showToast({
        type: "error",
        title: "Upload function not configured",
        message: "Please configure the upload function",
      });
      return;
    }

    const pendingFiles = files.filter((f) => f.status === "pending");
    if (pendingFiles.length === 0) return;

    setIsUploading(true);
    if (onUploadStart) {
      onUploadStart(pendingFiles.map((f) => f.file));
    }

    try {
      const uploadPromises = pendingFiles.map((fileProgress) =>
        uploadFile(fileProgress).catch((error) => ({
          error,
          file: fileProgress.file,
        })),
      );

      const results = await Promise.allSettled(uploadPromises);
      const successfulUploads = results
        .filter(
          (result): result is PromiseFulfilledResult<any> =>
            result.status === "fulfilled",
        )
        .map((result) => result.value);

      if (onAllUploadsComplete) {
        onAllUploadsComplete(successfulUploads);
      }

      showToast({
        type: "success",
        title: "Uploads completed",
        message: `${successfulUploads.length} of ${pendingFiles.length} files uploaded successfully`,
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "Upload failed",
        message: "Some uploads failed. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  }, [
    files,
    uploadFunction,
    uploadFile,
    onUploadStart,
    onAllUploadsComplete,
    showToast,
  ]);

  const handleRemoveFile = useCallback((uploadId: string) => {
    setFiles((prev) => prev.filter((f) => f.uploadId !== uploadId));
  }, []);

  const handleRetryFile = useCallback(
    async (uploadId: string) => {
      const fileProgress = files.find((f) => f.uploadId === uploadId);
      if (!fileProgress) return;

      await uploadFile(fileProgress);
    },
    [files, uploadFile],
  );

  const handleClearAll = useCallback(() => {
    setFiles([]);
  }, []);

  const pendingFilesCount = files.filter((f) => f.status === "pending").length;
  const uploadingFilesCount = files.filter(
    (f) => f.status === "uploading",
  ).length;
  const completedFilesCount = files.filter(
    (f) => f.status === "completed",
  ).length;
  const errorFilesCount = files.filter((f) => f.status === "error").length;

  return (
    <div className={classNames("file-upload", className)}>
      {/* Drop Zone */}
      <div
        className={classNames(
          "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
          isDragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}>
        <div className="space-y-4">
          <div className="text-4xl">📁</div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              Drag and drop files here
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or click to select files
            </p>
          </div>

          <div className="flex justify-center">
            <PillButton
              label="Select Files"
              onClick={() => fileInputRef.current?.click()}
              variant="primary"
              isDisabled={disabled}
            />
          </div>

          <div className="text-xs text-gray-500">
            <p>
              Maximum file size: {Math.round(maxFileSize / (1024 * 1024))}MB
            </p>
            <p>Accepted types: {acceptedTypes.join(", ")}</p>
            <p>Maximum files: {maxFiles}</p>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={allowMultiple}
        accept={acceptedTypes.join(",")}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Files ({files.length})
            </h3>
            <div className="flex items-center space-x-2">
              {pendingFilesCount > 0 && (
                <PillButton
                  label={`Upload ${pendingFilesCount} files`}
                  onClick={handleUploadAll}
                  variant="primary"
                  size="small"
                  isDisabled={disabled || isUploading}
                  isLoading={isUploading}
                />
              )}
              <PillButton
                label="Clear All"
                onClick={handleClearAll}
                variant="secondary"
                size="small"
                isDisabled={disabled || isUploading}
              />
            </div>
          </div>

          {/* Upload Summary */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Pending: {pendingFilesCount}</span>
            <span>Uploading: {uploadingFilesCount}</span>
            <span>Completed: {completedFilesCount}</span>
            {errorFilesCount > 0 && (
              <span className="text-red-600">Errors: {errorFilesCount}</span>
            )}
          </div>

          {/* Files */}
          <div className="space-y-2">
            {files.map((fileProgress) => (
              <FileItem
                key={fileProgress.uploadId}
                fileProgress={fileProgress}
                onRemove={handleRemoveFile}
                onRetry={handleRetryFile}
                disabled={disabled || isUploading}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
