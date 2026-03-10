"use client";

import React, { useState } from 'react';
import { Role } from "./actions";
import RolesPdfDocument from './RolesPdfDocument';
import { pdf } from '@react-pdf/renderer';
import ConfirmModal from "@/components/ConfirmModal";

interface DownloadRolesPdfProps {
    roles: Role[];
    searchQuery: string;
}

const DownloadRolesPdf: React.FC<DownloadRolesPdfProps> = ({ roles, searchQuery }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const defaultColumns = [
        { key: 'rowNumber', label: 'Row No.' },
        { key: 'id', label: 'Role Name' },
        { key: 'description', label: 'Description' },
    ];

    const handleDownload = async () => {
        const confirmed = await ConfirmModal("Download Roles to PDF?", {
            okText: "Yes, Download",
            cancelText: "Cancel",
            okColor: "bg-purple-600 hover:bg-purple-700",
        });
        if (!confirmed) return;
        setIsGenerating(true);
        try {
            const blob = await pdf(
                <RolesPdfDocument 
                    roles={roles}
                    totalCount={roles.length}
                    searchQuery={searchQuery} 
                    selectedColumns={defaultColumns} 
                />
            ).toBlob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "Roles.pdf";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            className="rounded-md bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition-colors shadow-sm whitespace-nowrap"
            disabled={isGenerating}
            title="Download PDF"
        >
            {isGenerating ? "Preparing PDF..." : "Download PDF"}
        </button>
    );
};

export default DownloadRolesPdf;
