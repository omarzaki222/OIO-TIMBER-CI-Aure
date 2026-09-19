"use client";

import { useParams } from "next/navigation";
import { CategoryForm } from "@/components/CategoryForm";

export default function EditCategoryPage() {
  const { id } = useParams<{ id: string }>();
  return <CategoryForm id={id} />;
}
