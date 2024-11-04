"use client";

import { useState, useEffect } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function Page({ params }: { params: { code: string } }) {
  const { toast } = useToast();

  const [query, setQuery] = useState("");
  const [countries, setCountries] = useState([]);
  const [activeFiltered, setActiveFiltered] = useState([]);

  useEffect(() => {
    toast({
      title: "Loading...",
      description:
        "Dataset information is being loaded, loading speed is dependent on size of dataset, so this may take a few minutes...",
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const filtered = countries.filter((item: any) => {
      return item.country.toLowerCase().includes(query.toLowerCase());
    });
    setActiveFiltered(filtered);
  }, [query, countries]);

  useEffect(() => {
    fetch(`/api/returnDatasetCSVContent?code=${params.code}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        fetch(`/api/returnCountries?code=${params.code}`)
          .then((res) => res.json())
          .then((data) => {
            setCountries(data);
          });
      });
  }, [params.code]);

  return (
    <div className="grid p-12">
      <div className="font-bold text-3xl">FAOSTAT Dataset: {params.code}</div>
      <div className="mt-2 min-w-screen border-[1px] rounded-full border-[#1f1f1f]" />
      <Input
        className="mt-4"
        placeholder="Search by country..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ScrollArea className="rounded-[5px] border-[2px] border-[#1f1f1f] max-h-[70vh] mt-4 bg-[#0d0d0d] p-4">
        {activeFiltered.length > 0 ? (
          activeFiltered.map((country: any, index: any) => (
            <div
              key={index}
              className="flex flex-wrap border-[2px] border-[#1f1f1f] rounded-md p-2 mb-2 jusify-between justify-center align-center justify-items-center"
            >
              <Label htmlFor="list-item" className="w-fit h-fit grow pt-1">
                {country.country}
              </Label>
              <div className="border-[1px] rounded-md border-[#3f3f3f]" />
              <Button
                variant="default"
                className="ml-2 w-12 h-6 rounded-sm text-[12px]"
                onClick={() => {
                  toast({
                    title: "Redirecting...",
                    description:
                      "Redirecting to country-based dataview, this may take a few minutes...",
                  });
                }}
                asChild
              >
                <Link href={`/view/${params.code}/${country.country}`}>
                  View
                </Link>
              </Button>
            </div>
          ))
        ) : (
          <div className="flex flex-wrap border-[2px] border-[#1f1f1f] rounded-md p-2 space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        )}
      </ScrollArea>
      <div className="absolute flex top-[98%] -translate-y-[98%] text-sm text-[#3f3f3f]">
        Copyright 2024 W/L Foundation
      </div>
    </div>
  );
}
