"use client";

import IssueArticleClient from "@/app/(site)/common-issues/[category]/[slug]/IssueArticleClient";
import { useRouteData } from "@/components/site/RouteDataContext";
import type { CommonIssueDetail } from "@/data/commonIssuesData";

export type CommonIssueRouteData = { issue: CommonIssueDetail; related: CommonIssueDetail[] };

/** Data block: the common-issue article (troubleshooting, repair options, related articles) being viewed. */
export function CommonIssueSection() {
  const data = useRouteData<CommonIssueRouteData>("common-issue");
  if (!data) {
    return (
      <div className="mx-auto my-10 max-w-xl rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
        The common-issue article appears here. It shows the article being viewed.
      </div>
    );
  }
  return <IssueArticleClient issue={data.issue} relatedIssues={data.related} withFooter={false} />;
}
