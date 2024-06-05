'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllCategories } from "@/lib/actions/category.actions";
import { ICategory } from "@/lib/database/models/category.model";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type CategoryFilterProps = {
  initialCategory?: string;
};

const CategoryFilter = ({ initialCategory = 'All' }: CategoryFilterProps) => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchCategories = async () => {
      const categoryList = await getAllCategories();
      if (categoryList) {
        setCategories(categoryList as ICategory[]);
      }
    };

    fetchCategories();
  }, []);

  const onSelectCategory = (category: string) => {
    setSelectedCategory(category);
    const newUrl = category && category !== 'All'
      ? formUrlQuery({ params: searchParams.toString(), key: 'category', value: category })
      : removeKeysFromQuery({ params: searchParams.toString(), keysToRemove: ['category'] });

    router.push(newUrl, { scroll: false });
  };

  return (
    <Select onValueChange={onSelectCategory} value={selectedCategory}>
      <SelectTrigger className="select-field">
        <SelectValue placeholder="Category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="All" className="select-item p-regular-14">All</SelectItem>
        {categories.map((category) => (
          <SelectItem
            value={category.name}
            key={category._id as string} // Explicitly typing key as string
            className="select-item p-regular-14"
          >
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CategoryFilter;
