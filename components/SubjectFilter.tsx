"use client";

import { formUrlQuery, removeKeysFromUrlQuery } from "@jsmastery/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { subjects } from "@/constants";

const SearchInput = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("subject") || "";

  const [searchQuery, setSearchQuery] = useState(query);

  useEffect(() => {
    let newUrl = "";
    const currentParams =
      typeof window !== "undefined" ? window.location.search : "";

    if (!searchQuery || searchQuery === "all subjects") {
      newUrl = removeKeysFromUrlQuery({
        params: currentParams,
        keysToRemove: ["subject"],
      });
    } else {
      newUrl = formUrlQuery({
        params: currentParams,
        key: "subject",
        value: searchQuery,
      });
    }

    router.replace(newUrl, { scroll: false });
  }, [searchQuery, router]);

  return (
    <Select
      value={searchQuery}
      onValueChange={(value) => setSearchQuery(value ?? "")}
    >
      <SelectTrigger id="companion-subject" className="input capitalize">
        <SelectValue placeholder="Select the subject" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="all subjects">All subjects</SelectItem>
          {subjects.map((subject) => (
            <SelectItem value={subject} key={subject} className="capitalize">
              {subject}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SearchInput;
