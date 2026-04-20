"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const segmentLabels: Record<string, string> = {
  events: "Events",
  participants: "Participants",
  snacks: "Snacks",
  workflow: "Workflow",
  order: "Order",
  embeddings: "Embedding Map",
};

const singularLabels: Record<string, string> = {
  events: "Event",
  participants: "Participant",
  snacks: "Snack",
};

function isId(segment: string): boolean {
  return segment.length > 8 && !segmentLabels[segment];
}

export function DynamicBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  type BreadcrumbEntry = { label: string; href: string; isLast: boolean };
  const items: BreadcrumbEntry[] = [{ label: "Home", href: "/", isLast: segments.length === 0 }];

  segments.forEach((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const isLast = index === segments.length - 1;

    if (isId(segment)) {
      const parentSegment = segments[index - 1];
      const label = singularLabels[parentSegment] ?? segment;
      items.push({ label, href, isLast });
    } else {
      const label = segmentLabels[segment] ?? segment;
      items.push({ label, href, isLast });
    }
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <React.Fragment key={item.href}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
