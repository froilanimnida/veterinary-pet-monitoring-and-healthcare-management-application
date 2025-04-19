"use client";

import { useState, useEffect } from "react";
import { Button, Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { getEducationalContent } from "@/actions/educational-content";
import type { educational_content } from "@prisma/client";
import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";

// Common emergency categories
const EMERGENCY_CATEGORIES = ["first-aid", "poisoning", "injuries", "breathing", "all"];

// Common emergency tags
const EMERGENCY_TAGS = [
    "emergency",
    "first-aid",
    "critical-care",
    "bleeding",
    "poisoning",
    "choking",
    "cpr",
    "shock",
    "wound-care",
];

const FirstAidArticles = () => {
    const [articles, setArticles] = useState<educational_content[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");

    const fetchArticles = async (category?: string) => {
        setLoading(true);
        try {
            const filters = {
                tags: EMERGENCY_TAGS,
                category: category && category !== "all" ? category : undefined,
                search: "emergency first aid",
            };

            const result = await getEducationalContent(filters);
            if (result.success && result.data?.content) {
                setArticles(result.data.content);
            }
        } catch (error) {
            console.error("Error fetching first aid articles:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles(activeTab !== "all" ? activeTab : undefined);
    }, [activeTab]);

    const renderEmergencyArticles = (articles: educational_content[]) => {
        if (loading) {
            return (
                <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading first aid information...</p>
                </div>
            );
        }

        if (articles.length === 0) {
            return (
                <div className="text-center py-8">
                    <p>No emergency information found for this category.</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {articles.map((article) => (
                    <Card key={article.content_id} className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                            <div className="flex flex-wrap gap-1 mt-2">
                                {article.tags.slice(0, 3).map((tag, index) => (
                                    <span key={index} className="inline-block bg-muted text-xs px-2 py-1 rounded-full">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-muted-foreground line-clamp-3">
                                {article.content.substring(0, 150)}...
                            </p>
                            <div className="mt-4">
                                <Link href={`/education/${article.content_uuid}`}>
                                    <Button variant="outline" className="w-full">
                                        Read More <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <div>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4 w-full justify-start flex-wrap">
                    {EMERGENCY_CATEGORIES.map((category) => (
                        <TabsTrigger key={category} value={category}>
                            {category === "all"
                                ? "All Emergency Info"
                                : category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ")}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {EMERGENCY_CATEGORIES.map((category) => (
                    <TabsContent key={category} value={category}>
                        {renderEmergencyArticles(articles)}
                    </TabsContent>
                ))}
            </Tabs>

            <div className="mt-6 text-center">
                <Link href="/education?tags=emergency,first-aid,critical-care">
                    <Button>
                        <Search className="mr-2 h-4 w-4" />
                        Browse All Emergency Resources
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default FirstAidArticles;
