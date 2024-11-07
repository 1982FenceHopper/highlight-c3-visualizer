"use client";

import { useState, useEffect } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function Home() {
  const { toast } = useToast();

  const [query, setQuery] = useState("");
  const [filteredList, setFilteredList] = useState([]);
  const [list, setList] = useState([]);
  const [error, setError] = useState<{
    hasErrored: boolean;
    errorMessage: string | undefined;
  }>({ hasErrored: false, errorMessage: undefined });

  useEffect(() => {
    if (error.hasErrored == true && error.errorMessage != undefined) {
      toast({
        title: "An error has occurred.",
        description: `${error.errorMessage}`,
        variant: "destructive",
      });
    }
  }, [error.hasErrored, error.errorMessage]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const _runner = async () => {
      const data = await fetch("/api/returnData", { signal })
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          return data.Datasets.Dataset;
        })
        .catch((err) => {
          if (err.name === "AbortError") {
            console.log(
              "Request to Server on API /api/returnData was aborted by user."
            );
          } else if (err != undefined) {
            console.error(err);
            setError({
              hasErrored: true,
              errorMessage: err,
            });
          }
        });

      setList(data);
    };

    _runner();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (list != undefined) {
      const filtered = list.filter((item: any) => {
        return item.DatasetCode.toLowerCase().includes(query.toLowerCase());
      });
      setFilteredList(filtered);
    }
  }, [query, list]);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const _runner = async () => {
      const uptime = await fetch("/api/postgresTest", { signal })
        .then((res) => res.json())
        .then((data) => {
          return data.exists;
        })
        .catch((err) => {
          if (err.name === "AbortError") {
            console.log(
              "Request to Server on API /api/postgresTest was aborted by user."
            );
          } else if (err != undefined) {
            console.error(err);
            setError({
              hasErrored: true,
              errorMessage: err,
            });
          }
        });

      if (uptime == true) {
        toast({
          title: "Database Ready",
          description: "Local PostgreSQL is online.",
        });
      } else {
        toast({
          title: "Database Failure",
          description:
            "Database has failed to satisfy query, please wait for a minute for the application to automatically rectify itself, if it does not happen, then do not proceed and make a new GitHub Issue.",
        });
      }
    };

    _runner();

    return () => {
      controller.abort();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="grid p-12">
      <div className="font-bold text-3xl">FAOSTAT Dataset List</div>
      <div className="mt-2 min-w-screen border-[1px] rounded-full border-[#1f1f1f]" />
      <Input
        className="mt-4"
        placeholder="Search by FAOSTAT Code..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ScrollArea className="rounded-[5px] border-[2px] border-[#1f1f1f] max-h-[70vh] mt-4 bg-[#0d0d0d] p-4">
        {filteredList.length > 0 ? (
          filteredList.map((item: any, index: any) => (
            <div
              key={index}
              className="flex flex-wrap border-[2px] border-[#1f1f1f] rounded-md p-2 jusify-between justify-center align-center justify-items-center mb-2"
            >
              <Label htmlFor="list-item" className="w-fit h-fit grow pt-1">
                {item.DatasetName}
              </Label>
              <Label htmlFor="list-item" className="mr-2 pt-1">
                {item.DatasetCode}
              </Label>
              <div className="border-[1px] rounded-md border-[#3f3f3f]" />
              <Button
                variant="default"
                className="ml-2 w-12 h-6 rounded-sm text-[12px]"
                onClick={() => {
                  toast({
                    title: "Redirecting...",
                    description:
                      "Redirecting to dataset view, this may take a minute...",
                  });
                }}
                asChild
              >
                <Link href={`/view/${item.DatasetCode}`}>View</Link>
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
        Copyright 2024 Nashat Yafi, W/L Foundations
      </div>
    </div>
  );
}
