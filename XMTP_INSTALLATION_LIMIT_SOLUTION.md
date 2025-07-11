# XMTP Installation Limit Error - Solution Guide

## Problem

You're encountering this error when trying to connect to XMTP:

```
Cannot register a new installation because the InboxID f0bc8cf501c1ede6661fe5beff7b1ffce4c946116ae39d921454d48987995573 has already registered 5/5 installations. Please revoke existing installations first.
```

## What This Means

XMTP V3 has a security limitation that allows a maximum of **5 installations** per wallet address (InboxID). This prevents abuse and ensures network stability. During development and testing, it's common to hit this limit.

## Solutions (in order of preference)

### 1. Clear Local Data (Recommended for Development)

The easiest solution for development is to clear your local XMTP data:

1. **Using the UI**: When you encounter the error, click the "Clear Local Data" button in the error dialog
2. **Manual**: Clear your browser's IndexedDB and localStorage for the XMTP app
3. **Code**: The app now includes automatic error handling with a recovery option

### 2. Use a Different Wallet Address

For testing purposes, you can:

- Switch to a different wallet address that hasn't hit the limit
- Use a test wallet specifically for development
- Create a new wallet for testing

### 3. Contact XMTP Support (for Production)

If you need to revoke old installations in production:

- Join the [XMTP Discord](https://discord.gg/xmtp)
- Contact the XMTP team for help with installation revocation
- Note: Installation revocation features are being added to the SDK

## Technical Implementation

The application now includes:

### Error Detection and Handling

- Automatic detection of installation limit errors
- Enhanced error messages with helpful solutions
- Graceful error boundaries that don't crash the app

### Recovery Methods

- `handleInstallationLimitError()`: Clears local data and resets client state
- `clearLocalData()`: Removes IndexedDB and localStorage data
- User-friendly error UI with recovery options

### New Features Added

- **ErrorBoundary Component**: Displays helpful error messages and recovery options
- **Installation Management**: Placeholder methods for future installation revocation
- **Enhanced Error Messages**: Clear explanations and actionable solutions

## Code Changes Made

1. **Updated `useXmtpV3Client` hook**:
   - Added installation limit error detection
   - Added methods to clear local data
   - Enhanced error handling with recovery options

2. **Updated `useInitXmtpClientV3` hook**:
   - Added error state management
   - Added installation limit recovery methods
   - Better error handling during initialization

3. **Updated `XmtpV3Provider` context**:
   - Exposed error state and recovery methods
   - Made error handling available throughout the app

4. **Created `ErrorBoundary` component**:
   - Displays installation limit errors with solutions
   - Provides clear recovery actions
   - Handles different types of errors gracefully

5. **Updated main app page**:
   - Shows error boundary when installation limit is reached
   - Provides clear recovery options to users

## How to Use

1. **When you encounter the error**: The app will automatically show a helpful error dialog
2. **Click "Clear Local Data"**: This will clear your local XMTP data
3. **Try connecting again**: You should now be able to connect successfully
4. **For persistent issues**: Try using a different wallet address for testing

## Best Practices for Development

1. **Use test wallets**: Don't use your main wallet for heavy testing
2. **Clear data regularly**: If you're doing lots of testing, clear local data periodically
3. **Monitor installation count**: Keep track of how many installations you've used
4. **Use different addresses**: Rotate between different test addresses

## Future Improvements

The XMTP team is working on:

- Installation revocation through the SDK
- Better installation management tools
- Higher limits for development environments
- More granular installation control

## Support

If you continue to have issues:

- Check the [XMTP Documentation](https://docs.xmtp.org/)
- Join the [XMTP Discord](https://discord.gg/xmtp)
- Open an issue on the [XMTP GitHub](https://github.com/xmtp)

---

**Note**: This solution is specifically for development and testing. For production applications, you should implement proper installation management and work with the XMTP team for any installation revocation needs.
