import { useState, useCallback } from "react";

function useDragAndDrop(onDropCallback) {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState([]);

    const handleDragOver = useCallback((event) => {
        event.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((event) => {
        event.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (event) => {
            event.preventDefault();
            setIsDragging(false);

            const droppedFiles = Array.from(event.dataTransfer.files);
            setFiles(droppedFiles);

            if (onDropCallback) {
                onDropCallback(droppedFiles);
            }
        },
        [onDropCallback]
    );

    const handleFileInputClick = () => {
        document.getElementById("file-upload-input").click();
    };

    const handleFileSelect = (event) => {
        const selectedFiles = Array.from(event.target.files);
        setFiles(selectedFiles);

        if (onDropCallback) {
            onDropCallback(selectedFiles);
        }
    };

    return {
        isDragging,
        files,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handleFileInputClick,
        handleFileSelect,
    };
}

export default useDragAndDrop;
