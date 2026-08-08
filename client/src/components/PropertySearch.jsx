import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../constants";

const PropertySearch = () => {
    const [searchType, setSearchType] = useState("Rent");
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const buildUrl = (type, query) => {
        const params = new URLSearchParams();
        params.set("type", type.toLowerCase());
        if (query.trim()) params.set("search", query.trim());
        return `/search-for-property/${type.toLowerCase()}?${params.toString()}`;
    };

    const handleSearch = () => {
        navigate(buildUrl(searchType, searchQuery));
    };

    const handleClear = () => {
        setSearchQuery("");
        navigate(buildUrl(searchType, ""), { replace: true });
    };

    return (
        <div
            className="hero-search-bar"
            style={{
                background: C.white,
                borderRadius: 18,
                boxShadow: "0 8px 40px rgba(0,0,0,0.11)",
                padding: 8,
                display: "flex",
                alignItems: "center",
                gap: 6,
                maxWidth: 580,
            }}
        >
            <div
                className="hero-type-switcher"
                style={{
                    display: "flex",
                    background: "#F5F5F2",
                    borderRadius: 12,
                    padding: 3,
                    gap: 2,
                    flexShrink: 0,
                }}
            >
                {["Rent", "Sell"].map((type) => (
                    <button
                        key={type}
                        onClick={() => setSearchType(type)}
                        style={{
                            padding: "7px 16px",
                            borderRadius: 9,
                            border: "none",
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: "pointer",
                            transition: "all .2s",
                            background: searchType === type ? C.white : "transparent",
                            color: searchType === type ? C.ink : C.inkMuted,
                            boxShadow:
                                searchType === type ? "0 1px 6px rgba(0,0,0,0.08)" : "none",
                        }}
                    >
                        {type}
                    </button>
                ))}
            </div>

            <div style={{ flex: 1, display: "flex", alignItems: "center", minWidth: 0 }}>
                <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch();
                    }}
                    placeholder="Search city, locality or project..."
                    style={{
                        flex: 1,
                        border: "none",
                        outline: "none",
                        background: "transparent",
                        fontSize: 13,
                        color: C.ink,
                        padding: "10px 8px",
                        minWidth: 0,
                    }}
                />
                {searchQuery && (
                    <button
                        onClick={handleClear}
                        aria-label="Clear search"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            border: "none",
                            background: "#F0F0EC",
                            color: C.inkMuted,
                            cursor: "pointer",
                            flexShrink: 0,
                            marginRight: 4,
                            padding: 0,
                            transition: "background .15s, color .15s",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#E4E4DE";
                            e.currentTarget.style.color = C.ink;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#F0F0EC";
                            e.currentTarget.style.color = C.inkMuted;
                        }}
                    >
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                            <path
                                d="M1 1L11 11M11 1L1 11"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                )}
            </div>

            <button
                className="hero-search-btn"
                onClick={handleSearch}
                style={{
                    background: C.ink,
                    color: "#fff",
                    border: "none",
                    padding: "11px 22px",
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 500,
                    flexShrink: 0,
                    transition: "background .2s",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = C.gold;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = C.ink;
                }}
            >
                🔍 Search
            </button>
        </div>
    );
};

export default PropertySearch;