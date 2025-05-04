import { useState } from 'react';

function useCopyToClipboard() {
    const [isCopied, setIsCopied] = useState(false);
    const [error, setError] = useState(null);

    const copyToClipboard = async (text) => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                setIsCopied(true);
                setError(null);
            } else {
                throw new Error('Clipboard API not supported');
            }
        } catch (err) {
            setIsCopied(false);
            setError(err.message || 'Failed to copy');
        } finally {
            setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
        }
    };

    return { isCopied, error, copyToClipboard };
}

export default useCopyToClipboard;

