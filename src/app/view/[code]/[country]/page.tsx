"use client";

import { useEffect, useState } from "react";
import { forecast } from "@/utils/ml/runner";
import { marked } from "marked";
import DOMPurify from "dompurify";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page({
  params,
}: {
  params: { code: string; country: string };
}) {
  const { toast } = useToast();

  const [cd, setCD] = useState<any>([]);
  const [forecasts, setForecasts] = useState<any>([]);
  const [hypotheses, setHypotheses] = useState<any>([]);

  const handleYear = (year: string, add: number) => {
    if (year.includes("-")) {
      const [start, end] = year.split("-");
      const new_start = parseInt(start) + add;
      const new_end = parseInt(end) + add;
      return `${new_start}-${new_end}`;
    } else {
      return (parseInt(year) + add).toString();
    }
  };

  useEffect(() => {
    toast({
      title: "Loading...",
      description:
        "Country information is being loaded, loading speed is dependent on amount of country-specific data, so this may take a few minutes...",
    });
  }, [toast]);

  useEffect(() => {
    fetch(`/api/returnCountryData?code=${params.code}&area=${params.country}`)
      .then((res) => res.json())
      .then((data) => {
        setCD(data);
      });
  }, [params.code, params.country]);

  useEffect(() => {
    if (cd.length > 0) {
      const forecaster = async (data: any, horizon: number) => {
        try {
          for (let i = 0; i < data.length; i++) {
            const { predictions, model_used } = await forecast(
              data[i],
              horizon
            );
            setForecasts((f: any) => [
              ...f,
              {
                idx_item: data[i].idx_item,
                predictions,
                model_used,
              },
            ]);
          }
        } catch (err: any) {
          console.error(err);
        }
      };
      forecaster(cd, 5);
    }
  }, [cd]);

  useEffect(() => {
    if (forecasts.length > 0) {
      const hypothesizer = async (initial: any, predictive: any) => {
        try {
          for (let i = 0; i < predictive.length; i++) {
            const response = await fetch("/api/returnHypothesis", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                intial_data: JSON.stringify(initial[i]),
                predictive_data: JSON.stringify(predictive[i]),
                model_alg: predictive[i].model_used,
              }),
            }).then((res) => res.json());
            console.log(response);
            const sanitized = DOMPurify.sanitize(
              await marked.parse(response.client.choices[0].message.content)
            );
            setHypotheses((h: any) => [
              ...h,
              {
                idx_item: initial[i].idx_item,
                hypothesis: sanitized,
              },
            ]);
          }
        } catch (err: any) {
          console.error(err);
        }
      };
      hypothesizer(cd, forecasts);
    }
  }, [cd, forecasts]);

  // useEffect(() => {
  //   console.log(hypotheses);
  // }, [hypotheses]);

  // useEffect(() => {
  //   console.log(forecasts);
  // }, [forecasts]);

  return (
    <div className="grid p-12">
      <div className="font-bold text-3xl">
        {params.code} - {params.country.replaceAll("%20", " ")}
      </div>
      <div className="mt-2 min-w-screen border-[1px] rounded-full border-[#1f1f1f]" />
      <ScrollArea className="rounded-[5px] border-[2px] border-[#1f1f1f] max-h-[70vh] mt-4 bg-[#0d0d0d] p-4">
        {cd.length > 0 ? (
          cd.map((item: any, index: number) => (
            <Card key={index} className="mb-2">
              <CardHeader>
                <CardTitle>{item.idx_item}</CardTitle>
                <CardContent>
                  <div className="mt-4 border-[1px] border-[#414141] rounded-md p-2 bg-[#1f1f1f]">
                    <div className="font-bold">Initial Data</div>
                    {item.idx_item_data.contents.map(
                      (content: any, content_index: number) => (
                        <pre
                          key={content_index}
                          className="mt-2"
                          suppressHydrationWarning
                        >
                          {content.idx_year}: {content.idx_value}{" "}
                          {content.idx_unit}
                        </pre>
                      )
                    )}
                  </div>
                  {forecasts.length > 0 ? (
                    <div className="mt-4 border-[1px] border-[#414141] bg-[#1f1f1f] rounded-md p-2">
                      <div className="font-bold">
                        {forecasts[index].model_used} Predictive Analysis
                      </div>
                      {forecasts[index].predictions.map(
                        (prediction: number, pred_index: number) => (
                          <pre
                            key={pred_index}
                            className="mt-2"
                            suppressHydrationWarning
                          >
                            {handleYear(
                              item.idx_item_data.contents[
                                item.idx_item_data.contents.length - 1
                              ].idx_year,
                              pred_index + 1
                            )}
                            : {prediction.toFixed(3)}{" "}
                            {item.idx_item_data.contents[0].idx_unit}
                          </pre>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 border-[1px] border-[#1f1f1f] rounded-md p-2">
                      <Skeleton className="h-8 w-full" />
                    </div>
                  )}
                  <div className="mt-4 border-[1px] border-[#414141] bg-[#1f1f1f] rounded-md p-2">
                    <div className="mb-2 font-bold">Hypothesis</div>
                    {hypotheses.length > 0 ? (
                      hypotheses[index] != undefined ? (
                        <div
                          className="prose-invert"
                          dangerouslySetInnerHTML={{
                            __html: hypotheses[index].hypothesis,
                          }}
                        ></div>
                      ) : (
                        <Skeleton className="h-8 w-full" />
                      )
                    ) : (
                      <Skeleton className="h-8 w-full" />
                    )}
                  </div>
                </CardContent>
              </CardHeader>
            </Card>
          ))
        ) : (
          <div className="flex flex-wrap border-[2px] border-[#1f1f1f] rounded-md p-2 space-y-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
