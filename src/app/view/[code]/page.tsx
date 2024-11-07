"use client";

//! Keep tryna fix this shit

import { useState, useEffect, use } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface ErrorBoundary {
  isError: boolean;
  errorMessage: string;
}

function isErrorBoundary(obj: any): obj is ErrorBoundary {
  return (
    obj && typeof obj === "object" && "isError" in obj && obj.isError === true
  );
}

export default function Page({ params }: { params: Promise<any> }) {
  const resolvedParams = use(params);
  const resolvedCode = resolvedParams.code;

  const { toast } = useToast();

  const [query, setQuery] = useState("");
  const [countries, setCountries] = useState([]);
  const [activeFiltered, setActiveFiltered] = useState([]);
  const [error, setError] = useState<{
    hasErrored: boolean;
    errorMessage: string | undefined;
  }>({ hasErrored: false, errorMessage: undefined });

  useEffect(() => {
    toast({
      title: "Loading...",
      description:
        "Dataset information is being loaded, loading speed is dependent on size of dataset, so this may take a few minutes...",
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    const filtered = countries.filter((item: any) => {
      return item.country.toLowerCase().includes(query.toLowerCase());
    });
    setActiveFiltered(filtered);
  }, [query, countries]);

  useEffect(() => {
    const controllers: AbortController[] = [];

    // fetch(`/api/returnDatasetCSVContent?code=${params.code}`, { signal })
    //   .then((res) => res.json())
    //   .then((data) => {
    //     console.log(data);
    //     fetch(`/api/returnCountries?code=${params.code}`, { signal })
    //       .then((res) => res.json())
    //       .then((data) => {
    //         setCountries(data);
    //       })
    //       .then((err: any) => {
    //         if (err.name == "AbortError") {
    //           console.log(
    //             "Request to Server on API /api/returnCountries was aborted by user."
    //           );
    //         } else {
    //           setError({
    //             hasErrored: true,
    //             errorMessage: err,
    //           });
    //         }
    //       });
    //   })
    //   .catch((err: any) => {
    //     if (err.name == "AbortError") {
    //       console.log(
    //         "Request to Server on API /api/returnDatasetCSVContent was aborted by user."
    //       );
    //     } else {
    //       setError({
    //         hasErrored: true,
    //         errorMessage: err,
    //       });
    //     }
    //   });

    const runner = async () => {
      const csv_fetch_ctr: AbortController = new AbortController();
      controllers.push(csv_fetch_ctr);

      const ds_csv = await fetch(
        `/api/returnDatasetCSVContent?code=${resolvedCode}`,
        { signal: csv_fetch_ctr.signal }
      )
        .then((res) => res.json())
        .then((data) => {
          return data;
        })
        .catch((err) => {
          if (err.name === "AbortError") {
            console.log(
              "Request to Server on API /api/returnDatasetCSVContent was aborted by user."
            );
            return { isError: true, errorMessage: err } as ErrorBoundary;
          } else if (err !== undefined) {
            console.error(err);
            setError({
              hasErrored: true,
              errorMessage: err,
            });
            return { isError: true, errorMessage: err } as ErrorBoundary;
          }
        });

      if (!isErrorBoundary(ds_csv)) {
        console.log(ds_csv);

        const country_fetch_ctr: AbortController = new AbortController();
        controllers.push(country_fetch_ctr);

        const country_data = await fetch(
          `/api/returnCountries?code=${resolvedCode}`,
          { signal: country_fetch_ctr.signal }
        )
          .then((res) => res.json())
          .then((data) => {
            return data;
          })
          .catch((err) => {
            if (err.name === "AbortError") {
              console.log(
                "Request to Server on API /api/returnCountries was aborted by user."
              );
              return { isError: true, errorMessage: err } as ErrorBoundary;
            } else if (err !== undefined) {
              console.error(err);
              setError({
                hasErrored: true,
                errorMessage: err,
              });
              return { isError: true, errorMessage: err } as ErrorBoundary;
            }
          });

        if (!isErrorBoundary(country_data)) {
          setCountries(country_data);
        }
      }
    };

    runner();

    return () => {
      controllers.forEach((ctr: AbortController) => ctr.abort());
    };
  }, [resolvedCode]);

  return (
    <div className="grid p-12">
      <div className="font-bold text-3xl">FAOSTAT Dataset: {resolvedCode}</div>
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
                <Link href={`/view/${resolvedCode}/${country.country}`}>
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
